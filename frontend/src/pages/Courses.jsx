import React, { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/layout/Navbar';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Courses = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [formData, setFormData] = useState({
    course_code: '',
    name: '',
    description: '',
    teacher: '',
    credits: 3,
    max_students: 40,
    status: 'active'
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const res = await api.get('courses/', { params });
      setCourses(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('teachers/');
      setTeachers(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, [search]);

  const handleOpenModal = (course = null) => {
    if (course) {
      setCurrentCourse(course);
      setFormData({
        ...course,
        teacher: course.teacher || ''
      });
    } else {
      setCurrentCourse(null);
      setFormData({
        course_code: `CS${100 + courses.length + 1}`,
        name: '',
        description: '',
        teacher: teachers[0]?.id || '',
        credits: 3,
        max_students: 45,
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCourse(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        teacher: formData.teacher ? parseInt(formData.teacher) : null
      };
      if (currentCourse) {
        await api.put(`courses/${currentCourse.id}/`, payload);
      } else {
        await api.post('courses/', payload);
      }
      fetchCourses();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving course:', err);
      alert(JSON.stringify(err.response?.data || 'Failed to save course'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course record?')) {
      try {
        await api.delete(`courses/${id}/`);
        fetchCourses();
      } catch (err) {
        console.error('Error deleting course:', err);
      }
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="main-content">
      <Navbar title="Curriculum & Courses" />

      {/* Filter and Action Header Bar */}
      <div className="card filter-bar">
        <div className="filter-group">
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search course code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px', width: '250px' }}
            />
          </div>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            <span>Add Course</span>
          </button>
        )}
      </div>

      {/* Courses Catalog Card */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading course catalog...</div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Title</th>
                  <th>Instructor</th>
                  <th>Credits</th>
                  <th>Capacity</th>
                  <th>Enrollments</th>
                  <th>Status</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td><b>{course.course_code}</b></td>
                    <td>{course.name}</td>
                    <td>{course.teacher_name || 'Not Assigned'}</td>
                    <td>{course.credits} Credits</td>
                    <td>{course.max_students} Students</td>
                    <td>{course.enrolled_count} Enrolled</td>
                    <td>
                      <span className={`badge badge-${course.status === 'active' ? 'success' : 'danger'}`}>
                        {course.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button className="btn btn-secondary btn-icon" onClick={() => handleOpenModal(course)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn btn-danger btn-icon" onClick={() => handleDelete(course.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h3 className="modal-title">{currentCourse ? 'Modify Course Record' : 'Create New Course'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Course Code</label>
                  <input type="text" name="course_code" className="form-input" value={formData.course_code} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Instructor</label>
                <select name="teacher" className="form-select" value={formData.teacher} onChange={handleChange}>
                  <option value="">Choose Instructor</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.full_name} ({t.specialization})</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <input type="number" name="credits" className="form-input" value={formData.credits} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Class Size</label>
                  <input type="number" name="max_students" className="form-input" value={formData.max_students} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input" rows="3" value={formData.description} onChange={handleChange}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
