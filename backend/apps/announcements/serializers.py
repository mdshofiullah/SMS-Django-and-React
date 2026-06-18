from rest_framework import serializers
from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ['author']

    def get_author_name(self, obj):
        return obj.author.full_name if obj.author else 'System'

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
