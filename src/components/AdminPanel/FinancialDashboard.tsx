import React from 'react';
import { Bar } from 'react-chartjs-2';

const FinancialDashboard = () => {
    // Mock data for transactions
    const transactions = [ // Example transaction data
        { id: 1, amount: 100, tax: 10, refund: false },
        { id: 2, amount: 200, tax: 20, refund: false },
        { id: 3, amount: 150, tax: 15, refund: true },
        // Add more transactions as needed
    ];

    // Calculate revenue breakdown
    const totalRevenue = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    const totalTax = transactions.reduce((acc, transaction) => acc + transaction.tax, 0);
    const totalRefunds = transactions.reduce((acc, transaction) => acc + (transaction.refund ? transaction.amount : 0), 0);

    // Data for charts
    const chartData = {
        labels: ['Revenue', 'Tax', 'Refunds'],
        datasets: [{
            label: 'Financial Overview',
            data: [totalRevenue, totalTax, totalRefunds],
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)'],
        }]
    };

    const exportData = () => {
        // Function to export data, e.g., as a CSV
        const csvData = "ID, Amount, Tax, Refund\n" + transactions.map(t => `${t.id}, ${t.amount}, ${t.tax}, ${t.refund}`).join('\n');
        const blob = new Blob([csvData], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'financial_data.csv';
        link.click();
    };

    return (
        <div>
            <h1>Financial Dashboard</h1>
            <div>
                <h2>Total Revenue: ${totalRevenue}</h2>
                <h2>Total Tax Collected: ${totalTax}</h2>
                <h2>Total Refunds: ${totalRefunds}</h2>
            </div>
            <Bar data={chartData} />
            <button onClick={exportData}>Export Data</button>
        </div>
    );
};

export default FinancialDashboard;