"use strict";

const express      = require("express");
const helmet       = require("helmet");
const cors         = require("cors");
const morgan       = require("morgan");
const path         = require("path");
const rateLimit    = require("express-rate-limit");

const reservationsRouter = require("./routes/reservations");
const contactRouter      = require("./routes/contact");
const menuRouter         = require("./routes/menu");

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ─────────────────────────────────────────────────────────── */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "fonts.googleapis.com"],
        styleSrc:    ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdnjs.cloudflare.com"],
        fontSrc:     ["'self'", "fonts.gstatic.com", "cdnjs.cloudflare.com"],
        imgSrc:      ["'self'", "data:", "images.unsplash.com", "i.pravatar.cc"],
        connectSrc:  ["'self'"],
      },
    },
  })
);
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Rate limiting ──────────────────────────────────────────────────────── */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Generous limit for page loads (static HTML)
const pageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

/* ── Static files ───────────────────────────────────────────────────────── */
app.use(express.static(path.join(__dirname, "public")));

/* ── API routes ─────────────────────────────────────────────────────────── */
app.use("/api/reservations", apiLimiter, reservationsRouter);
app.use("/api/contact",      apiLimiter, contactRouter);
app.use("/api/menu",         apiLimiter, menuRouter);

/* ── Health check ───────────────────────────────────────────────────────── */
app.get("/api/health", (_req, res) => res.json({ status: "ok", cafe: "Brew Casa" }));

/* ── SPA fallback: serve index.html for any unmatched GET route ─────────── */
app.get("*", pageLimiter, (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ── Error handler ──────────────────────────────────────────────────────── */
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

/* ── Start ──────────────────────────────────────────────────────────────── */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`☕  Brew Casa server running → http://localhost:${PORT}`);
  });
}

module.exports = app;

