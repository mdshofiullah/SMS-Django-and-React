from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.students.models import Student
from apps.teachers.models import Teacher
from apps.courses.models import Course, Enrollment
from apps.attendance.models import Attendance
from apps.grades.models import Grade
from apps.fees.models import Fee
from apps.announcements.models import Announcement
from django.db.models import Avg, Sum, Count


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        students = Student.objects.count()
        teachers = Teacher.objects.count()
        courses = Course.objects.filter(status='active').count()
        total_fees = Fee.objects.aggregate(t=Sum('amount'))['t'] or 0
        collected_fees = Fee.objects.aggregate(c=Sum('paid_amount'))['c'] or 0
        total_att = Attendance.objects.count()
        present_att = Attendance.objects.filter(status='present').count()
        att_rate = round(present_att / total_att * 100, 1) if total_att > 0 else 0
        avg_grade = Grade.objects.aggregate(avg=Avg('marks_obtained'))['avg'] or 0

        # Recent students
        recent_students = list(
            Student.objects.order_by('-created_at')[:5].values(
                'id', 'student_id', 'first_name', 'last_name', 'status', 'enrollment_date'
            )
        )
        # Recent announcements
        recent_announcements = list(
            Announcement.objects.filter(is_active=True).order_by('-created_at')[:5].values(
                'id', 'title', 'priority', 'created_at'
            )
        )
        # Monthly enrollments (last 6 months simulation)
        enrollment_data = [
            {'month': 'Jan', 'students': 12},
            {'month': 'Feb', 'students': 19},
            {'month': 'Mar', 'students': 15},
            {'month': 'Apr', 'students': 25},
            {'month': 'May', 'students': 22},
            {'month': 'Jun', 'students': students},
        ]
        return Response({
            'kpis': {
                'total_students': students,
                'total_teachers': teachers,
                'active_courses': courses,
                'attendance_rate': att_rate,
                'total_fees': float(total_fees),
                'collected_fees': float(collected_fees),
                'avg_grade': round(float(avg_grade), 1),
                'collection_rate': round(float(collected_fees)/float(total_fees)*100, 1) if total_fees > 0 else 0,
            },
            'recent_students': recent_students,
            'recent_announcements': recent_announcements,
            'enrollment_trend': enrollment_data,
        })
