import express from "express";
import fetch from "node-fetch";
import fs from "fs";
import cors from "cors";


const app = express();
const PORT = 3000;

app.use(cors({
  origin: "http://localhost:5500"
}));

// Load paper map once
const papers = JSON.parse(fs.readFileSync("./papers.json", "utf8"));

/**
 * GET /api/pdf/:date
 * Streams PDF from Google Drive to browser
 */
app.get("/", (req, res) => {
  res.send("Backend is alive");
});
app.get("/api/pdf/:date", async (req, res) => {
  try {
    const { date } = req.params;
    console.log("Requested date:", date);
    const paper = papers[date];
    console.log("Paper entry:", paper);

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    const driveUrl = `https://drive.google.com/uc?export=download&id=${paper.fileId}`;

    const driveRes = await fetch(driveUrl);

    if (!driveRes.ok) {
      return res.status(502).json({ error: "Failed to fetch from Google Drive" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    driveRes.body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
