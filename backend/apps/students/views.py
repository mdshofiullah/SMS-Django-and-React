from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.permissions import IsAdmin, IsAdminOrTeacher, IsStudentOwnerOrStaff
from .models import Student
from .serializers import StudentSerializer, StudentListSerializer


class StudentViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'gender', 'section']
    search_fields = ['student_id', 'first_name', 'last_name', 'email', 'roll_number']
    ordering_fields = ['student_id', 'first_name', 'enrollment_date']
    ordering = ['student_id']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Student.objects.none()
        if user.role == 'student':
            return Student.objects.filter(user=user)
        return Student.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return StudentListSerializer
        return StudentSerializer

    def get_permissions(self):
        if self.action == 'retrieve':
            return [IsStudentOwnerOrStaff()]
        elif self.action == 'list':
            return [IsAdminOrTeacher()]
        return [IsAdmin()]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Student.objects.count()
        active = Student.objects.filter(status='active').count()
        inactive = Student.objects.filter(status='inactive').count()
        graduated = Student.objects.filter(status='graduated').count()
        return Response({
            'total': total,
            'active': active,
            'inactive': inactive,
            'graduated': graduated,
        })
