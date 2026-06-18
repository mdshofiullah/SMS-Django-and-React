from rest_framework import serializers
from .models import Course, Enrollment


class CourseSerializer(serializers.ModelSerializer):
    enrolled_count = serializers.ReadOnlyField()
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'

    def get_teacher_name(self, obj):
        return obj.teacher.full_name if obj.teacher else None


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.student.full_name

    def get_course_name(self, obj):
        return obj.course.name
