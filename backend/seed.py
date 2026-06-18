import os
import sys
import django
import datetime

# Set up django environment
sys.path.append('D:\\student-management-system\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.students.models import Student
from apps.teachers.models import Teacher
from apps.courses.models import Course, Enrollment
from apps.attendance.models import Attendance
from apps.grades.models import Grade
from apps.fees.models import Fee, FeeStructure
from apps.announcements.models import Announcement

User = get_user_model()

def seed_data():
    print("Seeding database...")
    
    # 1. Create users
    admin_user, _ = User.objects.get_or_create(
        email='admin@school.com',
        defaults={
            'first_name': 'Sarah',
            'last_name': 'Connor',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
            'phone': '1234567890'
        }
    )
    admin_user.set_password('admin123')
    admin_user.save()
    
    teacher_user_1, _ = User.objects.get_or_create(
        email='teacher1@school.com',
        defaults={
            'first_name': 'John',
            'last_name': 'Doe',
            'role': 'teacher',
            'phone': '9876543210'
        }
    )
    teacher_user_1.set_password('teacher123')
    teacher_user_1.save()

    teacher_user_2, _ = User.objects.get_or_create(
        email='teacher2@school.com',
        defaults={
            'first_name': 'Emily',
            'last_name': 'Smith',
            'role': 'teacher',
            'phone': '5556667777'
        }
    )
    teacher_user_2.set_password('teacher123')
    teacher_user_2.save()

    # Create Teacher Profiles
    t1, _ = Teacher.objects.get_or_create(
        teacher_id='TCH001',
        defaults={
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'teacher1@school.com',
            'phone': '9876543210',
            'gender': 'M',
            'qualification': 'M.Sc. in Physics',
            'specialization': 'Quantum Physics',
            'experience_years': 8,
            'status': 'active',
            'salary': 5000.00
        }
    )
    
    t2, _ = Teacher.objects.get_or_create(
        teacher_id='TCH002',
        defaults={
            'first_name': 'Emily',
            'last_name': 'Smith',
            'email': 'teacher2@school.com',
            'phone': '5556667777',
            'gender': 'F',
            'qualification': 'Ph.D. in Computer Science',
            'specialization': 'Software Engineering',
            'experience_years': 5,
            'status': 'active',
            'salary': 6200.00
        }
    )

    # Create Students & their users
    students_data = [
        ('STU001', 'Alex', 'Mercer', 'alex@school.com', 'M', '2005-04-12', 'A+', '123 Pine St', 'NY', 'A', '101', 'Peter Mercer', '111-222-3333', 'peter@school.com'),
        ('STU002', 'Bella', 'Swan', 'bella@school.com', 'F', '2006-08-22', 'O-', '456 Oak Rd', 'NY', 'A', '102', 'Charlie Swan', '222-333-4444', 'charlie@school.com'),
        ('STU003', 'Chris', 'Evans', 'chris@school.com', 'M', '2005-11-30', 'B+', '789 Maple Ave', 'NY', 'B', '201', 'Robert Evans', '333-444-5555', 'robert@school.com'),
        ('STU004', 'Diana', 'Prince', 'diana@school.com', 'F', '2006-01-15', 'AB+', '321 Elm St', 'NY', 'B', '202', 'Hippolyta Prince', '444-555-6666', 'hippolyta@school.com'),
    ]

    students = []
    for s_id, f_name, l_name, email, gen, dob, bg, addr, city, sec, roll, p_name, p_phone, p_email in students_data:
        # Create student user
        su, _ = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': f_name,
                'last_name': l_name,
                'role': 'student',
                'phone': p_phone
            }
        )
        su.set_password('student123')
        su.save()

        # Create student profile
        s, _ = Student.objects.get_or_create(
            student_id=s_id,
            defaults={
                'user': su,
                'first_name': f_name,
                'last_name': l_name,
                'email': email,
                'phone': p_phone,
                'gender': gen,
                'date_of_birth': datetime.datetime.strptime(dob, '%Y-%m-%d').date(),
                'blood_group': bg,
                'address': addr,
                'city': city,
                'section': sec,
                'roll_number': roll,
                'parent_name': p_name,
                'parent_phone': p_phone,
                'parent_email': p_email,
                'status': 'active'
            }
        )
        students.append(s)

    # 3. Create Courses
    c1, _ = Course.objects.get_or_create(
        course_code='PHYS101',
        defaults={
            'name': 'Introduction to Quantum Physics',
            'description': 'An introductory course on mechanics, waves, and quantum phenomena.',
            'teacher': t1,
            'credits': 4,
            'max_students': 30,
            'status': 'active',
            'start_date': datetime.date(2026, 1, 15),
            'end_date': datetime.date(2026, 6, 15),
        }
    )

    c2, _ = Course.objects.get_or_create(
        course_code='CS201',
        defaults={
            'name': 'Data Structures & Algorithms',
            'description': 'Advanced course in system performance, sorting, graphs, and dynamic programming.',
            'teacher': t2,
            'credits': 3,
            'max_students': 40,
            'status': 'active',
            'start_date': datetime.date(2026, 1, 15),
            'end_date': datetime.date(2026, 6, 15),
        }
    )

    # Enroll Students
    for s in students:
        Enrollment.objects.get_or_create(student=s, course=c1)
        Enrollment.objects.get_or_create(student=s, course=c2)

    # 4. Create Attendance records
    today = datetime.date.today()
    for i in range(5):
        date = today - datetime.timedelta(days=i)
        # Skip weekends
        if date.weekday() >= 5:
            continue
        for s in students:
            # Random status
            status = 'present' if s.id % 3 != 0 else 'absent' if s.id % 4 == 0 else 'late'
            Attendance.objects.get_or_create(
                student=s,
                course=c1,
                date=date,
                defaults={'status': status, 'remarks': 'Daily checkin'}
            )
            Attendance.objects.get_or_create(
                student=s,
                course=c2,
                date=date,
                defaults={'status': 'present', 'remarks': 'Regular attendance'}
            )

    # 5. Create Grades
    for s in students:
        # Physics grades
        Grade.objects.get_or_create(
            student=s,
            course=c1,
            exam_type='midterm',
            defaults={
                'marks_obtained': 80.00 + (s.id * 3) % 20,
                'total_marks': 100.00,
                'remarks': 'Good progress',
                'exam_date': today - datetime.timedelta(days=20)
            }
        )
        Grade.objects.get_or_create(
            student=s,
            course=c1,
            exam_type='quiz',
            defaults={
                'marks_obtained': 9.00 if s.id % 2 == 0 else 7.50,
                'total_marks': 10.00,
                'remarks': 'Classroom quiz',
                'exam_date': today - datetime.timedelta(days=10)
            }
        )
        # CS grades
        Grade.objects.get_or_create(
            student=s,
            course=c2,
            exam_type='midterm',
            defaults={
                'marks_obtained': 85.00 + (s.id * 2) % 15,
                'total_marks': 100.00,
                'remarks': 'Very analytical',
                'exam_date': today - datetime.timedelta(days=15)
            }
        )

    # 6. Fee Structures & Fees
    fs1, _ = FeeStructure.objects.get_or_create(
        name='Tuition Fee 2026',
        defaults={'amount': 1500.00, 'description': 'Standard semester tuition fee', 'is_active': True}
    )
    fs2, _ = FeeStructure.objects.get_or_create(
        name='Library & Lab Fee',
        defaults={'amount': 250.00, 'description': 'Access to computer labs and main library resources', 'is_active': True}
    )

    for s in students:
        # Assign fees
        Fee.objects.get_or_create(
            student=s,
            fee_structure=fs1,
            title='Tuition Fee - Sem 1',
            defaults={
                'amount': 1500.00,
                'paid_amount': 1500.00 if s.id % 2 == 0 else 0,
                'status': 'paid' if s.id % 2 == 0 else 'pending',
                'due_date': today + datetime.timedelta(days=30),
            }
        )
        Fee.objects.get_or_create(
            student=s,
            fee_structure=fs2,
            title='Library & Lab - Sem 1',
            defaults={
                'amount': 250.00,
                'paid_amount': 250.00,
                'status': 'paid',
                'due_date': today - datetime.timedelta(days=5),
                'paid_date': today - datetime.timedelta(days=8),
                'payment_method': 'card',
                'transaction_id': f'TXN1000{s.id}'
            }
        )

    # 7. Announcements
    Announcement.objects.get_or_create(
        title='Welcome to the new Semester 2026!',
        defaults={
            'content': 'We are excited to welcome all new and returning students to campus. Please make sure to clear outstanding tuition fees before registration closes.',
            'author': admin_user,
            'priority': 'high',
            'target': 'all',
            'is_pinned': True,
            'is_active': True
        }
    )
    Announcement.objects.get_or_create(
        title='Midterm Exam Guidelines',
        defaults={
            'content': 'Ensure you carry your physical student ID cards to the exam hall. Mobile phones are strictly prohibited.',
            'author': admin_user,
            'priority': 'medium',
            'target': 'students',
            'is_pinned': False,
            'is_active': True
        }
    )
    Announcement.objects.get_or_create(
        title='Faculty Meeting on Friday',
        defaults={
            'content': 'There is a scheduled staff meeting in the main conference room at 3:00 PM to discuss the upcoming curriculum updates.',
            'author': admin_user,
            'priority': 'low',
            'target': 'teachers',
            'is_pinned': False,
            'is_active': True
        }
    )

    print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed_data()
