import React, { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/layout/Navbar';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Students = () => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [section, setSection] = useState('');
  const [status, setStatus] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'M',
    date_of_birth: '',
    blood_group: 'O+',
    address: '',
    city: '',
    section: '',
    roll_number: '',
    parent_name: '',
    parent_phone: '',
    parent_email: ''
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (section) params.section = section;
      if (status) params.status = status;
      
      const res = await api.get('students/', { params });
      setStudents(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, section, status]);

  const handleOpenModal = (student = null) => {
    if (student) {
      setCurrentStudent(student);
      setFormData(student);
    } else {
      setCurrentStudent(null);
      setFormData({
        student_id: `STU00${students.length + 5}`,
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: 'M',
        date_of_birth: '2006-01-01',
        blood_group: 'O+',
        address: '',
        city: '',
        section: 'A',
        roll_number: String(students.length + 101),
        parent_name: '',
        parent_phone: '',
        parent_email: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentStudent(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentStudent) {
        await api.put(`students/${currentStudent.id}/`, formData);
      } else {
        await api.post('students/', formData);
      }
      fetchStudents();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving student:', err);
      alert(JSON.stringify(err.response?.data || 'Failed to save student record'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      try {
        await api.delete(`students/${id}/`);
        fetchStudents();
      } catch (err) {
        console.error('Error deleting student:', err);
      }
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="main-content">
      <Navbar title="Student Registry" />

      {/* Filter and Action Header Bar */}
      <div className="card filter-bar">
        <div className="filter-group">
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search ID or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px', width: '220px' }}
            />
          </div>
          <select className="form-select" value={section} onChange={(e) => setSection(e.target.value)}>
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {/* Students Data Table Card */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading registry records...</div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Section</th>
                  <th>Roll No</th>
                  <th>Parent Info</th>
                  <th>Status</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td><b>{student.student_id}</b></td>
                    <td>{student.full_name}</td>
                    <td>{student.email}</td>
                    <td>{student.section}</td>
                    <td>{student.roll_number}</td>
                    <td>{student.parent_name} ({student.parent_phone})</td>
                    <td>
                      <span className={`badge badge-${student.status === 'active' ? 'success' : 'danger'}`}>
                        {student.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button className="btn btn-secondary btn-icon" onClick={() => handleOpenModal(student)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn btn-danger btn-icon" onClick={() => handleDelete(student.id)}>
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

      {/* CRUD Add/Edit Student Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h3 className="modal-title">{currentStudent ? 'Edit Student Details' : 'Add New Student'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '16px', fontWeight: '600' }}>Academic Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Student ID</label>
                  <input type="text" name="student_id" className="form-input" value={formData.student_id} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input type="text" name="section" className="form-input" value={formData.section} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input type="text" name="roll_number" className="form-input" value={formData.roll_number} onChange={handleChange} required />
                </div>
              </div>

              <h4 style={{ color: 'var(--primary)', margin: '16px 0', fontWeight: '600' }}>Personal Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" name="first_name" className="form-input" value={formData.first_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" name="last_name" className="form-input" value={formData.last_name} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" name="date_of_birth" className="form-input" value={formData.date_of_birth} onChange={handleChange} required />
                </div>
              </div>

              <h4 style={{ color: 'var(--primary)', margin: '16px 0', fontWeight: '600' }}>Parent / Guardian Information</h4>
              <div className="form-group">
                <label className="form-label">Parent Name</label>
                <input type="text" name="parent_name" className="form-input" value={formData.parent_name} onChange={handleChange} required />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Parent Phone</label>
                  <input type="text" name="parent_phone" className="form-input" value={formData.parent_phone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Parent Email</label>
                  <input type="email" name="parent_email" className="form-input" value={formData.parent_email} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
