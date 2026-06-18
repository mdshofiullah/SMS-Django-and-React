import React, { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/layout/Navbar';
import { Megaphone, Plus, Calendar, User, Trash2 } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Announcements = () => {
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium',
    target: 'all',
    is_pinned: false
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('announcements/');
      setAnnouncements(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('announcements/', formData);
      fetchAnnouncements();
      setIsModalOpen(false);
      setFormData({
        title: '',
        content: '',
        priority: 'medium',
        target: 'all',
        is_pinned: false
      });
    } catch (err) {
      console.error('Error creating announcement:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await api.delete(`announcements/${id}/`);
        fetchAnnouncements();
      } catch (err) {
        console.error('Error deleting announcement:', err);
      }
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="main-content">
      <Navbar title="Announcements & Notices" />

      {/* Header bar */}
      {isAdmin && (
        <div className="card filter-bar" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Create Notice</span>
          </button>
        </div>
      )}

      {/* Roster Listing Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading announcements board...</div>
        ) : announcements.length > 0 ? (
          announcements.map((ann) => (
            <div key={ann.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '5px solid var(--primary)', borderLeftColor: ann.priority === 'high' ? 'var(--danger)' : ann.priority === 'medium' ? 'var(--warning)' : 'var(--info)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <h3 style={{ fontWeight: '600', fontSize: '18px' }}>{ann.title}</h3>
                  {ann.is_pinned && <span className="badge badge-success">Pinned</span>}
                  <span className={`badge badge-${ann.priority === 'high' ? 'danger' : ann.priority === 'medium' ? 'warning' : 'info'}`}>{ann.priority}</span>
                </div>
                
                {isAdmin && (
                  <button className="btn btn-danger btn-icon" onClick={() => handleDelete(ann.id)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <p style={{ lineHeight: '1.6', fontSize: '15px' }}>{ann.content}</p>

              <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} />
                  <span>Posted by: {ann.author_name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} />
                  <span>Date: {new Date(ann.created_at).toLocaleDateString()}</span>
                </div>
                <div>
                  <span>Target: <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{ann.target}</span></span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            No active announcements.
          </div>
        )}
      </div>

      {/* Add Notice Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h3 className="modal-title">Publish Announcement</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Notice Title</label>
                <input type="text" name="title" className="form-input" value={formData.title} onChange={handleChange} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <select name="priority" className="form-select" value={formData.priority} onChange={handleChange}>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select name="target" className="form-select" value={formData.target} onChange={handleChange}>
                    <option value="all">Everyone</option>
                    <option value="students">Students Only</option>
                    <option value="teachers">Instructors Only</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', margin: '16px 0' }}>
                <input type="checkbox" name="is_pinned" id="is_pinned" checked={formData.is_pinned} onChange={handleChange} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <label htmlFor="is_pinned" className="form-label" style={{ cursor: 'pointer', margin: 0 }}>Pin this notice to the top of the dashboard board</label>
              </div>

              <div className="form-group">
                <label className="form-label">Notice Content</label>
                <textarea name="content" className="form-input" rows="4" value={formData.content} onChange={handleChange} required></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Announcement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
