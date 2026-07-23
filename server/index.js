// Import required modules
require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Create an instance of the Express application
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' })
});
// Set the port
const PORT = process.env.PORT || 5000;
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});