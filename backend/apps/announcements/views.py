from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.permissions import IsAdmin, IsAdminOrTeacher
from .models import Announcement
from .serializers import AnnouncementSerializer


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['priority', 'target', 'is_active', 'is_pinned']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'priority']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAdminOrTeacher()]
        return [IsAdmin()]
