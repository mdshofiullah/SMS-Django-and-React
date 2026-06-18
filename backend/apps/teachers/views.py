from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.accounts.permissions import IsAdmin, IsAdminOrTeacher, IsTeacherOwnerOrStaff
from .models import Teacher
from .serializers import TeacherSerializer


class TeacherViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'gender']
    search_fields = ['teacher_id', 'first_name', 'last_name', 'email', 'specialization']
    ordering_fields = ['teacher_id', 'first_name', 'joining_date']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Teacher.objects.none()
        if user.role == 'teacher':
            return Teacher.objects.filter(email=user.email)
        return Teacher.objects.all()

    def get_permissions(self):
        if self.action == 'retrieve':
            return [IsTeacherOwnerOrStaff()]
        elif self.action == 'list':
            return [IsAdminOrTeacher()]
        return [IsAdmin()]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response({
            'total': Teacher.objects.count(),
            'active': Teacher.objects.filter(status='active').count(),
            'on_leave': Teacher.objects.filter(status='on_leave').count(),
        })
