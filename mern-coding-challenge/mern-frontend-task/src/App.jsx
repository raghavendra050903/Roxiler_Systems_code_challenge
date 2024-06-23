import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionsTable from './components/TransactionsTable';
import StatisticsBox from './components/StatisticsBox';
import BarChart from './components/BarChart';

const App = () => {
    const [transactions, setTransactions] = useState([]);
    const [year, setYear] = useState('2021');  // Default to 2021
    const [month, setMonth] = useState('01');  // Default to January
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const monthQuery = `${year}-${month}`;
                const response = await axios.get(`http://localhost:3001/api/transactions?month=${monthQuery}&page=${page}&search=${search}`);
                setTransactions(response.data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };

        fetchTransactions();
    }, [year, month, search, page]);

    const handleYearChange = (e) => {
        setYear(e.target.value);
    };

    const handleMonthChange = (e) => {
        setMonth(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Transaction Dashboard</h1>
            <div className="mb-4">
                <label className="block mb-2">
                    Year:
                    <select value={year} onChange={handleYearChange} className="ml-2 p-2 border rounded">
                        <option value="2020">2020</option>
                        <option value="2021">2021</option>
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                    </select>
                </label>
                <label className="block mb-2">
                    Month:
                    <select value={month} onChange={handleMonthChange} className="ml-2 p-2 border rounded">
                        <option value="01">January</option>
                        <option value="02">February</option>
                        <option value="03">March</option>
                        <option value="04">April</option>
                        <option value="05">May</option>
                        <option value="06">June</option>
                        <option value="07">July</option>
                        <option value="08">August</option>
                        <option value="09">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                    </select>
                </label>
                <label className="block mb-2">
                    Search:
                    <input type="text" value={search} onChange={handleSearchChange} className="ml-2 p-2 border rounded" />
                </label>
            </div>
            <StatisticsBox selectedMonth={`${year}-${month}`} />
            <BarChart selectedMonth={`${year}-${month}`} />
            <TransactionsTable transactions={transactions} onPageChange={handlePageChange} />
        </div>
    );
};

export default App;
