const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Define file path and name
const filePath = path.join(__dirname, 'tabData.json');

// Function to check if 24 hours have passed since last reset
function shouldCreateNewEntry(lastEntryDate) {
  if (!lastEntryDate) {
    return true;
  }
  const lastDate = new Date(lastEntryDate);
  const now = new Date();
  return (now - lastDate) >= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
}

// POST endpoint to receive and log data
app.post('/monitor', (req, res) => {
  console.log('Received data:', req.body);

  // Read existing data or initialize as empty array
  let jsonData = [];
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    if (data) {
      jsonData = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading file:', error);
  }

  // Get last entry from jsonData
  const lastEntry = jsonData.length > 0 ? jsonData[jsonData.length - 1] : null;

  // Check if new entry should be created
  if (shouldCreateNewEntry(lastEntry?.date)) {
    // Create new entry
    jsonData.push(req.body);
  } else {
    // Update existing entry with incremented values
    if (lastEntry) {
      lastEntry.scannedFiles += req.body.scannedFiles;
      lastEntry.problemFiles += req.body.problemFiles;
    }
  }

  // Write updated data back to file
  fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      res.status(500).json({ error: 'Failed to store data' });
    } else {
      console.log('Data written to file:', req.body);
      res.json({ status: 'success' });
    }
  });
});

// GET endpoint to serve tabData.json content
app.get('/tabData', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).json({ error: 'Failed to read data' });
    } else {
      let jsonData = [];
      try {
        if (data) {
          jsonData = JSON.parse(data);
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).json({ error: 'Failed to parse JSON data' });
        return;
      }
      res.json(jsonData);
    }
  });
});

// Serve static files from the 'public' directory (optional)
app.use(express.static('public'));

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
