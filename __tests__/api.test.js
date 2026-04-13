"use strict";

const request = require("supertest");
const app     = require("../server");
const fs      = require("fs");
const path    = require("path");

/* ── Helpers ─────────────────────────────────────────────────── */
const DATA_DIR = path.join(__dirname, "..", "data");

function cleanDataFile(name) {
  const file = path.join(DATA_DIR, `${name}.json`);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

afterAll(() => {
  cleanDataFile("reservations");
  cleanDataFile("messages");
});

/* ── Health ──────────────────────────────────────────────────── */
describe("GET /api/health", () => {
  it("returns 200 and status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.cafe).toBe("Brew Casa");
  });
});

/* ── Menu ────────────────────────────────────────────────────── */
describe("GET /api/menu", () => {
  it("returns all four menu categories", async () => {
    const res = await request(app).get("/api/menu");
    expect(res.status).toBe(200);
    ["coffee", "tea", "food", "desserts"].forEach((cat) =>
      expect(Array.isArray(res.body[cat])).toBe(true)
    );
  });

  it("returns items with name and price", async () => {
    const res = await request(app).get("/api/menu");
    expect(res.status).toBe(200);
    res.body.coffee.forEach((item) => {
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("price");
    });
  });
});

describe("GET /api/menu/:category", () => {
  it("returns coffee items", async () => {
    const res = await request(app).get("/api/menu/coffee");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("returns 404 for unknown category", async () => {
    const res = await request(app).get("/api/menu/unknown");
    expect(res.status).toBe(404);
  });
});

/* ── Reservations ────────────────────────────────────────────── */
describe("POST /api/reservations", () => {
  const VALID = {
    name:   "Alice Test",
    email:  "alice@example.com",
    phone:  "+1 555 000 0001",
    date:   futureDate(),
    time:   "07:00 AM",
    guests: 2,
  };

  it("creates a reservation with valid data", async () => {
    const res = await request(app).post("/api/reservations").send(VALID);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.reservation).toHaveProperty("id");
    expect(res.body.reservation.name).toBe("Alice Test");
  });

  it("rejects missing name", async () => {
    const res = await request(app)
      .post("/api/reservations")
      .send({ ...VALID, name: "" });
    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it("rejects invalid email", async () => {
    const res = await request(app)
      .post("/api/reservations")
      .send({ ...VALID, email: "not-an-email" });
    expect(res.status).toBe(422);
  });

  it("rejects past date", async () => {
    const res = await request(app)
      .post("/api/reservations")
      .send({ ...VALID, date: "2000-01-01" });
    expect(res.status).toBe(422);
  });

  it("rejects guests > 20", async () => {
    const res = await request(app)
      .post("/api/reservations")
      .send({ ...VALID, guests: 25 });
    expect(res.status).toBe(422);
  });
});

describe("GET /api/reservations", () => {
  it("returns an array", async () => {
    const res = await request(app).get("/api/reservations");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

/* ── Contact ─────────────────────────────────────────────────── */
describe("POST /api/contact", () => {
  const VALID = {
    name:    "Bob Test",
    email:   "bob@example.com",
    subject: "Table inquiry",
    message: "Hello, I would like to ask about large group bookings.",
  };

  it("creates a contact message with valid data", async () => {
    const res = await request(app).post("/api/contact").send(VALID);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBeDefined();
  });

  it("rejects missing subject", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ ...VALID, subject: "" });
    expect(res.status).toBe(422);
  });

  it("rejects message that is too short", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ ...VALID, message: "Hi" });
    expect(res.status).toBe(422);
  });
});

describe("GET /api/contact", () => {
  it("returns an array", async () => {
    const res = await request(app).get("/api/contact");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

/* ── Static files ─────────────────────────────────────────────── */
describe("Static files", () => {
  it("serves index.html at /", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toMatch(/html/);
  });
});

/* ── Helpers ─────────────────────────────────────────────────── */
function futureDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}
