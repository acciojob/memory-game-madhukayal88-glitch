const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_request, response) => {
  response.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Memory game is running at http://localhost:${port}`);
});
