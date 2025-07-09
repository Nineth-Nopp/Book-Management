const express = require('express');
const mysql = require('mysql');
const cors = require('cors'); 
const app = express();
const port = 3000; 


app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root',      
    password: '',      
    database: 'book_management_db' 
});

// เชื่อมต่อกับฐานข้อมูล
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database!');
});

// --- API ---

app.post('/books', (req, res) => {
    const { title, author, published_year, genre } = req.body;

    if (!title || !author) {
        return res.status(400).json({ message: 'Title and Author are required.' });
    }

    const query = 'INSERT INTO books (title, author, published_year, genre) VALUES (?, ?, ?, ?)';
    db.query(query, [title, author, published_year, genre], (err, result) => {
        if (err) {
            console.error('Error adding book:', err);
            return res.status(500).json({ message: 'Error adding book', error: err.message });
        }
        res.status(201).json({ message: 'Book added successfully', bookId: result.insertId });
    });
});

app.get('/books', (req, res) => {
    const searchTerm = req.query.search; 

    let query = 'SELECT * FROM books';
    const queryParams = [];

    if (searchTerm) {
        query += ' WHERE title LIKE ? OR author LIKE ? OR genre LIKE ?';
        const likeTerm = `%${searchTerm}%`;
        queryParams.push(likeTerm, likeTerm, likeTerm);
    }

    query += ' ORDER BY created_at DESC'; // เรียงตามเวลาที่สร้างล่าสุด

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error fetching books:', err);
            return res.status(500).json({ message: 'Error fetching books', error: err.message });
        }
        res.status(200).json(results);
    });
});

app.get('/books/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM books WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error fetching book:', err);
            return res.status(500).json({ message: 'Error fetching book', error: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json(result[0]);
    });
});

app.put('/books/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, published_year, genre } = req.body;

    
    if (!title || !author) {
        return res.status(400).json({ message: 'Title and Author are required for update.' });
    }

    const query = 'UPDATE books SET title = ?, author = ?, published_year = ?, genre = ? WHERE id = ?';
    db.query(query, [title, author, published_year, genre, id], (err, result) => {
        if (err) {
            console.error('Error updating book:', err);
            return res.status(500).json({ message: 'Error updating book', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Book not found or no changes made' });
        }
        res.status(200).json({ message: 'Book updated successfully' });
    });
});


app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM books WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting book:', err);
            return res.status(500).json({ message: 'Error deleting book', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json({ message: 'Book deleted successfully' });
    });
});


app.listen(port, () => {
    console.log(`Book Management API listening at http://localhost:${port}`);
});
