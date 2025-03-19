from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'tickets', views.TicketViewSet, basename='ticket')

tickets_router = routers.NestedSimpleRouter(router, r'tickets', lookup='ticket')
tickets_router.register(r'comments', views.CommentViewSet, basename='ticket-comments')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(tickets_router.urls)),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('current-user/', views.current_user, name='current-user'),
]

