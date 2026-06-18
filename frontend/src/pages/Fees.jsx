import React, { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/layout/Navbar';
import { CreditCard, DollarSign, Plus } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Fees = () => {
  const { user } = useAuthStore();
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('card');
  const [txnId, setTxnId] = useState('');

  // Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [invoiceData, setInvoiceData] = useState({
    student: '',
    fee_structure: '',
    title: '',
    amount: '',
    due_date: new Date().toISOString().split('T')[0]
  });

  const fetchFeeRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get('fees/');
      setFees(res.data.results || res.data);
      
      const summaryRes = await api.get('fees/summary/');
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Error fetching fees records:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const studentsRes = await api.get('students/');
      setStudents(studentsRes.data.results || studentsRes.data);
      
      const structuresRes = await api.get('fees/structures/');
      setFeeStructures(structuresRes.data.results || structuresRes.data);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  useEffect(() => {
    fetchFeeRecords();
    fetchMetadata();
  }, []);

  const handleOpenPayModal = (fee) => {
    setSelectedFee(fee);
    setPayAmount(fee.amount - fee.paid_amount);
    setTxnId(`TXN${Math.floor(100000 + Math.random() * 900000)}`);
    setIsPayModalOpen(true);
  };

  const handleOpenInvoiceModal = () => {
    setInvoiceData({
      student: students[0]?.id || '',
      fee_structure: feeStructures[0]?.id || '',
      title: 'Tuition Fee - Semester Update',
      amount: feeStructures[0]?.amount || 1200,
      due_date: new Date().toISOString().split('T')[0]
    });
    setIsInvoiceModalOpen(true);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`fees/${selectedFee.id}/pay/`, {
        amount: parseFloat(payAmount),
        payment_method: payMethod,
        transaction_id: txnId
      });
      fetchFeeRecords();
      setIsPayModalOpen(false);
    } catch (err) {
      console.error('Error recording payment:', err);
      alert('Failed to submit transaction details.');
    }
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('fees/', invoiceData);
      fetchFeeRecords();
      setIsInvoiceModalOpen(false);
    } catch (err) {
      console.error('Error creating invoice:', err);
      alert('Failed to generate invoice.');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="main-content">
      <Navbar title="Financials & Fees" />

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="card kpi-card">
          <div>
            <div className="kpi-title">Total Billed</div>
            <div className="kpi-value">${summary?.total_billed || 0}</div>
          </div>
          <div className="kpi-icon" style={{ color: 'var(--info)' }}><DollarSign size={24} /></div>
        </div>

        <div className="card kpi-card">
          <div>
            <div className="kpi-title">Total Collected</div>
            <div className="kpi-value">${summary?.total_collected || 0}</div>
          </div>
          <div className="kpi-icon" style={{ color: 'var(--success)' }}><DollarSign size={24} /></div>
        </div>

        <div className="card kpi-card">
          <div>
            <div className="kpi-title">Collection Rate</div>
            <div className="kpi-value">{summary?.collection_rate || 0}%</div>
          </div>
          <div className="kpi-icon" style={{ color: 'var(--warning)' }}><DollarSign size={24} /></div>
        </div>
      </div>

      {/* Action Header Bar */}
      {isAdmin && (
        <div className="card filter-bar" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={handleOpenInvoiceModal}>
            <Plus size={16} />
            <span>Generate Invoice</span>
          </button>
        </div>
      )}

      {/* Fees Data Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading financial ledger...</div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Fee Title</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Balance Due</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee.id}>
                    <td><b>{fee.student_name}</b></td>
                    <td>{fee.title}</td>
                    <td>${fee.amount}</td>
                    <td style={{ color: 'var(--success)' }}>${fee.paid_amount}</td>
                    <td style={{ color: fee.balance > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                      <b>${fee.balance}</b>
                    </td>
                    <td>{new Date(fee.due_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${fee.status === 'paid' ? 'success' : fee.status === 'partial' ? 'warning' : 'danger'}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td>
                      {fee.balance > 0 ? (
                        <button className="btn btn-secondary btn-icon" onClick={() => handleOpenPayModal(fee)} title="Pay Invoice">
                          <CreditCard size={14} />
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Invoice Modal */}
      {isPayModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h3 className="modal-title">Record Fee Payment</h3>
              <button className="modal-close" onClick={() => setIsPayModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handlePaySubmit}>
              <div className="form-group">
                <label className="form-label">Payment Amount ($)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={payAmount} 
                  onChange={(e) => setPayAmount(e.target.value)} 
                  max={selectedFee?.amount - selectedFee?.paid_amount} 
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-select" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                    <option value="card">Credit/Debit Card</option>
                    <option value="cash">Cash Payment</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Transaction Reference ID</label>
                  <input type="text" className="form-input" value={txnId} onChange={(e) => setTxnId(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsPayModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Process Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h3 className="modal-title">Create Student Invoice</h3>
              <button className="modal-close" onClick={() => setIsInvoiceModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleInvoiceSubmit}>
              <div className="form-group">
                <label className="form-label">Recipient Student</label>
                <select 
                  className="form-select" 
                  value={invoiceData.student} 
                  onChange={(e) => setInvoiceData({ ...invoiceData, student: e.target.value })}
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.student_id} - {s.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Invoice Category / Structure</label>
                <select 
                  className="form-select" 
                  value={invoiceData.fee_structure} 
                  onChange={(e) => {
                    const structure = feeStructures.find(fs => String(fs.id) === e.target.value);
                    setInvoiceData({ 
                      ...invoiceData, 
                      fee_structure: e.target.value,
                      amount: structure ? structure.amount : invoiceData.amount
                    });
                  }}
                  required
                >
                  {feeStructures.map(fs => (
                    <option key={fs.id} value={fs.id}>{fs.name} (${fs.amount})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Invoice Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={invoiceData.title} 
                  onChange={(e) => setInvoiceData({ ...invoiceData, title: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Charge Amount ($)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={invoiceData.amount} 
                    onChange={(e) => setInvoiceData({ ...invoiceData, amount: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Due Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={invoiceData.due_date} 
                    onChange={(e) => setInvoiceData({ ...invoiceData, due_date: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsInvoiceModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Charge</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
