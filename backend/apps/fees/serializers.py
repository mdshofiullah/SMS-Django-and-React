from rest_framework import serializers
from .models import Fee, FeeStructure


class FeeStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeStructure
        fields = '__all__'


class FeeSerializer(serializers.ModelSerializer):
    balance = serializers.ReadOnlyField()
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Fee
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.student.full_name
