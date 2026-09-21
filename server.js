const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Memory Game running at http://localhost:${PORT}`);
});
