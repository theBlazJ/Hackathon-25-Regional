const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static('public'));

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}));
}

function readData() {
    return JSON.parse(fs.readFileSync(DATA_FILE));
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get data by ID
app.get('/data/:id', (req, res) => {
    const id = req.params.id;
    const data = readData();
    res.json(data[id] || null);
});

// Save/update data by ID
app.post('/data/:id', (req, res) => {
    const id = req.params.id;
    const newData = req.body;
    const data = readData();
    data[id] = newData;
    writeData(data);
    res.json({ success: true });
});

// Delete data by ID
app.delete('/data/:id', (req, res) => {
    const id = req.params.id;
    const data = readData();
    if (data[id]) {
        delete data[id];
        writeData(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'ID not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
