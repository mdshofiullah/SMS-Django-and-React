from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsAdmin, IsAdminOrTeacher
from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related('teacher').all()
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'teacher']
    search_fields = ['course_code', 'name', 'description']
    ordering_fields = ['course_code', 'name', 'created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdmin()]

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        course = self.get_object()
        student_id = request.data.get('student_id')
        if not student_id:
            return Response({'error': 'student_id required'}, status=status.HTTP_400_BAD_REQUEST)
        enrollment, created = Enrollment.objects.get_or_create(student_id=student_id, course=course)
        if not created:
            return Response({'error': 'Student already enrolled'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='unenroll/(?P<student_id>[^/.]+)')
    def unenroll(self, request, pk=None, student_id=None):
        Enrollment.objects.filter(course_id=pk, student_id=student_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response({
            'total': Course.objects.count(),
            'active': Course.objects.filter(status='active').count(),
            'total_enrollments': Enrollment.objects.count(),
        })


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student', 'course']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Enrollment.objects.none()
        if user.role == 'student':
            return Enrollment.objects.filter(student__user=user)
        return Enrollment.objects.select_related('student', 'course').all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminOrTeacher()]
