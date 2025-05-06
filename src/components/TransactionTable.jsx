import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Table, Form, Button, Row, Col, Card, Modal } from 'react-bootstrap';

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

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [currentTx, setCurrentTx] = useState(null);

  // Form fields for edit modal
  const [form, setForm] = useState({ title: '', amount: '', category: '', type: '', date: '' });

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

  const renderPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) pages.push(<span key="start-ellipsis" className="mx-1">...</span>);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'primary' : 'outline-secondary'}
          size="sm"
          className="mx-1"
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) pages.push(<span key="end-ellipsis" className="mx-1">...</span>);

    return pages;
  };

  const handleEdit = (tx) => {
    setCurrentTx(tx);
    setForm({
      title: tx.title,
      amount: tx.amount,
      category: tx.category,
      type: tx.type,
      date: tx.date.split('T')[0], // format for input date
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setTransactions(prev => prev.filter(tx => tx._id !== id));
      } else {
        console.error('Failed to delete transaction');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleModalChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transactions/${currentTx._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const updated = await res.json();
        setTransactions(prev =>
          prev.map(tx => (tx._id === updated._id ? updated : tx))
        );
        setShowModal(false);
      } else {
        console.error('Failed to update transaction');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="container mt-4">
      <h4>Transaction History</h4>
      <Row>
        <Col md={3}>
          <Card className="p-3 mb-3">
            <h5>Filters</h5>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="Filter by category"
                value={category}
                onChange={e => setCategory(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select value={type} onChange={e => setType(e.target.value)}>
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </Form.Group>
          </Card>
        </Col>

        <Col md={9}>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Type</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan="6" className="text-center">No transactions found.</td></tr>
              ) : (
                paginated.map(tx => (
                  <tr key={tx._id}>
                    <td>{tx.title}</td>
                    <td>₹{tx.amount}</td>
                    <td>{tx.category}</td>
                    <td>{tx.type}</td>
                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(tx)}>
                        Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(tx._id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <Button variant="secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                Prev
              </Button>
              {renderPageNumbers()}
              <Button variant="secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                Next
              </Button>
            </div>
            <div className="d-flex justify-content-end">
              <Form.Select style={{ width: '120px' }} value={perPage} onChange={e => setPerPage(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </Form.Select>
            </div>
          </div>
        </Col>
      </Row>

      {/* Modal for Editing Transaction */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Title</Form.Label>
            <Form.Control name="title" value={form.title} onChange={handleModalChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Amount</Form.Label>
            <Form.Control name="amount" type="number" value={form.amount} onChange={handleModalChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Category</Form.Label>
            <Form.Control name="category" value={form.category} onChange={handleModalChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Type</Form.Label>
            <Form.Select name="type" value={form.type} onChange={handleModalChange}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Date</Form.Label>
            <Form.Control name="date" type="date" value={form.date} onChange={handleModalChange} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdate}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TransactionTable;