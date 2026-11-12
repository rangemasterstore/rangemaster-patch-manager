
const http = require("node:http");
const { jwtVerify } = require("jose");

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.SHOPIFY_API_KEY;
const API_SECRET = process.env.SHOPIFY_API_SECRET;
const SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN;

const html = `<!doctype html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="shopify-api-key" content="${API_KEY || ""}">
  <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
  <title>RangeMaster Patch Manager TEST</title>
</head>
<body style="font-family:Arial;padding:30px">
  <h1>RangeMaster Patch Manager TEST</h1>
  <p id="status">Kontrollerar Shopify-inloggningen...</p>

  <script>
    async function checkLogin() {
      const status = document.getElementById("status");

      try {
        if (!window.shopify || !window.shopify.idToken) {
          throw new Error("Shopify App Bridge är inte tillgängligt.");
        }

        const token = await window.shopify.idToken();

        const response = await fetch("/api/auth-check", {
          headers: {
            Authorization: "Bearer " + token
          }
        });

        if (!response.ok) {
          throw new Error("Servern kunde inte verifiera sessionen.");
        }

        const result = await response.json();
        status.textContent = result.message;
      } catch (error) {
        status.textContent = "Inloggningen kunde inte verifieras: "
          + error.message;
      }
    }

    checkLogin();
  </script>
</body>
</html>`;

async function verifyShopifyToken(req) {
  if (!API_KEY || !API_SECRET || !SHOP_DOMAIN) {
    throw new Error("Shopify-konfiguration saknas");
  }

  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    throw new Error("Inloggningstoken saknas");
  }

  const token = authorization.slice(7);
  const secret = new TextEncoder().encode(API_SECRET);

  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
    audience: API_KEY,
    clockTolerance: 5,
    requiredClaims: ["exp", "nbf", "iss", "dest"]
  });

  const destination = new URL(payload.dest);
  const issuer = new URL(payload.iss);

  if (
    destination.protocol !== "https:" ||
    destination.hostname !== SHOP_DOMAIN ||
    issuer.hostname !== SHOP_DOMAIN ||
    issuer.pathname !== "/admin"
  ) {
    throw new Error("Fel Shopify-butik");
  }

  return payload;
}

const server = http.createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;

  if (path === "/health" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "application/json"
    });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (path === "/api/auth-check" && req.method === "GET") {
    try {
      await verifyShopifyToken(req);

      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      });

      res.end(JSON.stringify({
        authenticated: true,
        message: "Shopify-inloggningen är verifierad!"
      }));
    } catch (error) {
      res.writeHead(401, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      });

      res.end(JSON.stringify({
        authenticated: false,
        message: "Ogiltig Shopify-session"
      }));
    }
    return;
  }

  if (path === "/" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8"
    });
    res.end(html);
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Servern startad på port " + PORT);
});
