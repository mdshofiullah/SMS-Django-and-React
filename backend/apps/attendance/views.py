from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from apps.accounts.permissions import IsAdminOrTeacher
from .models import Attendance
from .serializers import AttendanceSerializer, BulkAttendanceSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('student', 'course').all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAdminOrTeacher]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['student', 'course', 'date', 'status']
    ordering = ['-date']

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        serializer = BulkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        records = []
        for record in data['records']:
            obj, _ = Attendance.objects.update_or_create(
                student_id=record['student'],
                course_id=data['course'],
                date=data['date'],
                defaults={'status': record.get('status', 'present'), 'remarks': record.get('remarks', '')}
            )
            records.append(obj)
        return Response(AttendanceSerializer(records, many=True).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        student_id = request.query_params.get('student')
        course_id = request.query_params.get('course')
        qs = Attendance.objects.all()
        if student_id:
            qs = qs.filter(student_id=student_id)
        if course_id:
            qs = qs.filter(course_id=course_id)
        total = qs.count()
        present = qs.filter(status='present').count()
        absent = qs.filter(status='absent').count()
        late = qs.filter(status='late').count()
        rate = round((present / total * 100), 2) if total > 0 else 0
        return Response({'total': total, 'present': present, 'absent': absent, 'late': late, 'attendance_rate': rate})
