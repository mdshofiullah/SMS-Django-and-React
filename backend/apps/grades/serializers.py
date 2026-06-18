from rest_framework import serializers
from .models import Grade


class GradeSerializer(serializers.ModelSerializer):
    percentage = serializers.ReadOnlyField()
    student_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()

    class Meta:
        model = Grade
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.student.full_name

    def get_course_name(self, obj):
        return obj.course.name
