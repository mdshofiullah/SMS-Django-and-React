from django.db import models
from apps.accounts.models import User


class Announcement(models.Model):
    PRIORITY_CHOICES = [('low', 'Low'), ('medium', 'Medium'), ('high', 'High')]
    TARGET_CHOICES = [('all', 'All'), ('students', 'Students'), ('teachers', 'Teachers'), ('parents', 'Parents')]

    title = models.CharField(max_length=300)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='announcements')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    target = models.CharField(max_length=10, choices=TARGET_CHOICES, default='all')
    is_pinned = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'announcements'
        ordering = ['-is_pinned', '-created_at']

    def __str__(self):
        return self.title
