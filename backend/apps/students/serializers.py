from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Student
        fields = '__all__'


class StudentListSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Student
        fields = ['id', 'student_id', 'first_name', 'last_name', 'full_name',
                  'email', 'phone', 'gender', 'status', 'section', 'roll_number',
                  'enrollment_date', 'parent_name', 'parent_phone']
