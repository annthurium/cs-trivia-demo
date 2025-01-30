const express = require("express");
const path = require("path");
const fs = require("fs");
const { generate } = require("./openAIClient");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from 'static' directory
app.use("/static", express.static("static"));

app.post("/generate", async (req, res) => {
  try {
    const studentName = req.body.studentName;
    const result = await generate({ NAME: studentName });
    res.json({ success: true, result });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.get("/", (req, res) => {
  fs.readFile(
    path.join(__dirname, "static/index.html"),
    "utf8",
    (err, data) => {
      if (err) {
        res.status(500).send("Error loading page");
        return;
      }
      res.send(data);
    }
  );
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
