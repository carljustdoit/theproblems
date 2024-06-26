const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Configure middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Connect to SQLite database
const db = new sqlite3.Database('responses.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the database');

        // Create 'responses' table if it doesn't exist
        db.run('CREATE TABLE IF NOT EXISTS responses (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, timestamp TEXT)', (createErr) => {
            if (createErr) {
                console.error('Error creating table:', createErr.message);
            } else {
                console.log('Table "responses" created successfully');
            }
        });
    }
});

// Define routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// Modify the 'submit' route to include timestamp
app.post('/submit', (req, res) => {
    const { response } = req.body;
    const timestamp = new Date().toISOString(); // Get current timestamp
    db.run('INSERT INTO responses (text, timestamp) VALUES (?, ?)', [response, timestamp], function(err) {
        if (err) {
            console.error('Error inserting response:', err.message);
            res.status(500).send('Error submitting response');
        } else {
            console.log('Response submitted successfully');
            res.redirect('/view.html');
        }
    });
});

app.get('/view', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/view.html'));
});

// Fetch data from the database when /data route is accessed
app.get('/data', (req, res) => {
    db.all('SELECT * FROM responses', (err, rows) => {
        if (err) {
            console.error('Error fetching responses:', err.message);
            res.status(500).send('Error fetching responses');
        } else {
            res.json(rows);
        }
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
