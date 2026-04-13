/* ============================================================
   Brew Casa – Main JavaScript
   ============================================================ */
"use strict";

/* ── Helpers ─────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Navbar: scroll effect + active link highlighting ─────────── */
(function initNavbar() {
  const navbar   = $("#navbar");
  const links    = $$(".nav-link");
  const sections = $$("section[id]");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);

    // Highlight active section in nav
    let current = "";
    sections.forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    links.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
    });
  }, { passive: true });
})();

/* ── Mobile hamburger ─────────────────────────────────────────── */
(function initHamburger() {
  const btn   = $("#hamburger");
  const menu  = $("#nav-links");

  btn.addEventListener("click", () => {
    btn.classList.toggle("open");
    menu.classList.toggle("open");
  });

  // Close on link click
  $$("#nav-links .nav-link").forEach((a) =>
    a.addEventListener("click", () => {
      btn.classList.remove("open");
      menu.classList.remove("open");
    })
  );
})();

/* ── Back-to-top button ───────────────────────────────────────── */
(function initBackToTop() {
  const btn = $("#back-to-top");
  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();

/* ── Footer year ──────────────────────────────────────────────── */
document.getElementById("year").textContent = new Date().getFullYear();

/* ── Set min date on reservation date picker ──────────────────── */
(function setMinDate() {
  const dateInput = $("#res-date");
  if (dateInput) {
    dateInput.min = new Date().toISOString().split("T")[0];
  }
})();

/* ── Menu: fetch from API and render tabs ─────────────────────── */
(function initMenu() {
  const CATEGORIES = ["coffee", "tea", "food", "desserts"];

  async function loadMenu() {
    try {
      const res  = await fetch("/api/menu");
      if (!res.ok) throw new Error("Failed to load menu");
      const data = await res.json();
      CATEGORIES.forEach((cat) => renderMenuPanel(cat, data[cat] || []));
    } catch (err) {
      console.error("Menu load error:", err);
      CATEGORIES.forEach((cat) => {
        const panel = $(`#tab-${cat}`);
        if (panel) panel.innerHTML = `<p style="color:var(--clr-text-muted);grid-column:1/-1">Unable to load menu items.</p>`;
      });
    }
  }

  function renderMenuPanel(category, items) {
    const panel = $(`#tab-${category}`);
    if (!panel) return;
    panel.innerHTML = items
      .map(
        (item) => `
      <div class="menu-card">
        <div class="menu-card-top">
          <span class="menu-card-name">${escHtml(item.name)}</span>
          <span class="menu-card-price">$${Number(item.price).toFixed(2)}</span>
        </div>
        <p class="menu-card-desc">${escHtml(item.description)}</p>
      </div>`
      )
      .join("");
  }

  // Tab switching
  $$(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".tab-btn").forEach((b) => b.classList.remove("active"));
      $$(".menu-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      const panel = $(`#tab-${btn.dataset.tab}`);
      if (panel) panel.classList.add("active");
    });
  });

  loadMenu();
})();

/* ── Gallery lightbox ─────────────────────────────────────────── */
(function initGallery() {
  const lightbox = $("#lightbox");
  const lbImg    = $("#lightbox-img");
  const lbClose  = $("#lightbox-close");

  $$(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const src = item.querySelector("img").src;
      lbImg.src = src;
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  lbClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
})();

/* ── Testimonial carousel ─────────────────────────────────────── */
(function initTestimonials() {
  const track  = $("#testimonial-track");
  const dotsEl = $("#testimonial-dots");
  if (!track) return;

  const cards  = $$(".testimonial-card", track);
  let current  = 0;
  let interval;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className  = `dot${i === 0 ? " active" : ""}`;
    dot.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsEl.appendChild(dot);
  });

  const GAP_FALLBACK_PX = 24; // matches gap: 1.5rem in .testimonial-track CSS

  function goTo(index) {
    current = index;
    const visible   = getVisibleCount();
    const maxShift  = Math.max(0, cards.length - visible);
    const safeIndex = Math.min(index, maxShift);
    const cardGap   = parseFloat(getComputedStyle(track).gap) || GAP_FALLBACK_PX;
    const cardWidth = cards[0].offsetWidth + cardGap;
    track.scrollTo({ left: safeIndex * cardWidth, behavior: "smooth" });
    $$(".dot", dotsEl).forEach((d, i) => d.classList.toggle("active", i === index));
  }

  function getVisibleCount() {
    return window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
  }

  function next() {
    const nextIdx = (current + 1) % cards.length;
    goTo(nextIdx);
  }

  interval = setInterval(next, 4000);
  track.addEventListener("mouseenter", () => clearInterval(interval));
  track.addEventListener("mouseleave", () => { interval = setInterval(next, 4000); });
})();

/* ── Reservation form ─────────────────────────────────────────── */
(function initReservationForm() {
  const form     = $("#reservation-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateReservation()) return;

    setLoading(form, true);
    clearFeedback(form);

    const body = {
      name:    form.elements["name"].value.trim(),
      email:   form.elements["email"].value.trim(),
      phone:   form.elements["phone"].value.trim(),
      date:    form.elements["date"].value,
      time:    form.elements["time"].value,
      guests:  form.elements["guests"].value,
      message: form.elements["message"].value.trim(),
    };

    try {
      const res  = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        showFeedback(form, "res-feedback", data.message, "success");
        form.reset();
      } else {
        const msg = data.errors
          ? data.errors.map((e) => e.msg).join(" • ")
          : data.error || "Something went wrong. Please try again.";
        showFeedback(form, "res-feedback", msg, "error");
      }
    } catch {
      showFeedback(form, "res-feedback", "Network error. Please check your connection.", "error");
    } finally {
      setLoading(form, false);
    }
  });

  function validateReservation() {
    let valid = true;
    const f = form.elements;

    clearErrors(form);

    if (!f["name"].value.trim()) {
      setError("res-name", "err-res-name", "Full name is required"); valid = false;
    }
    if (!f["email"].value.trim() || !f["email"].validity.valid) {
      setError("res-email", "err-res-email", "A valid email is required"); valid = false;
    }
    if (!f["phone"].value.trim()) {
      setError("res-phone", "err-res-phone", "Phone number is required"); valid = false;
    }
    if (!f["date"].value) {
      setError("res-date", "err-res-date", "Please pick a date"); valid = false;
    }
    if (!f["time"].value) {
      setError("res-time", "err-res-time", "Please select a time"); valid = false;
    }
    if (!f["guests"].value) {
      setError("res-guests", "err-res-guests", "Please select number of guests"); valid = false;
    }
    return valid;
  }
})();

/* ── Contact form ─────────────────────────────────────────────── */
(function initContactForm() {
  const form = $("#contact-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateContact()) return;

    setLoading(form, true);
    clearFeedback(form);

    const body = {
      name:    form.elements["name"].value.trim(),
      email:   form.elements["email"].value.trim(),
      subject: form.elements["subject"].value.trim(),
      message: form.elements["message"].value.trim(),
    };

    try {
      const res  = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        showFeedback(form, "ct-feedback", data.message, "success");
        form.reset();
      } else {
        const msg = data.errors
          ? data.errors.map((e) => e.msg).join(" • ")
          : data.error || "Something went wrong. Please try again.";
        showFeedback(form, "ct-feedback", msg, "error");
      }
    } catch {
      showFeedback(form, "ct-feedback", "Network error. Please check your connection.", "error");
    } finally {
      setLoading(form, false);
    }
  });

  function validateContact() {
    let valid = true;
    const f = form.elements;
    clearErrors(form);

    if (!f["name"].value.trim()) {
      setError("ct-name", "err-ct-name", "Name is required"); valid = false;
    }
    if (!f["email"].value.trim() || !f["email"].validity.valid) {
      setError("ct-email", "err-ct-email", "A valid email is required"); valid = false;
    }
    if (!f["subject"].value.trim()) {
      setError("ct-subject", "err-ct-subject", "Subject is required"); valid = false;
    }
    if (f["message"].value.trim().length < 10) {
      setError("ct-message", "err-ct-message", "Message must be at least 10 characters"); valid = false;
    }
    return valid;
  }
})();

/* ── Shared form utilities ────────────────────────────────────── */
function setLoading(form, loading) {
  const btn     = form.querySelector("[type=submit]");
  const btnText = btn.querySelector(".btn-text");
  const spinner = btn.querySelector(".btn-spinner");
  btn.disabled = loading;
  btnText.classList.toggle("hidden", loading);
  spinner.classList.toggle("hidden", !loading);
}

function showFeedback(form, id, message, type) {
  const el = $(`#${id}`, form);
  if (!el) return;
  el.textContent = message;
  el.className   = `form-feedback ${type}`;
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearFeedback(form) {
  form.querySelectorAll(".form-feedback").forEach((el) => {
    el.className = "form-feedback hidden";
    el.textContent = "";
  });
}

function setError(inputId, errId, message) {
  const input = $(`#${inputId}`);
  const err   = $(`#${errId}`);
  if (input) input.classList.add("error");
  if (err)   err.textContent = message;
}

function clearErrors(form) {
  form.querySelectorAll(".field-error").forEach((e) => (e.textContent = ""));
  form.querySelectorAll(".error").forEach((e) => e.classList.remove("error"));
}

/* ── Simple HTML-escape (XSS protection for dynamic content) ──── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
