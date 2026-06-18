from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg
from apps.accounts.permissions import IsAdminOrTeacher
from .models import Grade
from .serializers import GradeSerializer


class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.select_related('student', 'course').all()
    serializer_class = GradeSerializer
    permission_classes = [IsAdminOrTeacher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['student', 'course', 'exam_type', 'grade']
    search_fields = ['student__first_name', 'student__last_name', 'course__name']
    ordering_fields = ['marks_obtained', 'exam_date', 'created_at']

    @action(detail=False, methods=['get'])
    def report(self, request):
        student_id = request.query_params.get('student')
        qs = Grade.objects.all()
        if student_id:
            qs = qs.filter(student_id=student_id)
        avg = qs.aggregate(avg=Avg('marks_obtained'))['avg'] or 0
        by_course = {}
        for grade in qs.select_related('course'):
            cname = grade.course.name
            if cname not in by_course:
                by_course[cname] = []
            by_course[cname].append(float(grade.marks_obtained))
        course_avgs = {k: round(sum(v)/len(v), 2) for k, v in by_course.items()}
        return Response({'average': round(avg, 2), 'by_course': course_avgs})
