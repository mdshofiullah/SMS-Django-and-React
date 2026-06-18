import React, { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/layout/Navbar';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Teachers = () => {
  const { user } = useAuthStore();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [formData, setFormData] = useState({
    teacher_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'M',
    date_of_birth: '',
    address: '',
    qualification: '',
    specialization: '',
    experience_years: 0,
    salary: 0,
    status: 'active'
  });

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const res = await api.get('teachers/', { params });
      setTeachers(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [search]);

  const handleOpenModal = (teacher = null) => {
    if (teacher) {
      setCurrentTeacher(teacher);
      setFormData(teacher);
    } else {
      setCurrentTeacher(null);
      setFormData({
        teacher_id: `TCH00${teachers.length + 3}`,
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: 'M',
        date_of_birth: '1988-01-01',
        address: '',
        qualification: '',
        specialization: '',
        experience_years: 5,
        salary: 4500,
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTeacher(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentTeacher) {
        await api.put(`teachers/${currentTeacher.id}/`, formData);
      } else {
        await api.post('teachers/', formData);
      }
      fetchTeachers();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving teacher:', err);
      alert(JSON.stringify(err.response?.data || 'Failed to save teacher record'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher record?')) {
      try {
        await api.delete(`teachers/${id}/`);
        fetchTeachers();
      } catch (err) {
        console.error('Error deleting teacher:', err);
      }
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="main-content">
      <Navbar title="Faculty Directory" />

      {/* Filter and Action Header Bar */}
      <div className="card filter-bar">
        <div className="filter-group">
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search faculty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px', width: '220px' }}
            />
          </div>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            <span>Add Instructor</span>
          </button>
        )}
      </div>

      {/* Faculty Registry Card */}
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
                  <th>Qualification</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Status</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td><b>{teacher.teacher_id}</b></td>
                    <td>{teacher.full_name}</td>
                    <td>{teacher.email}</td>
                    <td>{teacher.qualification}</td>
                    <td>{teacher.specialization}</td>
                    <td>{teacher.experience_years} Years</td>
                    <td>
                      <span className={`badge badge-${teacher.status === 'active' ? 'success' : 'warning'}`}>
                        {teacher.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button className="btn btn-secondary btn-icon" onClick={() => handleOpenModal(teacher)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn btn-danger btn-icon" onClick={() => handleDelete(teacher.id)}>
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
              <h3 className="modal-title">{currentTeacher ? 'Edit Instructor Details' : 'Add New Instructor'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Teacher ID</label>
                  <input type="text" name="teacher_id" className="form-input" value={formData.teacher_id} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>
              </div>

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
                  <label className="form-label">Qualification</label>
                  <input type="text" name="qualification" className="form-input" placeholder="e.g. M.Sc. Math" value={formData.qualification} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input type="text" name="specialization" className="form-input" placeholder="e.g. Calculus" value={formData.specialization} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input type="number" name="experience_years" className="form-input" value={formData.experience_years} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary ($)</label>
                  <input type="number" name="salary" className="form-input" value={formData.salary} onChange={handleChange} />
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

export default Teachers;
