from django.db import models
from apps.students.models import Student
from apps.courses.models import Course


class Grade(models.Model):
    GRADE_CHOICES = [
        ('A+', 'A+'), ('A', 'A'), ('A-', 'A-'),
        ('B+', 'B+'), ('B', 'B'), ('B-', 'B-'),
        ('C+', 'C+'), ('C', 'C'), ('C-', 'C-'),
        ('D', 'D'), ('F', 'F'),
    ]
    EXAM_TYPE_CHOICES = [
        ('midterm', 'Midterm'), ('final', 'Final'),
        ('quiz', 'Quiz'), ('assignment', 'Assignment'), ('project', 'Project'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='grades')
    exam_type = models.CharField(max_length=20, choices=EXAM_TYPE_CHOICES)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    total_marks = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    grade = models.CharField(max_length=3, choices=GRADE_CHOICES, blank=True)
    remarks = models.TextField(blank=True)
    exam_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'grades'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student} - {self.course} - {self.exam_type}: {self.marks_obtained}/{self.total_marks}"

    @property
    def percentage(self):
        if self.total_marks > 0:
            return round(float(self.marks_obtained) / float(self.total_marks) * 100, 2)
        return 0

    def save(self, *args, **kwargs):
        pct = self.percentage
        if pct >= 95: self.grade = 'A+'
        elif pct >= 90: self.grade = 'A'
        elif pct >= 85: self.grade = 'A-'
        elif pct >= 80: self.grade = 'B+'
        elif pct >= 75: self.grade = 'B'
        elif pct >= 70: self.grade = 'B-'
        elif pct >= 65: self.grade = 'C+'
        elif pct >= 60: self.grade = 'C'
        elif pct >= 55: self.grade = 'C-'
        elif pct >= 50: self.grade = 'D'
        else: self.grade = 'F'
        super().save(*args, **kwargs)
