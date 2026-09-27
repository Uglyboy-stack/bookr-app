// ---- App state ------------------------------------------------------------

// Consistent line-style icon set (replaces emoji, which render inconsistently
// across devices/fonts). All use currentColor so they inherit surrounding text color.
const ICON_SEARCH = `<svg class="icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
const ICON_PIN = `<svg class="icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
const ICON_CLOCK = `<svg class="icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></svg>`;
const ICON_CHEVRON_LEFT = `<svg class="icon-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>`;
const ICON_CHECK = `<svg class="icon-svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
const ICON_CALENDAR = `<svg class="icon-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const ICON_HEART_OUTLINE = `<svg class="icon-svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>`;
const ICON_HEART_FILLED = `<svg class="icon-svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>`;

const state = {
  view: "browse",       // "browse" | "booking" | "confirmed" | "quote-sent" | "my-bookings"
  category: "All",
  query: "",
  showFavoritesOnly: false,
  sortBy: "default", // "default" | "price-asc" | "rating-desc"
  selectedProvider: null,
  selectedService: null,
  dayIndex: 0,
  selectedSlot: null,
};

const app = document.getElementById("app");
let lastView = null;

function setState(patch) {
  Object.assign(state, patch);
  render();
}

// ---- Local booking history (browser-local, not a real account system) --------
// Since there's no client login yet, "My Bookings" is stored per-browser via
// localStorage. It won't follow the client to another device.

function saveBookingLocally(booking) {
  const existing = getLocalBookings();
  existing.unshift(booking);
  localStorage.setItem("bookr_client_bookings", JSON.stringify(existing));
}

function getLocalBookings() {
  try {
    return JSON.parse(localStorage.getItem("bookr_client_bookings")) || [];
  } catch (e) {
    return [];
  }
}

function updateLocalBookingStatus(ref, status) {
  const bookings = getLocalBookings();
  const match = bookings.find((b) => b.ref === ref);
  if (match) match.status = status;
  localStorage.setItem("bookr_client_bookings", JSON.stringify(bookings));
}

// ---- Favorites (browser-local, same limitation as My Bookings) ---------------

function getFavoriteIds() {
  try {
    return JSON.parse(localStorage.getItem("bookr_client_favorites")) || [];
  } catch (e) {
    return [];
  }
}

function isFavorite(id) {
  return getFavoriteIds().includes(id);
}

function toggleFavorite(id) {
  const ids = getFavoriteIds();
  const idx = ids.indexOf(id);
  if (idx === -1) ids.push(id);
  else ids.splice(idx, 1);
  localStorage.setItem("bookr_client_favorites", JSON.stringify(ids));
}

// ---- Signed-up providers (from localStorage) ---------------------------------
// The hardcoded PROVIDERS array is the seeded demo catalogue. Anyone who signs
// up as a real provider (see auth.js) gets their own profile stored separately
// in localStorage. This merges the two so new providers actually show up to
// clients — but only once genuinely bookable: at least one service listed, and
// their subscription is active (mirrors the "pay to stay visible" pitch).
// Locally signed-up providers only get instant-booking services (the signup
// flow doesn't support quote-only services), which keeps them simple.

function getLocalProviders() {
  const results = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("bookr_profile_")) continue;
    try {
      const profile = JSON.parse(localStorage.getItem(key));
      if (!profile || !profile.provider) continue;

      const services = profile.services || [];
      const sub = profile.subscription || {};
      if (!sub.active || services.length === 0) continue;

      results.push({
        id: 100000 + i,
        email: key.slice("bookr_profile_".length),
        name: profile.provider.name,
        category: profile.provider.category,
        location: profile.provider.location,
        rating: null,
        reviews: 0,
        priceFrom: Math.min(...services.map((s) => s.price)),
        tag: "New",
        services: services,
        availability: profile.availability || {},
        bookings: profile.bookings || [],
      });
    } catch (e) {
      // Skip anything malformed rather than breaking the whole browse page.
    }
  }
  return results;
}

function getAllProviders() {
  return [...PROVIDERS, ...getLocalProviders()];
}

// ---- Render router ----------------------------------------------------------

function render() {
  const viewChanged = state.view !== lastView;
  lastView = state.view;

  if (state.view === "browse") renderBrowse();
  else if (state.view === "booking") renderBooking();
  else if (state.view === "confirmed") renderConfirmed();
  else if (state.view === "quote-sent") renderQuoteSent();
  else if (state.view === "my-bookings") renderMyBookings();

  if (viewChanged) {
    app.classList.remove("view-fade");
    void app.offsetWidth;
    app.classList.add("view-fade");
  }
}

document.getElementById("myBookingsLink").addEventListener("click", (e) => {
  e.preventDefault();
  setState({ view: "my-bookings" });
});

document.getElementById("savedLink").addEventListener("click", (e) => {
  e.preventDefault();
  setState({ view: "browse", showFavoritesOnly: !state.showFavoritesOnly });
});

// ---- Browse view --------------------------------------------------------------

function filterAndSortProviders() {
  const favIds = getFavoriteIds();
  let list = getAllProviders().filter((p) => {
    const matchesCategory = state.category === "All" || p.category === state.category;
    const matchesQuery = p.name.toLowerCase().includes(state.query.toLowerCase());
    const matchesFavorites = !state.showFavoritesOnly || favIds.includes(p.id);
    return matchesCategory && matchesQuery && matchesFavorites;
  });

  if (state.sortBy === "price-asc") {
    list = [...list].sort((a, b) => a.priceFrom - b.priceFrom);
  } else if (state.sortBy === "rating-desc") {
    list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return list;
}

function renderBrowse() {
  const filtered = filterAndSortProviders();

  app.innerHTML = `
    <div class="page">
      <h1 class="hero-title">Book any service, near you</h1>
      <p class="hero-sub">Home services, beauty, tutoring, events, auto repair &amp; more.</p>

      <div class="browse-controls">
        <div class="search-box">
          <span aria-hidden="true">${ICON_SEARCH}</span>
          <label for="searchInput" class="sr-only">Search providers</label>
          <input id="searchInput" type="text" placeholder="Search providers..." value="${escapeAttr(state.query)}" />
        </div>

        <label for="sortSelect" class="sr-only">Sort providers</label>
        <select id="sortSelect" class="sort-select">
          <option value="default" ${state.sortBy === "default" ? "selected" : ""}>Sort: Featured</option>
          <option value="price-asc" ${state.sortBy === "price-asc" ? "selected" : ""}>Price: Low to High</option>
          <option value="rating-desc" ${state.sortBy === "rating-desc" ? "selected" : ""}>Rating: High to Low</option>
        </select>
      </div>

      <div class="pill-row" id="categoryRow" role="group" aria-label="Filter by category">
        ${CATEGORIES.map(
          (c) => `<button class="pill ${c === state.category ? "active" : ""}" data-category="${c}" aria-pressed="${c === state.category}">${c}</button>`
        ).join("")}
      </div>

      ${state.showFavoritesOnly ? `<p class="favorites-banner">Showing saved providers only. <button class="inline-link-btn" id="clearFavFilter">Show all</button></p>` : ""}

      <div class="provider-grid" id="providerGrid" aria-live="polite">
        ${
          filtered.length
            ? filtered.map(providerCardHTML).join("")
            : `<p class="empty-state">${state.showFavoritesOnly ? "No saved providers yet — tap the heart on a provider to save them." : "No providers match — try a different search."}</p>`
        }
      </div>
    </div>
  `;

  document.getElementById("searchInput").addEventListener("input", (e) => {
    state.query = e.target.value;
    renderProviderGridOnly();
  });

  document.getElementById("sortSelect").addEventListener("change", (e) => {
    setState({ sortBy: e.target.value });
  });

  document.getElementById("categoryRow").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-category]");
    if (!btn) return;
    setState({ category: btn.dataset.category });
  });

  const clearFavBtn = document.getElementById("clearFavFilter");
  if (clearFavBtn) {
    clearFavBtn.addEventListener("click", () => setState({ showFavoritesOnly: false }));
  }

  attachProviderCardListeners();
}

function renderProviderGridOnly() {
  const filtered = filterAndSortProviders();
  const grid = document.getElementById("providerGrid");
  grid.innerHTML = filtered.length
    ? filtered.map(providerCardHTML).join("")
    : `<p class="empty-state">${state.showFavoritesOnly ? "No saved providers yet — tap the heart on a provider to save them." : "No providers match — try a different search."}</p>`;
  attachProviderCardListeners();
}

const CATEGORY_ICONS = {
  "Home Services": "🔧",
  "Beauty & Grooming": "💇🏾‍♀️",
  Tutoring: "📚",
  Events: "📸",
  "Auto & Repair": "🚗",
  Cleaning: "🧹",
  "Fitness & Wellness": "🏋🏾",
  "Tech Repairs": "💻",
  "Pet Care": "🐾",
};

function providerCardHTML(p) {
  const icon = CATEGORY_ICONS[p.category] || "🛠️";
  const ratingLabel = p.rating ? `rated ${p.rating} from ${p.reviews} reviews` : "newly listed, no reviews yet";
  const ratingDisplay = p.rating
    ? `<span class="star">★</span> <strong>${p.rating}</strong> <span style="color:var(--mauve)">(${p.reviews})</span>`
    : `<span class="new-provider-badge">New</span>`;
  const favorited = isFavorite(p.id);
  return `
    <div class="provider-card" data-provider-id="${p.id}" role="button" tabindex="0" aria-label="${escapeAttr(p.name)}, ${p.category}, ${p.location}, ${ratingLabel}, from ₦${p.priceFrom.toLocaleString()}">
      <div class="provider-banner" aria-hidden="true">
        <div class="provider-monogram"><span class="icon">${icon}</span></div>
        ${p.tag ? `<span class="provider-tag">${p.tag}</span>` : ""}
        <button class="favorite-btn" data-favorite-id="${p.id}" aria-label="${favorited ? "Remove " + escapeAttr(p.name) + " from saved" : "Save " + escapeAttr(p.name)}" aria-pressed="${favorited}">
          ${favorited ? ICON_HEART_FILLED : ICON_HEART_OUTLINE}
        </button>
      </div>
      <div class="provider-body">
        <p class="provider-category" aria-hidden="true">${p.category}</p>
        <h3 class="provider-name font-serif" aria-hidden="true">${p.name}</h3>
        <div class="provider-location" aria-hidden="true">${ICON_PIN} ${p.location}</div>
        <div class="provider-meta" aria-hidden="true">
          <div class="provider-rating">${ratingDisplay}</div>
          <span class="provider-price font-mono">from ₦${p.priceFrom.toLocaleString()}</span>
        </div>
      </div>
    </div>
  `;
}

function attachProviderCardListeners() {
  document.querySelectorAll("[data-provider-id]").forEach((card) => {
    const openProvider = () => {
      const provider = getAllProviders().find((p) => p.id === Number(card.dataset.providerId));
      setState({
        view: "booking",
        selectedProvider: provider,
        selectedService: provider.services[0],
        dayIndex: 0,
        selectedSlot: null,
        selectedSlotHour24: null,
      });
    };
    card.addEventListener("click", (e) => {
      if (e.target.closest("[data-favorite-id]")) return;
      openProvider();
    });
    card.addEventListener("keydown", (e) => {
      if (e.target.closest("[data-favorite-id]")) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openProvider();
      }
    });
  });

  document.querySelectorAll("[data-favorite-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(Number(btn.dataset.favoriteId));
      renderProviderGridOnly();
    });
  });
}

// ---- Booking view ---------------------------------------------------------------

function reviewsHTML(providerId) {
  const reviews = REVIEWS[providerId];
  if (!reviews || !reviews.length) return "";
  return `
    <h2 class="section-label">What clients say</h2>
    <div class="reviews-list">
      ${reviews
        .map(
          (r) => `
        <div class="review-card">
          <div class="review-stars" aria-hidden="true">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
          <p class="review-text">"${escapeAttr(r.text)}"</p>
          <p class="review-name">— ${escapeAttr(r.name)}</p>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function renderBooking() {
  const p = state.selectedProvider;
  const isQuote = !!state.selectedService.quoteOnly;

  app.innerHTML = `
    <div class="page-narrow">
      <button class="back-btn" id="backBtn">${ICON_CHEVRON_LEFT} Back</button>

      <p class="provider-header-category">${p.category}</p>
      <div class="provider-header-top">
        <h1 class="provider-header-name font-serif">${p.name}</h1>
        <button class="favorite-btn favorite-btn-inline" id="detailFavoriteBtn" aria-label="${isFavorite(p.id) ? "Remove " + escapeAttr(p.name) + " from saved" : "Save " + escapeAttr(p.name)}" aria-pressed="${isFavorite(p.id)}">
          ${isFavorite(p.id) ? ICON_HEART_FILLED : ICON_HEART_OUTLINE}
        </button>
      </div>
      <div class="provider-header-meta">
        <span>${ICON_PIN} ${p.location}</span>
        <span>${p.rating ? `<span class="star">★</span> ${p.rating} (${p.reviews})` : `<span class="new-provider-badge">New</span>`}</span>
      </div>

      ${reviewsHTML(p.id)}

      <h2 class="section-label">Choose a service</h2>
      <div class="service-list" id="serviceList">
        ${p.services
          .map(
            (s) => `
          <button class="service-row ${s.id === state.selectedService.id ? "selected" : ""}" data-service-id="${s.id}" aria-pressed="${s.id === state.selectedService.id}">
            <div>
              <p class="service-name">${s.name} ${s.quoteOnly ? '<span class="quote-badge">Request only</span>' : ""}</p>
              <p class="service-duration">${ICON_CLOCK} ${formatDuration(s.duration)}</p>
            </div>
            <span class="service-price">${s.quoteOnly ? "from " : ""}₦${s.price.toLocaleString()}</span>
          </button>
        `
          )
          .join("")}
      </div>

      ${isQuote ? renderQuoteForm() : renderInstantBooking(p)}
    </div>
  `;

  document.getElementById("backBtn").addEventListener("click", () => {
    setState({ view: "browse" });
  });

  document.getElementById("detailFavoriteBtn").addEventListener("click", () => {
    toggleFavorite(p.id);
    render();
  });

  document.getElementById("serviceList").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-service-id]");
    if (!btn) return;
    const service = state.selectedProvider.services.find((s) => s.id === btn.dataset.serviceId);
    setState({ selectedService: service, selectedSlot: null, selectedSlotHour24: null });
  });

  if (isQuote) {
    attachQuoteFormListeners();
  } else {
    attachInstantBookingListeners();
  }
}

function renderInstantBooking(p) {
  const bookingDays = getBookingDays();
  const activeDay = bookingDays[state.dayIndex];
  const slots = getAvailableSlots(p, activeDay);

  return `
    <h2 class="section-label">Choose a time</h2>
    <div class="day-row" id="dayRow">
      ${bookingDays.map((d, i) => `<button class="day-pill ${i === state.dayIndex ? "active" : ""}" data-day-index="${i}" aria-pressed="${i === state.dayIndex}">${d.label}</button>`).join("")}
    </div>

    <div class="slot-row" id="slotRow">
      ${
        slots.length
          ? slots.map((s) => `<button class="slot-stub ${s.label === state.selectedSlot ? "selected" : ""}" data-slot="${s.label}" data-hour24="${s.hour24}" aria-pressed="${s.label === state.selectedSlot}">${s.label}</button>`).join("")
          : `<p class="no-slots">No open slots this day — try another, or check back once ${p.name} sets more availability.</p>`
      }
    </div>

    <h2 class="section-label">Your details</h2>
    <label for="clientEmail" class="sr-only">Email address</label>
    <input class="edit-input" type="email" id="clientEmail" placeholder="you@email.com" style="margin-bottom: 24px;" aria-describedby="emailHint" />
    <p id="emailHint" class="sr-only">Needed so we can send your booking confirmation</p>

    <div class="summary-bar">
      <div>
        <p class="summary-label">Total</p>
        <p class="summary-price">₦${state.selectedService.price.toLocaleString()}</p>
      </div>
      <button class="confirm-btn ${state.selectedSlot ? "enabled" : ""}" id="confirmBtn" ${state.selectedSlot ? "" : "disabled"}>
        <span id="confirmBtnLabel">Pay & confirm booking</span>
      </button>
    </div>
    <p class="payment-note" id="paymentStatus" role="status" aria-live="polite">Secure test payment via Paystack. No real charge will be made.</p>
  `;
}

function renderQuoteForm() {
  return `
    <div class="quote-panel">
      <h2 class="section-label">Request details</h2>
      <p class="quote-note">Big jobs like this need a quick conversation first — ${state.selectedProvider.name} will confirm availability, exact pricing, and details before it's booked.</p>

      <label class="login-label" for="quoteEmail">Your email</label>
      <input class="edit-input" type="email" id="quoteEmail" placeholder="you@email.com" style="margin-bottom: 16px;" />

      <label class="login-label" for="quoteDate">Preferred date</label>
      <input class="edit-input" type="text" id="quoteDate" placeholder="e.g. Sat 20 Sep, or 'flexible in October'" />

      <label class="login-label" for="quoteMessage">Anything the provider should know?</label>
      <textarea class="edit-input quote-textarea" id="quoteMessage" placeholder="Location, guest count, style you're after, etc."></textarea>

      <p class="payment-note" id="quoteStatus" role="status" aria-live="polite" style="text-align:left; margin: 8px 0 0;"></p>

      <div class="summary-bar">
        <div>
          <p class="summary-label">Estimated from</p>
          <p class="summary-price">₦${state.selectedService.price.toLocaleString()}</p>
        </div>
        <button class="confirm-btn enabled" id="sendQuoteBtn">Request a quote</button>
      </div>
    </div>
  `;
}

function attachInstantBookingListeners() {
  document.getElementById("dayRow").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-day-index]");
    if (!btn) return;
    setState({ dayIndex: Number(btn.dataset.dayIndex), selectedSlot: null, selectedSlotHour24: null });
  });

  document.getElementById("slotRow").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-slot]");
    if (!btn) return;
    setState({ selectedSlot: btn.dataset.slot, selectedSlotHour24: btn.dataset.hour24 });
  });

  const confirmBtn = document.getElementById("confirmBtn");
  confirmBtn.addEventListener("click", () => {
    if (!state.selectedSlot) return;

    const emailInput = document.getElementById("clientEmail");
    const email = emailInput.value.trim();
    if (!email || !email.includes("@")) {
      emailInput.style.borderColor = "var(--rose)";
      emailInput.setAttribute("aria-invalid", "true");
      const status = document.getElementById("paymentStatus");
      if (status) {
        status.textContent = "Please enter a valid email address to continue.";
        status.classList.add("payment-status-error");
      }
      emailInput.focus();
      return;
    }
    emailInput.removeAttribute("aria-invalid");

    payForBooking(email);
  });
}

function attachQuoteFormListeners() {
  document.getElementById("sendQuoteBtn").addEventListener("click", () => {
    const emailInput = document.getElementById("quoteEmail");
    const email = emailInput.value.trim();
    const statusEl = document.getElementById("quoteStatus");

    if (!email || !email.includes("@")) {
      emailInput.style.borderColor = "var(--rose)";
      statusEl.textContent = "Please enter a valid email address so the provider can reach you.";
      statusEl.classList.add("payment-status-error");
      emailInput.focus();
      return;
    }

    const date = document.getElementById("quoteDate").value.trim();
    const message = document.getElementById("quoteMessage").value.trim();
    const quoteDate = date || "your preferred date";

    const providerBookingId = writeQuoteRequestToProvider(state.selectedProvider, email, {
      serviceName: state.selectedService.name,
      quoteDate,
      message,
      price: state.selectedService.price,
    });

    saveBookingLocally({
      type: "quote",
      providerName: state.selectedProvider.name,
      providerEmail: state.selectedProvider.email || null,
      providerBookingId: providerBookingId,
      serviceName: state.selectedService.name,
      day: quoteDate,
      time: "Awaiting confirmation",
      price: state.selectedService.price,
      ref: "quote_" + Date.now(),
      bookedAt: new Date().toISOString(),
      status: "Pending",
    });

    setState({ view: "quote-sent", quoteDate });
  });
}

// ---- Confirmation view ------------------------------------------------------------

// Writes a newly paid-for booking into the PROVIDER's own stored data (not just
// the client's local history) — this is what actually lets a provider see it.
// Only works for real signed-up providers (they have a stored profile); the
// seeded demo providers in data.js have no localStorage profile to write into.
function writeBookingToProvider(provider, clientEmail, bookingDetails) {
  if (!provider.email) return null;

  const key = "bookr_profile_" + provider.email;
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const profile = JSON.parse(raw);
    profile.bookings = profile.bookings || [];
    const bookingId = "b" + Date.now();
    profile.bookings.unshift({
      id: bookingId,
      client: clientEmail,
      service: bookingDetails.serviceName,
      day: bookingDetails.day,
      time: bookingDetails.time,
      dateKey: bookingDetails.dateKey,
      hour24: bookingDetails.hour24,
      status: "Confirmed",
      price: bookingDetails.price,
    });
    localStorage.setItem(key, JSON.stringify(profile));
    return bookingId;
  } catch (e) {
    return null;
  }
}

// Same idea, for a quote request instead of a paid instant booking — written
// as "Pending" since the provider still needs to follow up and confirm.
function writeQuoteRequestToProvider(provider, clientEmail, details) {
  if (!provider.email) return null;

  const key = "bookr_profile_" + provider.email;
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const profile = JSON.parse(raw);
    profile.bookings = profile.bookings || [];
    const bookingId = "b" + Date.now();
    profile.bookings.unshift({
      id: bookingId,
      client: clientEmail,
      service: details.serviceName,
      day: details.quoteDate,
      time: details.message ? details.message : "To be confirmed",
      status: "Pending",
      price: details.price,
    });
    localStorage.setItem(key, JSON.stringify(profile));
    return bookingId;
  } catch (e) {
    return null;
  }
}

function cancelBookingWithProvider(providerEmail, bookingId) {
  if (!providerEmail || !bookingId) return;
  const key = "bookr_profile_" + providerEmail;
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const profile = JSON.parse(raw);
    const booking = (profile.bookings || []).find((b) => b.id === bookingId);
    if (booking) booking.status = "Cancelled";
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (e) {
    // Fail quietly.
  }
}

// Triggers a real Paystack test-mode popup. On success, moves to the confirmation
// screen. IMPORTANT: this only proves the popup reported success — a production
// version must verify the transaction server-side before treating it as paid.
function payForBooking(email) {
  const confirmBtn = document.getElementById("confirmBtn");
  const label = document.getElementById("confirmBtnLabel");
  const status = document.getElementById("paymentStatus");

  confirmBtn.disabled = true;
  confirmBtn.classList.add("processing");
  label.innerHTML = '<span class="btn-spinner"></span> Opening secure payment…';
  status.textContent = "Redirecting to Paystack — don't close this tab.";
  status.classList.remove("payment-status-error");

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: state.selectedService.price * 100,
    currency: "NGN",
    ref: "bookr_" + Date.now(),
    metadata: {
      provider: state.selectedProvider.name,
      service: state.selectedService.name,
    },
    callback: function (response) {
      const activeDay = getBookingDays()[state.dayIndex];
      const bookingDetails = {
        serviceName: state.selectedService.name,
        day: activeDay.label,
        time: state.selectedSlot,
        dateKey: activeDay.dateKey,
        hour24: state.selectedSlotHour24,
        price: state.selectedService.price,
      };
      const providerBookingId = writeBookingToProvider(state.selectedProvider, email, bookingDetails);
      saveBookingLocally({
        type: "instant",
        providerName: state.selectedProvider.name,
        providerEmail: state.selectedProvider.email || null,
        providerBookingId: providerBookingId,
        serviceName: bookingDetails.serviceName,
        day: bookingDetails.day,
        time: bookingDetails.time,
        price: bookingDetails.price,
        ref: response.reference,
        bookedAt: new Date().toISOString(),
        status: "Confirmed",
      });
      setState({ view: "confirmed", paymentRef: response.reference, confirmedDay: activeDay.label });
    },
    onClose: function () {
      const btn = document.getElementById("confirmBtn");
      const lbl = document.getElementById("confirmBtnLabel");
      const st = document.getElementById("paymentStatus");
      if (btn) {
        btn.disabled = false;
        btn.classList.remove("processing");
      }
      if (lbl) lbl.textContent = "Pay & confirm booking";
      if (st) {
        st.textContent = "Payment was cancelled — nothing was charged. You can try again anytime.";
        st.classList.add("payment-status-error");
      }
    },
  });
  handler.openIframe();
}

function renderConfirmed() {
  const p = state.selectedProvider;
  app.innerHTML = `
    <div class="page-narrow confirm-wrap">
      <div class="confirm-check">${ICON_CHECK}</div>
      <h2 class="confirm-title font-serif">Payment successful</h2>
      <p class="confirm-detail">
        ${state.selectedService.name} with ${p.name}<br />
        ${state.confirmedDay}, ${state.selectedSlot} – ${addDurationToSlot(state.selectedSlot, state.selectedService.duration) || "?"}<br />
        <span style="font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--mauve);">Ref: ${state.paymentRef || "—"}</span>
      </p>
      <div class="confirm-actions">
        <button class="btn-secondary-small" id="addToCalendarBtn">${ICON_CALENDAR} Add to calendar</button>
        <button class="btn-secondary-small" id="viewMyBookingsBtn">View my bookings</button>
      </div>
      <button class="confirm-link" id="backToBrowse">Back to browsing</button>
    </div>
  `;

  document.getElementById("backToBrowse").addEventListener("click", () => {
    setState({ view: "browse", selectedProvider: null, selectedSlot: null });
  });

  document.getElementById("viewMyBookingsBtn").addEventListener("click", () => {
    setState({ view: "my-bookings" });
  });

  document.getElementById("addToCalendarBtn").addEventListener("click", () => {
    downloadCalendarInvite(p, state.selectedService, state.dayIndex, state.confirmedDay, state.selectedSlot);
  });
}

function renderQuoteSent() {
  const p = state.selectedProvider;
  app.innerHTML = `
    <div class="page-narrow confirm-wrap">
      <div class="confirm-check">${ICON_CHECK}</div>
      <h2 class="confirm-title font-serif">Quote requested</h2>
      <p class="confirm-detail">
        ${state.selectedService.name} with ${p.name}<br />
        Preferred date: ${escapeAttr(state.quoteDate || "your preferred date")}<br />
        ${p.name} will follow up to confirm availability and final pricing.
      </p>
      <div class="confirm-actions">
        <button class="btn-secondary-small" id="viewMyBookingsBtn">View my bookings</button>
      </div>
      <button class="confirm-link" id="backToBrowse">Back to browsing</button>
    </div>
  `;

  document.getElementById("backToBrowse").addEventListener("click", () => {
    setState({ view: "browse", selectedProvider: null, selectedSlot: null, quoteDate: null });
  });

  document.getElementById("viewMyBookingsBtn").addEventListener("click", () => {
    setState({ view: "my-bookings" });
  });
}

// Builds a minimal .ics file so the client can drop the appointment into their
// calendar app. dayIndex (0/1/2) maps directly to the same "today + N days"
// math used when the slot was booked, so the date is always accurate.
function downloadCalendarInvite(provider, service, dayIndex, dayLabel, timeLabel) {
  const match = timeLabel.match(/(\d+):(\d+)\s*(AM|PM)/i);
  const now = new Date();
  now.setDate(now.getDate() + (dayIndex || 0));
  if (match) {
    let hour = parseInt(match[1], 10) % 12;
    if (match[3].toUpperCase() === "PM") hour += 12;
    now.setHours(hour, parseInt(match[2], 10), 0, 0);
  }
  const end = new Date(now.getTime() + service.duration * 60000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `SUMMARY:${service.name} at ${provider.name}`,
    `DTSTART:${fmt(now)}`,
    `DTEND:${fmt(end)}`,
    `LOCATION:${provider.location}`,
    `DESCRIPTION:Booked via Bookr — ${dayLabel} at ${timeLabel}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "bookr-appointment.ics";
  link.click();
}

// ---- My Bookings -----------------------------------------------------------------

function cancelMyBooking(ref) {
  const bookings = getLocalBookings();
  const booking = bookings.find((b) => b.ref === ref);
  if (!booking) return;

  if (booking.providerEmail && booking.providerBookingId) {
    cancelBookingWithProvider(booking.providerEmail, booking.providerBookingId);
  }
  updateLocalBookingStatus(ref, "Cancelled");
  renderMyBookings();
}

function renderMyBookings() {
  const bookings = getLocalBookings();
  app.innerHTML = `
    <div class="page-narrow">
      <button class="back-btn" id="backBtn">${ICON_CHEVRON_LEFT} Back</button>
      <h1 class="dash-title" style="margin-bottom:4px;">My Bookings</h1>
      <p class="dash-sub">Saved on this device — bookings made on another device or browser won't appear here.</p>

      ${
        bookings.length
          ? `<div class="my-bookings-list">
              ${bookings
                .map((b) => {
                  const status = b.status || "Confirmed";
                  const cancelled = status === "Cancelled";
                  const isQuote = b.type === "quote";
                  const chipClass = cancelled ? "status-cancelled" : isQuote ? "status-pending" : "status-confirmed";
                  const chipLabel = cancelled ? "Cancelled" : isQuote ? "Quote requested" : "Paid";
                  return `
                <div class="upcoming-row">
                  <div>
                    <p class="upcoming-client">${b.serviceName} — ${b.providerName}</p>
                    <p class="upcoming-meta">${b.day}, ${b.time}${isQuote ? "" : ` · ₦${b.price.toLocaleString()}`}</p>
                  </div>
                  <div style="display:flex; align-items:center; gap:10px;">
                    <span class="status-chip ${chipClass}">${chipLabel}</span>
                    ${!cancelled ? `<button class="icon-btn danger" data-cancel-ref="${escapeAttr(b.ref)}">Cancel</button>` : ""}
                  </div>
                </div>
              `;
                })
                .join("")}
            </div>`
          : `<p class="empty-state" style="padding:48px 0;">No bookings yet. Once you book an appointment or request a quote, it'll show up here.</p>`
      }
    </div>
  `;

  document.getElementById("backBtn").addEventListener("click", () => {
    setState({ view: "browse" });
  });

  document.querySelectorAll("[data-cancel-ref]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirm("Cancel this booking? This can't be undone.")) {
        cancelMyBooking(btn.dataset.cancelRef);
      }
    });
  });
}

// ---- Utils ------------------------------------------------------------------------

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

function formatDuration(mins) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr${h > 1 ? "s" : ""}` : `${h} hr${h > 1 ? "s" : ""} ${m} min`;
}

// Parses "9:00 AM" style strings and adds a duration in minutes, returning "1:00 PM" style output
function addDurationToSlot(slotLabel, durationMins) {
  const match = slotLabel.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return null;
  let [, hourStr, minStr, meridiem] = match;
  let hour = parseInt(hourStr, 10) % 12;
  if (meridiem.toUpperCase() === "PM") hour += 12;
  const totalStart = hour * 60 + parseInt(minStr, 10);
  const totalEnd = totalStart + durationMins;
  const endHour24 = Math.floor(totalEnd / 60) % 24;
  const endMin = totalEnd % 60;
  const endMeridiem = endHour24 >= 12 ? "PM" : "AM";
  let endHour12 = endHour24 % 12;
  if (endHour12 === 0) endHour12 = 12;
  const daysPast = Math.floor(totalEnd / (24 * 60));
  const suffix = daysPast > 0 ? ` (+${daysPast}d)` : "";
  return `${endHour12}:${String(endMin).padStart(2, "0")} ${endMeridiem}${suffix}`;
}

// ---- Init ---------------------------------------------------------------------------

render();
