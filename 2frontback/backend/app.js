const express = require("express");
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.get("/", (req, res, next) => {
  res.send("Server is ready");
});

const jokes = [
  { id: 1, title: "A joke", content: "This is joke 1" },
  { id: 2, title: "Another joke", content: "This is joke 2" },
  { id: 3, title: "Yet another joke", content: "This is joke 3" },
  { id: 4, title: "One more joke", content: "This is joke 4" },
  { id: 5, title: "The last joke", content: "This is joke 5" }
];

app.get("/api/jokes", (req, res) => {
  res.json(jokes);
});

app.listen(PORT, () => {
  console.log(`APP listen on ${PORT}`);
});
