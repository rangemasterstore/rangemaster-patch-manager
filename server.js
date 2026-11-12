
const http = require("node:http");

const PORT = process.env.PORT || 3000;

 

const server = http.createServer((req, res) => {
   if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "application/json"
    });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8"
  });

  res.end(`
    <html lang="sv">
      <head>
<meta name="shopify-api-key" content="${process.env.SHOPIFY_API_KEY}">
<script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>

        <meta charset="UTF-8">
        <title>RangeMaster Patch Manager</title>
      </head>
      <body style="font-family:Arial;padding:40px">
        <h1>RangeMaster Patch Manager</h1>
        <h2>Servern fungerar!</h2>
        <p>Shopify-integrationen byggs nu.</p>
      </body>
    </html>
  `);
});
server.listen(PORT, "0.0.0.0", () => {
  console.log("Servern startad på port " + PORT);
});
