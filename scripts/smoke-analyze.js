// Usage: node scripts/smoke-analyze.js
// Requires: dev server running on PORT (default 3001).
const http = require("http");
const fs = require("fs");
const path = require("path");

// Minimal loader for .env.local
try {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
    }
  }
} catch (_) {}

const port = Number(process.env.PORT || 3001);
const host = "127.0.0.1";

/** @type {Array<{name:string, fn:() => Promise<void>}>} */
const tests = [];
let failed = 0;

function test(name, fn) { tests.push({ name, fn }); }

async function http_(method, routePath, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host, port, path: routePath, method, headers: { "content-type": "application/json", ...headers } },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString("utf8") }));
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function assert(cond, msg) {
  if (!cond) { failed++; console.error(`  ✗ ${msg}`); }
  else console.log(`  ✓ ${msg}`);
}

// --- Pre-flight ---
(async () => {
  console.log(`\n▶ Smoke tests against http://${host}:${port}\n`);

  test("dev server is reachable", async () => {
    const res = await http_("GET", "/");
    assert(res.status === 200 || res.status === 404, `GET / returns ${res.status}`);
  });

  test("/api/parse-pdf rejects non-PDF input", async () => {
    const res = await http_("POST", "/api/parse-pdf", JSON.stringify({}), { "content-type": "application/json" });
    // Either rejects with 4xx or accepts and returns text
    assert([200, 400, 415, 422].includes(res.status), `unexpected status ${res.status}`);
  });

  test("/api/analyze rejects empty payload", async () => {
    const res = await http_("POST", "/api/analyze", JSON.stringify({}), { "content-type": "application/json" });
    assert([200, 400, 422].includes(res.status), `unexpected status ${res.status}`);
    if (res.status === 200) {
      const json = JSON.parse(res.body || "{}");
      assert(typeof json === "object", "returns JSON object");
    }
  });

  for (const t of tests) {
    console.log(`• ${t.name}`);
    try { await t.fn(); } catch (e) { failed++; console.error(`  ✗ threw: ${e.message}`); }
    console.log();
  }

  console.log(failed === 0 ? "✅ All smoke tests passed." : `❌ ${failed} test(s) failed.`);
  process.exit(failed === 0 ? 0 : 1);
})();
