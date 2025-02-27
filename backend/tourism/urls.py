from django.urls import path
from .views import (
    SpotListCreateAPIView, SpotRetrieveUpdateDestroyAPIView,
    RouteListCreateAPIView, RouteRetrieveUpdateDestroyAPIView,
    CategoryListCreateAPIView, CategoryRetrieveUpdateDestroyAPIView
)

urlpatterns = [
    path('spots/', SpotListCreateAPIView.as_view(), name='spot-list-create'),
    path('spots/<int:pk>/', SpotRetrieveUpdateDestroyAPIView.as_view(), name='spot-detail'),
    path('routes/', RouteListCreateAPIView.as_view(), name='route-list-create'),
    path('routes/<int:pk>/', RouteRetrieveUpdateDestroyAPIView.as_view(), name='route-detail'),
    path('categories/', CategoryListCreateAPIView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryRetrieveUpdateDestroyAPIView.as_view(), name='category-detail'),
]