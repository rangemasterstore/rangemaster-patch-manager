
const http = require("node:http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8"
  });

  res.end(`
    <!DOCTYPE html>
    <html lang="sv">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>RangeMaster Patch Manager</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f6f6f7;
          padding: 30px;
          color: #202223;
        }
        main {
          max-width: 650px;
          margin: auto;
          background: white;
          padding: 30px;
          border-radius: 12px;
        }
        h1 { color: #a32128; }
      </style>
    </head>
    <body>
      <main>
        <h1>RangeMaster Patch Manager</h1>
        <p>Appens grundserver fungerar!</p>
        <p>Nästa steg: Shopify-inloggning, kamera,
        produktsökning och lagerhantering.</p>
      </main>
    </body>
    </html>
  `);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("RangeMaster Patch Manager körs på port " + PORT);
});
