import React, { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, GraduationCap, BookOpen, Clock, Megaphone, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('reports/dashboard/');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div className="badge badge-info" style={{ padding: '16px 24px', fontSize: '16px' }}>Loading Dashboard Data...</div>
      </div>
    );
  }

  const { kpis, recent_students, recent_announcements, enrollment_trend } = data || {};

  return (
    <div className="main-content">
      <Navbar title="Dashboard Overview" />

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <motion.div className="card kpi-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div>
            <div className="kpi-title">Total Students</div>
            <div className="kpi-value">{kpis?.total_students || 0}</div>
          </div>
          <div className="kpi-icon"><Users size={24} /></div>
        </motion.div>

        <motion.div className="card kpi-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div>
            <div className="kpi-title">Active Teachers</div>
            <div className="kpi-value">{kpis?.total_teachers || 0}</div>
          </div>
          <div className="kpi-icon"><GraduationCap size={24} /></div>
        </motion.div>

        <motion.div className="card kpi-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div>
            <div className="kpi-title">Attendance Rate</div>
            <div className="kpi-value">{kpis?.attendance_rate || 0}%</div>
          </div>
          <div className="kpi-icon"><CheckCircle size={24} /></div>
        </motion.div>

        <motion.div className="card kpi-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div>
            <div className="kpi-title">Billed Fees</div>
            <div className="kpi-value">${kpis?.total_fees || 0}</div>
          </div>
          <div className="kpi-icon"><BookOpen size={24} /></div>
        </motion.div>
      </div>

      {/* Visual Analytics / Grid Layout */}
      <div className="grid-2">
        {/* Chart Column */}
        <motion.div className="card" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <h3 style={{ marginBottom: '24px', fontWeight: '600' }}>Student Enrollment Trend</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={enrollment_trend}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="students" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Notices Board */}
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Megaphone size={20} color="var(--primary)" />
            <h3 style={{ fontWeight: '600' }}>Recent Announcements</h3>
          </div>
          <div className="announcement-list">
            {recent_announcements?.length > 0 ? (
              recent_announcements.map((ann) => (
                <div key={ann.id} className={`announcement-item ${ann.priority}`}>
                  <div className="announcement-title">{ann.title}</div>
                  <div className="announcement-meta">
                    <span className={`badge badge-${ann.priority === 'high' ? 'danger' : ann.priority === 'medium' ? 'warning' : 'info'}`}>
                      {ann.priority}
                    </span>
                    <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No recent notices.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Students Table Section */}
      <motion.div className="card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <h3 style={{ marginBottom: '16px', fontWeight: '600' }}>Newly Enrolled Students</h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Enrollment Date</th>
              </tr>
            </thead>
            <tbody>
              {recent_students?.map((stu) => (
                <tr key={stu.id}>
                  <td>{stu.student_id}</td>
                  <td>{stu.first_name} {stu.last_name}</td>
                  <td>
                    <span className={`badge badge-${stu.status === 'active' ? 'success' : 'danger'}`}>
                      {stu.status}
                    </span>
                  </td>
                  <td>{new Date(stu.enrollment_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
