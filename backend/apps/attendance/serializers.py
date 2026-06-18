from rest_framework import serializers
from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.student.full_name

    def get_course_name(self, obj):
        return obj.course.name


class BulkAttendanceSerializer(serializers.Serializer):
    course = serializers.IntegerField()
    date = serializers.DateField()
    records = serializers.ListField(child=serializers.DictField())
