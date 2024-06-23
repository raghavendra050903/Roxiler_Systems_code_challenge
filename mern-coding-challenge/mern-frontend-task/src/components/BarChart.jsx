import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart, BarElement, CategoryScale, LinearScale, BarController, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register necessary components and scales
Chart.register(BarElement, CategoryScale, LinearScale, BarController, Title, Tooltip, Legend);

const BarChart = ({ selectedMonth }) => {
  const [barChartData, setBarChartData] = useState(null);

  useEffect(() => {
    const fetchBarChartData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/bar-chart`, {
          params: { month: selectedMonth },
        });
        setBarChartData(response.data);
      } catch (error) {
        console.error('Error fetching bar chart data:', error);
      }
    };
    fetchBarChartData();
  }, [selectedMonth]);

  if (!barChartData) {
    return <p>Loading...</p>;
  }

  const data = {
    labels: barChartData.map(item => item.priceRange),
    datasets: [
      {
        label: 'Number of Items',
        data: barChartData.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Transactions Bar Chart</h2>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-lg">
          <Bar data={data} options={{
            scales: {
              x: {
                type: 'category',
                labels: data.labels,
              },
              y: {
                beginAtZero: true,
              },
            },
          }} />
        </div>
      </div>
    </div>
  );
};

export default BarChart;
