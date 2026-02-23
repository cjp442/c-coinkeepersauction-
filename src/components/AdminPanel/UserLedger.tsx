import React, { useState, useEffect } from 'react';

const UserLedger = () => {
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Function to fetch transactions (dummy data for now)
  const fetchTransactions = () => {
    // Replace with API call to fetch user's transactions
    const dummyData = [
      { id: 1, type: 'Purchase', amount: 100, date: '2026-02-01' },
      { id: 2, type: 'Transfer', amount: 50, date: '2026-02-15' },
      { id: 3, type: 'Refund', amount: 25, date: '2026-02-20' },
    ];
    setTransactions(dummyData);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (!startDate || transactionDate >= start) && (!endDate || transactionDate <= end);
  });

  const exportLedger = () => {
    // Convert filteredTransactions to CSV and trigger download
    const csvContent = 'data:text/csv;charset=utf-8,' +
      filteredTransactions.map(e => `${e.id},${e.type},${e.amount},${e.date}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'user_ledger.csv');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      <h1>User Ledger</h1>
      <div>
        <label>
          Start Date:
          <input type='date' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date:
          <input type='date' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button onClick={exportLedger}>Export Ledger</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{transaction.id}</td>
              <td>{transaction.type}</td>
              <td>{transaction.amount}</td>
              <td>{transaction.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserLedger;