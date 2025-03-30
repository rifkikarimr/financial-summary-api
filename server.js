require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Process financial data
app.post('/process', async (req, res) => {
  try {
    const { transactions } = req.body;

    // Example: Categorizing transactions
    const categorizedData = transactions.map(row => ({
      description: row[0],
      amount: row[1],
      category: row[1] > 0 ? 'Income' : 'Expense'
    }));

    // Insert into DB (optional)
    for (let item of categorizedData) {
      await pool.query(
        `INSERT INTO transactions (description, amount, category) VALUES ($1, $2, $3)`,
        [item.description, item.amount, item.category]
      );
    }

    // Summarize
    const summary = {
      totalIncome: categorizedData.filter(t => t.category === 'Income').reduce((sum, t) => sum + t.amount, 0),
      totalExpense: categorizedData.filter(t => t.category === 'Expense').reduce((sum, t) => sum + t.amount, 0)
    };

    res.json({ summary });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(3000, () => console.log('API running on port 3000'));
