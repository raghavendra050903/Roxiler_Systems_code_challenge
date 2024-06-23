import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StatisticsBox = ({ selectedMonth }) => {
  const [statistics, setStatistics] = useState({
    totalAmount: 0,
    totalSold: 0,
    totalNotSold: 0,
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/statistics`,
          {
            params: { month: selectedMonth },
          }
        );
        setStatistics(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    if (selectedMonth) {
      fetchStatistics();
    }
  }, [selectedMonth]);

  return (
    <div className="mb-4 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">Transactions Statistics</h2>
      {selectedMonth ? (
        <div>
          <p className="mb-2">Total Amount of Sale: ${statistics.totalAmount.toFixed(2)}</p>
          <p className="mb-2">Total Sold Items: {statistics.totalSold}</p>
          <p>Total Not Sold Items: {statistics.totalNotSold}</p>
        </div>
      ) : (
        <p className="text-gray-500">Please select a month to view statistics.</p>
      )}
    </div>
  );
};

export default StatisticsBox;
