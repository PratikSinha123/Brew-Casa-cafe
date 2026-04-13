# ☕ Brew Casa Cafe Website

A modern, full-stack cafe website for **Brew Casa** — built with a beautiful UI/UX and a Node.js/Express backend.

## ✨ Features

### Frontend
- **Hero section** — full-screen background with parallax overlay, animated title, and CTA buttons
- **Features strip** — highlights specialty coffee, fresh ingredients, free Wi-Fi, and live music
- **About section** — cafe story, stats (25+ menu items, 50k+ happy guests, 4.9★ rating), and image
- **Dynamic Menu** — four tabbed categories (Coffee, Tea, Food, Desserts) fetched live from the API
- **Photo Gallery** — responsive masonry-style grid with an image lightbox
- **Reservation form** — validated client-side and server-side; saves to persistent JSON store
- **Testimonials carousel** — auto-advancing with dot navigation
- **Contact form** — validated and saved via API
- **Footer** — quick links, opening hours, social links
- Sticky navbar with scroll-aware highlighting and mobile hamburger menu
- Back-to-top button
- Fully **responsive** (mobile, tablet, desktop)

### Backend (Express.js API)
| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check |
| `/api/menu` | GET | All menu categories |
| `/api/menu/:category` | GET | Items for a specific category |
| `/api/reservations` | GET | List all reservations |
| `/api/reservations` | POST | Create a reservation |
| `/api/contact` | GET | List all messages |
| `/api/contact` | POST | Submit a contact message |

- Input validation with `express-validator`
- Security headers with `helmet`
- JSON file-based persistence in `data/`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone <repo-url>
cd brew-casa-cafe
npm install
```

### Run in development

```bash
npm run dev   # uses nodemon for auto-reload
```

### Run in production

```bash
npm start
```

Visit **http://localhost:3000** in your browser.

## 🧪 Tests

```bash
npm test
```

16 tests covering all API endpoints (health, menu, reservations, contact, static files).

## 📁 Project Structure

```
brew-casa-cafe/
├── server.js              # Express app entry point
├── routes/
│   ├── menu.js            # Menu API
│   ├── reservations.js    # Reservation API
│   ├── contact.js         # Contact API
│   └── store.js           # JSON file store utility
├── public/
│   ├── index.html         # Single-page frontend
│   ├── css/style.css      # Styles
│   └── js/main.js         # Client-side JS
├── data/                  # Persistent JSON data (auto-created)
├── __tests__/
│   └── api.test.js        # Jest + Supertest API tests
└── package.json
```

## 🎨 Design

- **Palette**: Espresso brown, caramel gold, cream white
- **Fonts**: Playfair Display (headings) + Poppins (body)
- **Icons**: Font Awesome 6
- **Images**: Unsplash (loaded via CDN)
