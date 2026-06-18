import React, { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/layout/Navbar';
import { Plus, Search, Percent } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Grades = () => {
  const { user } = useAuthStore();
  const [grades, setGrades] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    student: '',
    course: '',
    exam_type: 'midterm',
    marks_obtained: '',
    total_marks: 100,
    remarks: '',
    exam_date: new Date().toISOString().split('T')[0]
  });

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCourse) params.course = selectedCourse;
      const res = await api.get('grades/', { params });
      setGrades(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching grades:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const coursesRes = await api.get('courses/');
      setCourses(coursesRes.data.results || coursesRes.data);
      
      const studentsRes = await api.get('students/');
      setStudents(studentsRes.data.results || studentsRes.data);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [selectedCourse]);

  const handleOpenModal = () => {
    setFormData({
      student: students[0]?.id || '',
      course: courses[0]?.id || '',
      exam_type: 'midterm',
      marks_obtained: '',
      total_marks: 100,
      remarks: '',
      exam_date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('grades/', formData);
      fetchGrades();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving grade:', err);
      alert('Failed to submit grade record. Verify input fields.');
    }
  };

  const isTeacherOrAdmin = ['admin', 'teacher'].includes(user?.role);

  return (
    <div className="main-content">
      <Navbar title="Academic Performance & Grades" />

      {/* Filter and Action Header Bar */}
      <div className="card filter-bar">
        <div className="filter-group">
          <label className="form-label" style={{ margin: 0 }}>Filter by Subject</label>
          <select 
            className="form-select" 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{ width: '250px' }}
          >
            <option value="">All Subjects</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.course_code} - {c.name}</option>
            ))}
          </select>
        </div>

        {isTeacherOrAdmin && (
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <Plus size={16} />
            <span>Enter Marks</span>
          </button>
        )}
      </div>

      {/* Grades List Table Card */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading grade registry...</div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Exam Type</th>
                  <th>Obtained Marks</th>
                  <th>Total Marks</th>
                  <th>Grade Scale</th>
                  <th>Exam Date</th>
                  <th>Instructor Comment</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade.id}>
                    <td><b>{grade.student_name}</b></td>
                    <td>{grade.course_name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{grade.exam_type}</td>
                    <td><b>{grade.marks_obtained}</b></td>
                    <td>{grade.total_marks}</td>
                    <td>
                      <span className={`badge badge-${grade.grade === 'F' ? 'danger' : ['A+', 'A', 'A-'].includes(grade.grade) ? 'success' : 'info'}`}>
                        {grade.grade}
                      </span>
                    </td>
                    <td>{new Date(grade.exam_date).toLocaleDateString()}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{grade.remarks || 'No comments'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Marks Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h3 className="modal-title">Enter Student Marks</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Student</label>
                <select name="student" className="form-select" value={formData.student} onChange={handleChange} required>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.student_id} - {s.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <select name="course" className="form-select" value={formData.course} onChange={handleChange} required>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.course_code} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Assessment Type</label>
                  <select name="exam_type" className="form-select" value={formData.exam_type} onChange={handleChange}>
                    <option value="midterm">Midterm</option>
                    <option value="final">Final Exam</option>
                    <option value="quiz">Classroom Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="project">Project Work</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assessment Date</label>
                  <input type="date" name="exam_date" className="form-input" value={formData.exam_date} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Marks Obtained</label>
                  <input type="number" name="marks_obtained" className="form-input" value={formData.marks_obtained} onChange={handleChange} step="0.01" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Marks</label>
                  <input type="number" name="total_marks" className="form-input" value={formData.total_marks} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Remarks / Feedback</label>
                <textarea name="remarks" className="form-input" rows="3" value={formData.remarks} onChange={handleChange}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grades;
