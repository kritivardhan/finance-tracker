import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import AddTransaction from '../../components/AddTransactions.jsx';
import TransactionTable from '../../components/TransactionTable.jsx'; // NEW

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTransactions(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (token) fetchTransactions();
  }, [token]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Dashboard</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Transaction
        </button>
      </div>

      <TransactionTable transactions={transactions} />

      {showModal && (
        <AddTransaction
          onTransactionAdded={fetchTransactions}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
