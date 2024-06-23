// controllers/transactionController.js

const axios = require('axios');
const Transaction = require('../models/transaction');

// Initialize database with seed data from external API
exports.initializeDatabase = async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        await Transaction.deleteMany({});
        await Transaction.insertMany(response.data);
        res.send('Database initialized with seed data');
    } catch (error) {
        console.error('Initialization error:', error.message);
        res.status(500).json({ error: 'Failed to initialize database' });
    }
};

// List transactions with search and pagination
// exports.listTransactions = async (req, res) => {
//     const { month, page = 1, perPage = 10, search = '' } = req.query;
//     try {
//         const regex = new RegExp(search, 'i');
//         const startDate = new Date(`${month}-01`);
//         const endDate = new Date(`${month}-31`);
//         const transactions = await Transaction.find({
//             $and: [
//                 { dateOfSale: { $gte: startDate, $lt: endDate } },
//                 { $or: [
//                     { title: regex },
//                     { description: regex }
//                 ]}
//             ]
//         }).skip((page - 1) * perPage).limit(parseInt(perPage));
//         res.json(transactions);


//     } catch (error) {
//         console.error('Fetch transactions error:', error.message);
//         res.status(500).json({ error: 'Failed to fetch transactions' });
//     }
// };

exports.listTransactions = async (req, res) => {
    const { month, page = 1, perPage = 10, search = '' } = req.query;

    try {
        const regex = new RegExp(search, 'i');
        const [year, monthNumber] = month.split('-');

        const startDate = new Date(Date.UTC(year, monthNumber - 1, 1));
        const endDate = new Date(Date.UTC(year, monthNumber, 31, 23, 59, 59, 999));

        // Log the query parameters
        console.log('Query Parameters:', { month, page, perPage, search });
        console.log('Constructed Dates:', { startDate, endDate });

        const query = {
            $and: [
                { dateOfSale: { $gte: startDate, $lt: endDate } },
                {
                    $or: [
                        { title: { $regex: regex } },
                        { description: { $regex: regex } }
                    ]
                }
            ]
        };

        // Log the constructed query
        console.log('Constructed Query:', JSON.stringify(query, null, 2));

        const transactions = await Transaction.find(query)
            .skip((page - 1) * perPage)
            .limit(parseInt(perPage));

        // Log the results
        console.log('Query Results:', transactions);

        res.json(transactions);
    } catch (error) {
        console.error('Fetch transactions error:', error.message);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};




// Get statistics for total sale amount, sold items, and not sold items of selected month
exports.getStatistics = async (req, res) => {
    const { month } = req.query;
    try {
        const startDate = new Date(`${month}-01`);
        const endDate = new Date(`${month}-31`);
        const totalSales = await Transaction.aggregate([
            { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
            { $group: { _id: null, totalAmount: { $sum: '$price' }, totalSold: { $sum: 1 }, totalNotSold: { $sum: { $cond: [{ $eq: ['$sold', false] }, 1, 0] } } } }
        ]);
        res.json(totalSales[0] || { totalAmount: 0, totalSold: 0, totalNotSold: 0 });
    } catch (error) {
        console.error('Statistics error:', error.message);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

// Get bar chart data for price ranges and number of items in each range for selected month
exports.getBarChartData = async (req, res) => {
    const { month } = req.query;
    try {
        const startDate = new Date(`${month}-01`);
        const endDate = new Date(`${month}-31`);
        const priceRanges = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity];
        const rangeLabels = ['0-100', '101-200', '201-300', '301-400', '401-500', '501-600', '601-700', '701-800', '801-900', '901-above'];
        const barChartData = await Transaction.aggregate([
            { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
            {
                $bucket: {
                    groupBy: "$price",
                    boundaries: priceRanges,
                    default: "Other",
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        const formattedData = rangeLabels.map((label, index) => {
            const data = barChartData.find(d => d._id === priceRanges[index]);
            return { priceRange: label, count: data ? data.count : 0 };
        });

        res.json(formattedData);
    } catch (error) {
        console.error('Bar chart data error:', error.message);
        res.status(500).json({ error: 'Failed to fetch bar chart data' });
    }
};

// Get pie chart data for unique categories and number of items in each category for selected month
exports.getPieChartData = async (req, res) => {
    const { month } = req.query;
    try {
        const startDate = new Date(`${month}-01`);
        const endDate = new Date(`${month}-31`);
        const pieChartData = await Transaction.aggregate([
            { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        res.json(pieChartData);
    } catch (error) {
        console.error('Pie chart data error:', error.message);
        res.status(500).json({ error: 'Failed to fetch pie chart data' });
    }
};

// Get combined data from all endpoints
exports.getCombinedData = async (req, res) => {
    const { month } = req.query;
    try {
        const startDate = new Date(`${month}-01`);
        const endDate = new Date(`${month}-31`);
        const [transactions, statistics, barChart, pieChart] = await Promise.all([
            Transaction.find({ dateOfSale: { $gte: startDate, $lt: endDate } }),
            Transaction.aggregate([
                { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
                { $group: { _id: null, totalAmount: { $sum: '$price' }, totalSold: { $sum: 1 }, totalNotSold: { $sum: { $cond: [{ $eq: ['$sold', false] }, 1, 0] } } } }
            ]),
            Transaction.aggregate([
                { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
                {
                    $bucket: {
                        groupBy: "$price",
                        boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity],
                        default: "Other",
                        output: { count: { $sum: 1 } }
                    }
                }
            ]),
            Transaction.aggregate([
                { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
                { $group: { _id: '$category', count: { $sum: 1 } } }
            ])
        ]);

        res.json({
            transactions,
            statistics: statistics[0] || { totalAmount: 0, totalSold: 0, totalNotSold: 0 },
            barChart,
            pieChart
        });
    } catch (error) {
        console.error('Combined data error:', error.message);
        res.status(500).json({ error: 'Failed to fetch combined data' });
    }
};


