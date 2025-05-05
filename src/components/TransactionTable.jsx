import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Table, Form, Button, Row, Col } from 'react-bootstrap';

const TransactionTable = () => {
  const { token } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchTransactions = async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setTransactions(data);
        setFiltered(data);
      }
    };

    if (token) fetchTransactions();
  }, [token]);

  useEffect(() => {
    let data = transactions;
    if (category) data = data.filter(tx => tx.category.toLowerCase().includes(category.toLowerCase()));
    if (type) data = data.filter(tx => tx.type === type);
    if (startDate) data = data.filter(tx => new Date(tx.date) >= new Date(startDate));
    if (endDate) data = data.filter(tx => new Date(tx.date) <= new Date(endDate));
    setFiltered(data);
    setCurrentPage(1);
  }, [category, type, startDate, endDate, transactions]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="container mt-4">
      <h4>Transaction History</h4>

      <Row className="mb-3">
        <Col md={3}><Form.Control type="text" placeholder="Filter by category" value={category} onChange={e => setCategory(e.target.value)} /></Col>
        <Col md={2}><Form.Select value={type} onChange={e => setType(e.target.value)}><option value="">All</option><option value="income">Income</option><option value="expense">Expense</option></Form.Select></Col>
        <Col md={2}><Form.Control type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></Col>
        <Col md={2}><Form.Control type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></Col>
        <Col md={1}><Form.Select value={perPage} onChange={e => setPerPage(Number(e.target.value))}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></Form.Select></Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Type</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr><td colSpan="5" className="text-center">No transactions found.</td></tr>
          ) : (
            paginated.map(tx => (
              <tr key={tx._id}>
                <td>{tx.title}</td>
                <td>₹{tx.amount}</td>
                <td>{tx.category}</td>
                <td>{tx.type}</td>
                <td>{new Date(tx.date).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center">
        <span>Page {currentPage} of {totalPages}</span>
        <div>
          <Button variant="secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>{' '}
          <Button variant="secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;