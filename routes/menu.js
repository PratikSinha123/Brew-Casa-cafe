"use strict";

const express = require("express");
const router  = express.Router();

/* ── Static menu data ───────────────────────────────────────────────────── */
const MENU = {
  coffee: [
    { id: "c1", name: "Espresso",          price: 3.50, description: "Rich, bold single shot" },
    { id: "c2", name: "Cappuccino",         price: 4.50, description: "Espresso with steamed milk foam" },
    { id: "c3", name: "Flat White",         price: 4.75, description: "Velvety microfoam over espresso" },
    { id: "c4", name: "Caramel Macchiato",  price: 5.25, description: "Vanilla, milk, espresso & caramel drizzle" },
    { id: "c5", name: "Cold Brew",          price: 5.00, description: "12-hour steeped, served over ice" },
    { id: "c6", name: "Affogato",           price: 5.50, description: "Espresso poured over vanilla ice cream" },
  ],
  tea: [
    { id: "t1", name: "Masala Chai",        price: 3.75, description: "Spiced tea with steamed milk" },
    { id: "t2", name: "Matcha Latte",       price: 5.00, description: "Ceremonial grade matcha with oat milk" },
    { id: "t3", name: "Earl Grey",          price: 3.25, description: "Classic bergamot black tea" },
    { id: "t4", name: "Hibiscus Cooler",    price: 4.00, description: "Hibiscus, mint & lemon over ice" },
  ],
  food: [
    { id: "f1", name: "Avocado Toast",       price: 8.50,  description: "Sourdough, smashed avo, chilli flakes" },
    { id: "f2", name: "Eggs Benedict",       price: 10.50, description: "Poached eggs, hollandaise, English muffin" },
    { id: "f3", name: "Belgian Waffles",     price: 9.00,  description: "Warm waffles with fresh berries & syrup" },
    { id: "f4", name: "Croissant Sandwich",  price: 7.75,  description: "Ham, Swiss cheese & Dijon mustard" },
    { id: "f5", name: "Acai Bowl",           price: 9.50,  description: "Blended acai, granola & tropical fruits" },
  ],
  desserts: [
    { id: "d1", name: "Tiramisu",            price: 6.50, description: "Classic Italian espresso dessert" },
    { id: "d2", name: "Cheesecake Slice",    price: 5.75, description: "New York-style with berry coulis" },
    { id: "d3", name: "Chocolate Lava Cake", price: 7.00, description: "Warm dark chocolate with vanilla ice cream" },
    { id: "d4", name: "Cinnamon Roll",       price: 4.50, description: "Fresh-baked, cream cheese frosted" },
  ],
};

/* ── GET /api/menu ──────────────────────────────────────────────────────── */
router.get("/", (_req, res) => res.json(MENU));

/* ── GET /api/menu/:category ─────────────────────────────────────────────── */
router.get("/:category", (req, res) => {
  const cat = req.params.category.toLowerCase();
  if (!MENU[cat]) {
    return res.status(404).json({ error: `Category '${cat}' not found` });
  }
  res.json(MENU[cat]);
});

module.exports = router;
