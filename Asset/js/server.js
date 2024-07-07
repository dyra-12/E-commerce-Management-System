const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;
app.use(express.static('html'));
// Use body-parser to parse JSON bodies
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 200
}));

const pool = mysql.createPool({
    host: 'Dyutis-MacBook-Air.local',
    user: 'root',
    password: 'gablo9876',
    database: 'proj',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.post('/signup', (req, res) => {
    const { full_name, last_name, email, phone_no, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    //const hashedPassword = require('crypto').createHash('sha256').update(password).digest('hex');
    const hashedPassword = password;
    

    const sql = `INSERT INTO Users (full_name, last_name, email, phone_no, password) VALUES (?, ?, ?, ?, ?)`;
    const values = [full_name, last_name, email, phone_no, hashedPassword];

    pool.query(sql, values, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.status(200).json({ message: 'User registered successfully!' });
    });
});



app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Hash the incoming password before querying the database
    //const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const hashedPassword = password

    const sql = `SELECT id FROM Users WHERE email = ? AND password = ?`;
    const values = [email, hashedPassword];

    pool.query(sql, values, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const userId = results[0].id; // Assuming 'id' is the column name in your Users table

        // User authenticated successfully, send user ID in response
        res.status(200).json({ message: 'Login successful!', userId });
    });
});

app.get('/fetchdetails/:userId', (req, res) => {
    const userId = req.params.userId;

    const sql = `SELECT full_name, last_name, email FROM Users WHERE id = ?`;
    const values = [userId];

    pool.query(sql, values, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userDetails = results[0];

        // Send user details in response
        res.status(200).json(userDetails);
    });
});

app.get('/userInfo', (req, res) => {
    const sql = `SELECT id,full_name, last_name, email,phone_no FROM Users`;

    pool.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }

        // Send all user information in response
        res.status(200).json(results);
    });
});

app.get('/categoryInfo', (req, res) => {
    const sql = `SELECT * FROM Category`;

    pool.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }

        // Send all user information in response
        res.status(200).json(results);
    });
});

app.get('/productInfo', (req, res) => {
    const sql = `SELECT * FROM products`;

    pool.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }

        // Send all user information in response
        res.status(200).json(results);
    });
});








app.options('*', cors()); // Pre-flight OPTIONS request

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});