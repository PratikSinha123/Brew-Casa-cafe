"use strict";

const express  = require("express");
const { body, validationResult } = require("express-validator");
const store    = require("./store");

const router = express.Router();

/* ── Validation rules ───────────────────────────────────────────────────── */
const contactRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("subject").trim().notEmpty().withMessage("Subject is required"),
  body("message")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Message must be between 10 and 1000 characters"),
];

/* ── POST /api/contact ──────────────────────────────────────────────────── */
router.post("/", contactRules, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, email, subject, message } = req.body;
  const record = store.insert("messages", {
    name,
    email,
    subject,
    message,
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({
    success: true,
    message: `Thanks for reaching out, ${name}! We'll reply to ${email} shortly.`,
    id: record.id,
  });
});

/* ── GET /api/contact  (simple admin read) ──────────────────────────────── */
router.get("/", (_req, res) => {
  const all = store.read("messages");
  res.json(all);
});

module.exports = router;
