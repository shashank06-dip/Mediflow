const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
  // -----------------------------
  // POST /receive endpoint
  // -----------------------------
  if (req.url === "/receive" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      console.log("Received from truck:", body);

      // Parse JSON
      let data;
      try {
        data = JSON.parse(body);
      } catch (err) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid JSON");
        return;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `truck_${data.truck.id}_${timestamp}.json`;
      const folderPath = path.join(__dirname, "routes");
      const filePath = path.join(folderPath, filename);

      // Ensure folder exists
      fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) {
          console.error("Error creating folder:", err);
        } else {
          // Write JSON to file
          fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
            if (err) {
              console.error("Error saving file:", err);
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Error saving file");
              return;
            }
            console.log("Route saved to", filePath);
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("Route received and saved successfully! ✅");
          });
        }
      });
    });
    return;
  }

  // -----------------------------
  // Serve index.html
  // -----------------------------
  const filePath = path.join(__dirname, "index.html");
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error loading index.html");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
});
const p = 2000;
server.listen(p, () => {
  console.log(`Server running at http://localhost:${p}`);
});
