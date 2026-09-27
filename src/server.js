/**
 * server.js — Express dev server for the Memory Matching Game.
 * Serves static files from ./public and listens on PORT || 8080.
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static assets from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback: serve index.html for any GET that isn't a static file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Memory Matching Game running at http://localhost:${PORT}`);
});
