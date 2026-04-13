"use strict";

const express = require("express");
const helmet  = require("helmet");
const cors    = require("cors");
const morgan  = require("morgan");
const path    = require("path");

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

/* ── Static files ───────────────────────────────────────────────────────── */
app.use(express.static(path.join(__dirname, "public")));

/* ── API routes ─────────────────────────────────────────────────────────── */
app.use("/api/reservations", reservationsRouter);
app.use("/api/contact",      contactRouter);
app.use("/api/menu",         menuRouter);

/* ── Health check ───────────────────────────────────────────────────────── */
app.get("/api/health", (_req, res) => res.json({ status: "ok", cafe: "Brew Casa" }));

/* ── SPA fallback: serve index.html for any unmatched route ─────────────── */
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ── 404 / error handlers ───────────────────────────────────────────────── */
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

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
