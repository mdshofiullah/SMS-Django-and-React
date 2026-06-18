from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeeViewSet, FeeStructureViewSet
router = DefaultRouter()
router.register(r'structures', FeeStructureViewSet, basename='fee-structure')
router.register(r'', FeeViewSet, basename='fee')
urlpatterns = [path('', include(router.urls))]
