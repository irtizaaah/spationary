const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');  // File system module to store instructions in a file

const app = express();
const PORT = 3001;

// Middleware to parse incoming JSON bodies
app.use(bodyParser.json());

// Store instructions in a file
let instructionsList = [];

// Endpoint to receive instructions
app.post('/receive-instructions', (req, res) => {
    const { instructions } = req.body;

    if (!instructions || !Array.isArray(instructions)) {
        return res.status(400).json({ status: 'error', message: 'Invalid instructions' });
    }

    // Store the instructions (append them to the list)
    instructionsList.push(...instructions);

    // Optionally, write the instructions to a file for persistent storage
    fs.writeFileSync('instructions.json', JSON.stringify(instructionsList, null, 2));

    // Respond with success
    res.json({ status: 'success', message: 'Instructions received successfully' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
