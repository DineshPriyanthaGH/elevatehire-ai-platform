from django.shortcuts import render
from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'message': 'User created successfully',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login user with email or username"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        email_or_username = serializer.validated_data['email_or_username']
        password = serializer.validated_data['password']
        
        # Use custom authentication backend that supports email or username
        user = authenticate(request, username=email_or_username, password=password)
        
        if user and user.is_active:
            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })
        return Response({
            'success': False,
            'error': 'Invalid email/username or password'
        }, status=status.HTTP_401_UNAUTHORIZED)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def profile(request):
    """Get user profile"""
    return Response({
        'success': True,
        'user': UserSerializer(request.user).data
    })

@api_view(['GET'])
def dashboard(request):
    """Get dashboard data"""
    return Response({
        'success': True,
        'message': f'Welcome to your dashboard, {request.user.first_name}!',
        'user': UserSerializer(request.user).data,
        'dashboard_data': {
            'total_interviews': 0,
            'pending_reviews': 0,
            'recent_activity': []
        }
    })

@api_view(['POST'])
def logout(request):
    """Logout user"""
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({
            'success': True,
            'message': 'Logged out successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': 'Invalid token'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def users(request):
    """Get list of users that can be interviewers"""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    # Get search parameter
    search = request.query_params.get('search', '')
    
    # Get active users who can be interviewers
    users_queryset = User.objects.filter(is_active=True)
    
    # Apply search filter if provided
    if search:
        users_queryset = users_queryset.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search) |
            Q(username__icontains=search)
        )
    
    # Order by name
    users_queryset = users_queryset.order_by('first_name', 'last_name')
    
    # Serialize users data
    users_data = []
    for user in users_queryset:
        users_data.append({
            'id': str(user.id),
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.get_full_name() or user.username,
            'email': user.email
        })
    
    return Response(users_data)

@api_view(['POST'])
@permission_classes([AllowAny])
def debug_user(request):
    """Debug endpoint to check if user exists"""
    email_or_username = request.data.get('email_or_username', '')
    
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        if '@' in email_or_username:
            user = User.objects.get(email=email_or_username)
        else:
            user = User.objects.get(username=email_or_username)
            
        return Response({
            'success': True,
            'user_found': True,
            'user_data': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_active': user.is_active,
                'date_joined': user.date_joined
            }
        })
    except User.DoesNotExist:
        return Response({
            'success': True,
            'user_found': False,
            'message': f'No user found with email/username: {email_or_username}'
        })
