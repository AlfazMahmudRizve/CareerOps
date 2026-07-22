// Usage:
//   node scripts/check-port.js              # uses PORT from .env.local or 3000
//   node scripts/check-port.js 3001         # checks a specific port
const net = require("net");

// Best-effort: load .env.local without adding a dependency
try {
  const fs = require("fs");
  const path = require("path");
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !process.env[m[1]]) {
        let v = m[2];
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        process.env[m[1]] = v;
      }
    }
  }
} catch (_) { /* ignore */ }

// CLI arg wins, then env, then default.
const requested = Number(process.env.PORT || process.argv[2] || 3000);
const host = "0.0.0.0";

const tester = net.createServer();

tester.once("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`[BUSY]  Port ${requested} is already in use on ${host}.`);
    console.log("        Try a different port:");
    console.log(`          node scripts/check-port.js 3001`);
    console.log("        Or stop the process holding it (Windows):");
    console.log(`          netstat -ano | findstr :${requested}`);
    console.log(`          taskkill /PID <pid> /F`);
    process.exit(1);
  }
  console.error(`[ERROR] ${err.code || ""} ${err.message}`);
  process.exit(2);
});

tester.once("listening", () => {
  tester.close(() => {
    console.log(`[FREE]  Port ${requested} is available.`);
    console.log(`        Start the dev server with: PORT=${requested} npm run dev`);
    process.exit(0);
  });
});

tester.listen(requested, host);
