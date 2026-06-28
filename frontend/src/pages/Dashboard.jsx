import React, { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, CartesianGrid 
} from 'recharts';
import { 
  Users, GraduationCap, BookOpen, Clock, Megaphone, CheckCircle,
  Plus, Calendar, DollarSign, Activity, ArrowUpRight, Sparkles,
  UserPlus, FileText, Landmark, ClipboardList, Briefcase
} from 'lucide-react';
import useAuthStore from '../store/authStore';

// Simple, performant CountUp Component
const CountUp = ({ end, duration = 1000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const Dashboard = () => {
  const { user } = useAuthStore();
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

  // Time-aware dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '🌅' };
    if (hour < 18) return { text: 'Good afternoon', emoji: '☀️' };
    return { text: 'Good evening', emoji: '🌙' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div className="badge badge-info animate-fade-in" style={{ padding: '16px 24px', fontSize: '16px' }}>
          Loading Dashboard Data...
        </div>
      </div>
    );
  }

  const { kpis, recent_students, recent_announcements, enrollment_trend } = data || {};
  const greeting = getGreeting();

  // Mock / Calculated Grade Distribution
  const totalStudentsVal = kpis?.total_students || 0;
  const gradeDistributionData = [
    { grade: 'A', students: Math.round(totalStudentsVal * 0.35) || 8 },
    { grade: 'B', students: Math.round(totalStudentsVal * 0.40) || 12 },
    { grade: 'C', students: Math.round(totalStudentsVal * 0.15) || 4 },
    { grade: 'D', students: Math.round(totalStudentsVal * 0.07) || 2 },
    { grade: 'F', students: Math.round(totalStudentsVal * 0.03) || 1 },
  ];

  // Mock Recent Activities
  const recentActivities = [
    { id: 1, title: 'New Student Registration', desc: 'Alex Rivera enrolled in Grade 10', time: '10 mins ago', type: 'success' },
    { id: 2, title: 'Notice Posted', desc: 'Mid-term schedule published to Board', time: '2 hours ago', type: 'info' },
    { id: 3, title: 'Grade Book Updated', desc: 'Prof. David updated Science marks', time: '4 hours ago', type: 'warning' },
    { id: 4, title: 'Fee Invoice Generated', desc: 'Term 2 bills generated for all students', time: '1 day ago', type: 'danger' },
  ];

  // Mock Upcoming Events
  const upcomingEvents = [
    { id: 1, date: 'Jul 01', title: 'Parent-Teacher Meeting', desc: '10:00 AM - Aud Hall' },
    { id: 2, date: 'Jul 15', title: 'Final Exams Start', desc: 'Grade 8 to 12' },
    { id: 3, date: 'Aug 01', title: 'Summer Camps Break', desc: 'All academic wings closed' },
  ];

  // Dynamic Role-based Quick Actions
  const getQuickActions = () => {
    if (user?.role === 'admin') {
      return [
        { label: 'Register Student', icon: <UserPlus size={18} />, link: '/students' },
        { label: 'Hire Teacher', icon: <GraduationCap size={18} />, link: '/teachers' },
        { label: 'Create Course', icon: <BookOpen size={18} />, link: '/courses' },
        { label: 'Process Fees', icon: <Landmark size={18} />, link: '/fees' },
      ];
    }
    if (user?.role === 'teacher') {
      return [
        { label: 'Log Attendance', icon: <ClipboardList size={18} />, link: '/attendance' },
        { label: 'Record Grades', icon: <FileText size={18} />, link: '/grades' },
        { label: 'Post Notice', icon: <Megaphone size={18} />, link: '/announcements' },
        { label: 'My Courses', icon: <BookOpen size={18} />, link: '/courses' },
      ];
    }
    // Student Quick Actions
    return [
      { label: 'My Report Card', icon: <FileText size={18} />, link: '/grades' },
      { label: 'Tuition Fees', icon: <Landmark size={18} />, link: '/fees' },
      { label: 'Class Syllabus', icon: <BookOpen size={18} />, link: '/courses' },
      { label: 'Notices board', icon: <Megaphone size={18} />, link: '/announcements' },
    ];
  };

  const quickActions = getQuickActions();

  // Attendance radial dash calculations
  const attRate = kpis?.attendance_rate || 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (attRate / 100) * circumference;

  return (
    <div className="main-content" role="main">
      <Navbar title="Dashboard" />

      {/* Dynamic Welcome Greeting (Stripe/Linear Inspired) */}
      <motion.div 
        className="greeting-banner animate-fade-in"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ zIndex: 1 }}>
          <h2 className="greeting-title">
            {greeting.text}, {user?.full_name || 'Guest'} <span className="greeting-illustration">{greeting.emoji}</span>
          </h2>
          <p className="greeting-subtitle">
            Welcome back! You have <b>{recent_announcements?.length || 0} new announcements</b> and <b>4 critical activities</b> to review.
          </p>
        </div>
        <div style={{ opacity: 0.1, pointerEvents: 'none' }}>
          <Sparkles size={110} style={{ color: 'var(--primary)' }} />
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <motion.div className="card kpi-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div>
            <div className="kpi-title">Total Students</div>
            <div className="kpi-value">
              <CountUp end={kpis?.total_students || 0} />
            </div>
          </div>
          <div className="kpi-icon" aria-hidden="true"><Users size={20} /></div>
        </motion.div>

        <motion.div className="card kpi-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div>
            <div className="kpi-title">Active Teachers</div>
            <div className="kpi-value">
              <CountUp end={kpis?.total_teachers || 0} />
            </div>
          </div>
          <div className="kpi-icon" aria-hidden="true"><GraduationCap size={20} /></div>
        </motion.div>

        <motion.div className="card kpi-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div>
            <div className="kpi-title">Attendance Rate</div>
            <div className="kpi-value">
              <CountUp end={attRate} suffix="%" />
            </div>
          </div>
          <div className="kpi-icon" aria-hidden="true"><CheckCircle size={20} /></div>
        </motion.div>

        <motion.div className="card kpi-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div>
            <div className="kpi-title">Invoiced Tuition</div>
            <div className="kpi-value">
              <CountUp end={kpis?.total_fees || 0} prefix="$" />
            </div>
          </div>
          <div className="kpi-icon" aria-hidden="true"><DollarSign size={20} /></div>
        </motion.div>
      </div>

      {/* Main Analytics Matrix Grid */}
      <div className="dashboard-grid">
        
        {/* Left Column: Student Growth (Vercel Style Chart) */}
        <motion.div 
          className="card col-span-2" 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.5 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontWeight: '700', fontSize: '16px', fontFamily: 'var(--font-display)' }}>Student Growth Analytics</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Monthly enrollment trends for this academic year</p>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              +24% Growth <ArrowUpRight size={14} />
            </span>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={enrollment_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <CartesianGrid stroke="var(--border-color)" vertical={false} strokeDasharray="3 3" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '8px',
                    color: 'var(--text-main)' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="students" 
                  stroke="var(--primary)" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorStudents)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right Column: Attendance Circular Progress */}
        <motion.div 
          className="card col-span-1" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.6 }}
        >
          <h3 style={{ fontWeight: '700', fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>Attendance Analytics</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Schoolwide daily averages</p>

          <div className="attendance-ring-container">
            <div className="progress-ring">
              <svg width="100" height="100">
                <circle className="progress-ring-circle-bg" cx="50" cy="50" r={radius} />
                <circle 
                  className="progress-ring-circle" 
                  cx="50" 
                  cy="50" 
                  r={radius} 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="progress-ring-text">{attRate}%</div>
            </div>
            
            <div className="attendance-ring-stats">
              <div className="attendance-stat-row">
                <span className="attendance-indicator" style={{ background: 'var(--primary)' }} />
                <span>Present rate: <b>{attRate}%</b></span>
              </div>
              <div className="attendance-stat-row">
                <span className="attendance-indicator" style={{ background: 'var(--border-color)' }} />
                <span>Absent rate: <b>{Math.round(100 - attRate)}%</b></span>
              </div>
              <div className="attendance-stat-row" style={{ color: 'var(--success)', fontWeight: 600 }}>
                <span>Healthy Limit Met</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Left Column: Grade Distribution (Minimalist BarChart) */}
        <motion.div 
          className="card col-span-2" 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.7 }}
        >
          <div>
            <h3 style={{ fontWeight: '700', fontSize: '16px', fontFamily: 'var(--font-display)' }}>Grade Distribution</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>Count of students by letter grades</p>
          </div>

          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={gradeDistributionData} barSize={28} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="grade" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <CartesianGrid stroke="var(--border-color)" vertical={false} strokeDasharray="3 3" />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '8px',
                    color: 'var(--text-main)' 
                  }} 
                />
                <Bar 
                  dataKey="students" 
                  fill="var(--primary)" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right Column: Fee Collection progress */}
        <motion.div 
          className="card col-span-1" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.8 }}
        >
          <h3 style={{ fontWeight: '700', fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>Fee Collection Analytics</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Invoiced vs Collected collections rate</p>

          <div className="fee-analytics-container">
            <div>
              <div className="fee-meter-header" style={{ marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Collection Status</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{kpis?.collection_rate || 0}%</span>
              </div>
              <div className="fee-meter-bar">
                <div className="fee-meter-fill" style={{ width: `${kpis?.collection_rate || 0}%` }} />
              </div>
            </div>

            <div className="fee-details-row">
              <div className="fee-details-box">
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Revenue</span>
                <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>${kpis?.total_fees || 0}</span>
              </div>
              <div className="fee-details-box">
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Amount Realized</span>
                <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--success)' }}>${kpis?.collected_fees || 0}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Left Column (Span 2): Recent Activity timeline & Quick Actions */}
        <div className="col-span-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Timeline - Recent Activity */}
          <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            <h3 style={{ fontWeight: '700', fontSize: '15px', fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--primary)" />
              <span>Recent Activities</span>
            </h3>

            <div className="timeline">
              {recentActivities.map((act) => (
                <div key={act.id} className="timeline-item">
                  <div className={`timeline-dot ${act.type}`} />
                  <div className="timeline-content">
                    <span className="timeline-time">{act.time}</span>
                    <span className="timeline-title">{act.title}</span>
                    <span className="timeline-desc">{act.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions Panel */}
          <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            <h3 style={{ fontWeight: '700', fontSize: '15px', fontFamily: 'var(--font-display)', marginBottom: '6px' }}>Quick Actions</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Role-based utility shortcuts</p>

            <div className="quick-actions-grid">
              {quickActions.map((act) => (
                <a 
                  key={act.label} 
                  href={act.link} 
                  className="quick-action-btn"
                  role="button"
                >
                  <div className="quick-action-icon" aria-hidden="true">
                    {act.icon}
                  </div>
                  <span>{act.label}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Upcoming Events & Notices */}
        <motion.div 
          className="card col-span-1" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 1.0 }}
        >
          <h3 style={{ fontWeight: '700', fontSize: '15px', fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--primary)" />
            <span>Upcoming Events</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {upcomingEvents.map((evt) => (
              <div 
                key={evt.id} 
                style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  alignItems: 'center', 
                  padding: '10px 12px', 
                  background: 'var(--bg-main)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)' 
                }}
              >
                <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 700, fontSize: '12px', padding: '6px 10px', borderRadius: '6px', textAlign: 'center', minWidth: '54px' }}>
                  {evt.date}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{evt.title}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{evt.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
