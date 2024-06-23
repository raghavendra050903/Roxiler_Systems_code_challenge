import React from 'react';

const TransactionsTable = ({ transactions, onPageChange }) => {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Transactions</h2>
            {transactions.length === 0 ? (
                <p>No transactions found.</p>
            ) : (
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="w-1/3 text-left py-3 px-4 uppercase font-semibold text-sm">Title</th>
                            <th className="w-1/3 text-left py-3 px-4 uppercase font-semibold text-sm">Description</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Price</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Date of Sale</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Category</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Sold</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {transactions.map(transaction => (
                            <tr key={transaction._id}>
                                <td className="w-1/3 text-left py-3 px-4">{transaction.title}</td>
                                <td className="w-1/3 text-left py-3 px-4">{transaction.description}</td>
                                <td className="text-left py-3 px-4">${transaction.price}</td>
                                <td className="text-left py-3 px-4">{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                                <td className="text-left py-3 px-4">{transaction.category}</td>
                                <td className="text-left py-3 px-4">{transaction.sold ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div className="mt-4">
                <button onClick={() => onPageChange(1)} className="mr-2 px-4 py-2 bg-blue-500 text-white rounded">First</button>
                <button onClick={() => onPageChange(prev => Math.max(prev - 1, 1))} className="mr-2 px-4 py-2 bg-blue-500 text-white rounded">Previous</button>
                <button onClick={() => onPageChange(prev => prev + 1)} className="px-4 py-2 bg-blue-500 text-white rounded">Next</button>
            </div>
        </div>
    );
};

export default TransactionsTable;
