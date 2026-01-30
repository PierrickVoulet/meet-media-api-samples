/**
 * Main server file for bidi-demo-ts.
 * Serves static files for the Meet Add-on.
 */
import express from "express";
import http from "http";
import path from "path";

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
