from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Ticket, Comment

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type', 'password']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class CommentSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Comment
        fields = ['id', 'ticket', 'user', 'user_username', 'content', 'created_at']
        read_only_fields = ['user']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class TicketSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    created_by_username = serializers.ReadOnlyField(source='created_by.username')
    assigned_to_username = serializers.ReadOnlyField(source='assigned_to.username')
    
    class Meta:
        model = Ticket
        fields = ['id', 'title', 'description', 'status', 'created_by', 'created_by_username', 
                  'assigned_to', 'assigned_to_username', 'created_at', 'updated_at', 
                  'resolved_at', 'comments']
        read_only_fields = ['created_by']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

