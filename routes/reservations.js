"use strict";

const express  = require("express");
const { body, validationResult } = require("express-validator");
const store    = require("./store");

const router = express.Router();

/* ── Validation rules ───────────────────────────────────────────────────── */
const reservationRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("phone")
    .trim()
    .matches(/^[+\d\s\-().]{7,20}$/)
    .withMessage("Valid phone number is required"),
  body("date")
    .isISO8601()
    .withMessage("Valid date is required")
    .custom((value) => {
      if (new Date(value) < new Date(new Date().toDateString())) {
        throw new Error("Date must be today or in the future");
      }
      return true;
    }),
  body("time").trim().notEmpty().withMessage("Time is required"),
  body("guests")
    .isInt({ min: 1, max: 20 })
    .withMessage("Guests must be between 1 and 20"),
  body("message").trim().optional(),
];

/* ── POST /api/reservations ─────────────────────────────────────────────── */
router.post("/", reservationRules, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, email, phone, date, time, guests, message } = req.body;
  const record = store.insert("reservations", {
    name,
    email,
    phone,
    date,
    time,
    guests: Number(guests),
    message: message || "",
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({
    success: true,
    message: `Thank you, ${name}! Your table for ${guests} on ${date} at ${time} has been reserved.`,
    reservation: record,
  });
});

/* ── GET /api/reservations  (simple admin read) ─────────────────────────── */
router.get("/", (_req, res) => {
  const all = store.read("reservations");
  res.json(all);
});

module.exports = router;
