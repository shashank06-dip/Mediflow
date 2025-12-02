const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {

  // Allow communication from frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === "/receive" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      console.log("Received from truck:", body);

      let data;
      try {
        data = JSON.parse(body);
      } catch (err) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid JSON");
        return;
      }

      const timestamp = Date.now();
      const filename = `truck_${data.truck.id}_${timestamp}.json`;
      const folderPath = path.join(__dirname, "routes");
      const filePath = path.join(folderPath, filename);

      fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) {
          console.error("Folder create error:", err);
        } else {
          fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
            if (err) {
              console.error("Save error:", err);
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Error saving file");
              return;
            }
            console.log("Route saved:", filePath);
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("Route received and saved successfully! 🚛💾");
          });
        }
      });
    });
    return;
  }

  const htmlFile = path.join(__dirname, "index.html");
  fs.readFile(htmlFile, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error loading index.html");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
});

// REQUIRED: Dynamic port for Render
const p = process.env.PORT || 2000;
server.listen(p, () => {
  console.log(`Backend running on PORT ${p}`);
});
