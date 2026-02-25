import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const FinancialDashboard = () => {
    const transactions = [
        { id: 1, amount: 100, tax: 10, refund: false },
        { id: 2, amount: 200, tax: 20, refund: false },
        { id: 3, amount: 150, tax: 15, refund: true },
    ];

    const totalRevenue = transactions.reduce((acc, t) => acc + t.amount, 0);
    const totalTax = transactions.reduce((acc, t) => acc + t.tax, 0);
    const totalRefunds = transactions.reduce((acc, t) => acc + (t.refund ? t.amount : 0), 0);

    const chartData = [
        { name: 'Revenue', value: totalRevenue },
        { name: 'Tax', value: totalTax },
        { name: 'Refunds', value: totalRefunds },
    ];

    const exportData = () => {
        const csvData = 'data:text/csv;charset=utf-8,ID,Amount,Tax,Refund\n' +
            transactions.map(t => `${t.id},${t.amount},${t.tax},${t.refund}`).join('\n');
        const link = document.createElement('a');
        link.href = encodeURI(csvData);
        link.download = 'financial_data.csv';
        link.click();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-amber-400">Financial Dashboard</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-700 rounded p-4">
                    <p className="text-slate-400 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">${totalRevenue}</p>
                </div>
                <div className="bg-slate-700 rounded p-4">
                    <p className="text-slate-400 text-sm">Tax Collected</p>
                    <p className="text-2xl font-bold text-white">${totalTax}</p>
                </div>
                <div className="bg-slate-700 rounded p-4">
                    <p className="text-slate-400 text-sm">Refunds</p>
                    <p className="text-2xl font-bold text-white">${totalRefunds}</p>
                </div>
            </div>
            <div className="bg-slate-700 rounded p-4 mb-6" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#d97706" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <button onClick={exportData} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded">
                Export Data
            </button>
        </div>
    );
};

export default FinancialDashboard;
