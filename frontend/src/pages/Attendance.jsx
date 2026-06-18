import React, { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/layout/Navbar';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

const Attendance = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('courses/');
        setCourses(res.data.results || res.data);
        if ((res.data.results || res.data).length > 0) {
          setSelectedCourse((res.data.results || res.data)[0].id);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;

    const fetchStudentsAndAttendance = async () => {
      setLoading(true);
      setMessage(null);
      try {
        // Fetch students enrolled in course
        const enrollmentsRes = await api.get(`courses/enrollments/?course=${selectedCourse}`);
        const enrolledStudents = enrollmentsRes.data.results || enrollmentsRes.data;
        
        // Fetch existing attendance for this course and date
        const attendanceRes = await api.get(`attendance/?course=${selectedCourse}&date=${date}`);
        const attendanceList = attendanceRes.data.results || attendanceRes.data;

        // Map existing attendance status
        const initialStatus = {};
        attendanceList.forEach(rec => {
          initialStatus[rec.student] = rec.status;
        });

        // Default missing attendance to 'present'
        enrolledStudents.forEach(env => {
          if (!initialStatus[env.student]) {
            initialStatus[env.student] = 'present';
          }
        });

        setStudents(enrolledStudents);
        setAttendanceRecords(initialStatus);
      } catch (err) {
        console.error('Error loading attendance details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndAttendance();
  }, [selectedCourse, date]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords({
      ...attendanceRecords,
      [studentId]: status
    });
  };

  const handleSave = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      const records = Object.keys(attendanceRecords).map(sId => ({
        student: parseInt(sId),
        status: attendanceRecords[sId]
      }));

      await api.post('attendance/bulk_create/', {
        course: parseInt(selectedCourse),
        date: date,
        records: records
      });

      setMessage({ type: 'success', text: 'Attendance recorded successfully!' });
    } catch (err) {
      console.error('Error saving attendance:', err);
      setMessage({ type: 'danger', text: 'Failed to record attendance. Try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content">
      <Navbar title="Classroom Attendance" />

      {/* Select Course & Date Card */}
      <div className="card filter-bar">
        <div className="filter-group">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Select Course</label>
            <select 
              className="form-select" 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{ width: '280px' }}
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.course_code} - {c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Attendance Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>
        </div>

        <div>
          <button 
            className="btn btn-primary" 
            onClick={handleSave} 
            disabled={submitting || students.length === 0}
          >
            <Save size={16} />
            <span>{submitting ? 'Saving...' : 'Submit Attendance'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`badge badge-${message.type}`} style={{ padding: '16px', display: 'flex', gap: '8px', width: '100%', borderRadius: 'var(--radius-sm)' }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Roster Listing Grid Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading student roster...</div>
        ) : students.length > 0 ? (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Excused</th>
                </tr>
              </thead>
              <tbody>
                {students.map((env) => {
                  const sId = env.student;
                  const currentStatus = attendanceRecords[sId] || 'present';
                  return (
                    <tr key={sId}>
                      <td><b>{env.student_name}</b></td>
                      <td>
                        <input 
                          type="radio" 
                          name={`status-${sId}`} 
                          checked={currentStatus === 'present'}
                          onChange={() => handleStatusChange(sId, 'present')}
                          style={{ accentColor: 'var(--success)', transform: 'scale(1.2)', cursor: 'pointer' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="radio" 
                          name={`status-${sId}`} 
                          checked={currentStatus === 'absent'}
                          onChange={() => handleStatusChange(sId, 'absent')}
                          style={{ accentColor: 'var(--danger)', transform: 'scale(1.2)', cursor: 'pointer' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="radio" 
                          name={`status-${sId}`} 
                          checked={currentStatus === 'late'}
                          onChange={() => handleStatusChange(sId, 'late')}
                          style={{ accentColor: 'var(--warning)', transform: 'scale(1.2)', cursor: 'pointer' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="radio" 
                          name={`status-${sId}`} 
                          checked={currentStatus === 'excused'}
                          onChange={() => handleStatusChange(sId, 'excused')}
                          style={{ accentColor: 'var(--info)', transform: 'scale(1.2)', cursor: 'pointer' }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            No students enrolled in this course.
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
