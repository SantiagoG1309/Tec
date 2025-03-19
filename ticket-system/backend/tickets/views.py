from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from django.contrib.auth import authenticate, login, logout
from django.db.models import Count, Avg, F, ExpressionWrapper, fields
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

from .models import Ticket, Comment
from .serializers import UserSerializer, TicketSerializer, CommentSerializer

User = get_user_model()

class IsAdminOrDirector(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type in ['admin', 'director']

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'admin'

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            # Allow anyone to register as a client
            return [permissions.AllowAny()]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            # Only admin or director can manage users
            return [IsAdminOrDirector()]
        return [permissions.IsAuthenticated()]
    
    def create(self, request, *args, **kwargs):
        # Check if user is trying to register as something other than client
        if 'user_type' in request.data and request.data['user_type'] != 'client':
            # Only admin or director can create non-client users
            if not request.user.is_authenticated or request.user.user_type not in ['admin', 'director']:
                return Response(
                    {"detail": "No tienes permiso para crear este tipo de usuario."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Directors can only create employees
            if request.user.user_type == 'director' and request.data['user_type'] not in ['employee']:
                return Response(
                    {"detail": "Los directores solo pueden crear empleados."},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return super().create(request, *args, **kwargs)

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin and Director can see all tickets
        if user.user_type in ['admin', 'director']:
            return Ticket.objects.all()
        
        # Employees can see tickets assigned to them
        elif user.user_type == 'employee':
            return Ticket.objects.filter(assigned_to=user)
        
        # Clients can see tickets created by them
        else:
            return Ticket.objects.filter(created_by=user)
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            # Check permissions in the update method
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]
    
    def update(self, request, *args, **kwargs):
        ticket = self.get_object()
        user = request.user
        
        # Check if user has permission to update this ticket
        if user.user_type in ['admin', 'director']:
            # Admin and Director can update any ticket
            pass
        elif user.user_type == 'employee' and ticket.assigned_to == user:
            # Employees can only update tickets assigned to them
            # And they can only update status and add comments
            allowed_fields = ['status']
            for field in request.data:
                if field not in allowed_fields and field in ticket.__dict__:
                    if getattr(ticket, field) != request.data[field]:
                        return Response(
                            {"detail": f"No tienes permiso para modificar el campo {field}."},
                            status=status.HTTP_403_FORBIDDEN
                        )
        elif user.user_type == 'client' and ticket.created_by == user:
            # Clients can only add comments to their tickets
            return Response(
                {"detail": "Los clientes no pueden actualizar tickets, solo añadir comentarios."},
                status=status.HTTP_403_FORBIDDEN
            )
        else:
            return Response(
                {"detail": "No tienes permiso para actualizar este ticket."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # If status is being changed to 'resolved', set resolved_at
        if 'status' in request.data and request.data['status'] == 'resolved' and ticket.status != 'resolved':
            request.data['resolved_at'] = timezone.now()
        
        return super().update(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        if request.user.user_type not in ['admin', 'director']:
            return Response(
                {"detail": "No tienes permiso para ver estas estadísticas."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get all tickets
        tickets = Ticket.objects.all()
        
        # Count tickets by status
        status_counts = tickets.values('status').annotate(count=Count('id'))
        
        # Calculate average resolution time for resolved tickets
        resolved_tickets = tickets.filter(status='resolved', resolved_at__isnull=False)
        avg_resolution_time = resolved_tickets.annotate(
            resolution_time=ExpressionWrapper(
                F('resolved_at') - F('created_at'),
                output_field=fields.DurationField()
            )
        ).aggregate(avg=Avg('resolution_time'))
        
        # Get tickets created in the last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_tickets = tickets.filter(created_at__gte=thirty_days_ago)
        recent_count = recent_tickets.count()
        
        # Get employee performance
        employee_performance = []
        employees = User.objects.filter(user_type='employee')
        for employee in employees:
            assigned_tickets = tickets.filter(assigned_to=employee)
            resolved_tickets = assigned_tickets.filter(status='resolved')
            avg_time = resolved_tickets.annotate(
                resolution_time=ExpressionWrapper(
                    F('resolved_at') - F('created_at'),
                    output_field=fields.DurationField()
                )
            ).aggregate(avg=Avg('resolution_time'))
            
            employee_performance.append({
                'id': employee.id,
                'username': employee.username,
                'full_name': f"{employee.first_name} {employee.last_name}",
                'assigned_count': assigned_tickets.count(),
                'resolved_count': resolved_tickets.count(),
                'avg_resolution_time': avg_time['avg'].total_seconds() if avg_time['avg'] else 0
            })
        
        return Response({
            'total_tickets': tickets.count(),
            'status_counts': status_counts,
            'avg_resolution_time': avg_resolution_time['avg'].total_seconds() if avg_resolution_time['avg'] else 0,
            'recent_tickets': recent_count,
            'employee_performance': employee_performance
        })

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    
    def get_queryset(self):
        return Comment.objects.filter(ticket_id=self.kwargs['ticket_pk'])
    
    def create(self, request, *args, **kwargs):
        ticket_id = self.kwargs['ticket_pk']
        try:
            ticket = Ticket.objects.get(pk=ticket_id)
        except Ticket.DoesNotExist:
            return Response(
                {"detail": "Ticket no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user has permission to comment on this ticket
        user = request.user
        if user.user_type in ['admin', 'director']:
            # Admin and Director can comment on any ticket
            pass
        elif user.user_type == 'employee' and ticket.assigned_to == user:
            # Employees can comment on tickets assigned to them
            pass
        elif user.user_type == 'client' and ticket.created_by == user:
            # Clients can comment on their own tickets
            pass
        else:
            return Response(
                {"detail": "No tienes permiso para comentar en este ticket."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user, ticket_id=ticket_id)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'user_type': user.user_type
        })
    else:
        return Response(
            {"detail": "Credenciales inválidas."},
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"detail": "Sesión cerrada correctamente."})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'user_type': user.user_type
    })

