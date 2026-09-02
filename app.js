// ---- App state ------------------------------------------------------------

const state = {
  view: "browse",       // "browse" | "booking" | "confirmed"
  category: "All",
  query: "",
  selectedProvider: null,
  selectedService: null,
  dayIndex: 0,
  selectedSlot: null,
};

const app = document.getElementById("app");

function setState(patch) {
  Object.assign(state, patch);
  render();
}

// ---- Render router ----------------------------------------------------------

function render() {
  if (state.view === "browse") return renderBrowse();
  if (state.view === "booking") return renderBooking();
  if (state.view === "confirmed") return renderConfirmed();
  if (state.view === "quote-sent") return renderQuoteSent();
}

// ---- Browse view --------------------------------------------------------------

function renderBrowse() {
  const filtered = PROVIDERS.filter((p) => {
    const matchesCategory = state.category === "All" || p.category === state.category;
    const matchesQuery = p.name.toLowerCase().includes(state.query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  app.innerHTML = `
    <div class="page">
      <h1 class="hero-title">Book any service, near you</h1>
      <p class="hero-sub">Home services, beauty, tutoring, events, auto repair &amp; more.</p>

      <div class="search-box">
        <span>🔍</span>
        <input id="searchInput" type="text" placeholder="Search providers..." value="${escapeAttr(state.query)}" />
      </div>

      <div class="pill-row" id="categoryRow">
        ${CATEGORIES.map(
          (c) => `<button class="pill ${c === state.category ? "active" : ""}" data-category="${c}">${c}</button>`
        ).join("")}
      </div>

      <div class="provider-grid" id="providerGrid">
        ${
          filtered.length
            ? filtered.map(providerCardHTML).join("")
            : `<p class="empty-state">No providers match — try a different search.</p>`
        }
      </div>
    </div>
  `;

  document.getElementById("searchInput").addEventListener("input", (e) => {
    state.query = e.target.value; // update state directly, no full re-render (keeps focus)
    renderProviderGridOnly();
  });

  document.getElementById("categoryRow").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-category]");
    if (!btn) return;
    setState({ category: btn.dataset.category });
  });

  attachProviderCardListeners();
}

function renderProviderGridOnly() {
  const filtered = PROVIDERS.filter((p) => {
    const matchesCategory = state.category === "All" || p.category === state.category;
    const matchesQuery = p.name.toLowerCase().includes(state.query.toLowerCase());
    return matchesCategory && matchesQuery;
  });
  const grid = document.getElementById("providerGrid");
  grid.innerHTML = filtered.length
    ? filtered.map(providerCardHTML).join("")
    : `<p class="empty-state">No providers match — try a different search.</p>`;
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
  return `
    <button class="provider-card" data-provider-id="${p.id}">
      <div class="provider-banner">
        <div class="provider-monogram"><span class="icon">${icon}</span></div>
        ${p.tag ? `<span class="provider-tag">${p.tag}</span>` : ""}
      </div>
      <div class="provider-body">
        <p class="provider-category">${p.category}</p>
        <h3 class="provider-name font-serif">${p.name}</h3>
        <div class="provider-location">📍 ${p.location}</div>
        <div class="provider-meta">
          <div class="provider-rating"><span class="star">★</span> <strong>${p.rating}</strong> <span style="color:var(--mauve)">(${p.reviews})</span></div>
          <span class="provider-price font-mono">from ₦${p.priceFrom.toLocaleString()}</span>
        </div>
      </div>
    </button>
  `;
}

function attachProviderCardListeners() {
  document.querySelectorAll("[data-provider-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const provider = PROVIDERS.find((p) => p.id === Number(card.dataset.providerId));
      setState({
        view: "booking",
        selectedProvider: provider,
        selectedService: provider.services[0],
        dayIndex: 0,
        selectedSlot: null,
      });
    });
  });
}

// ---- Booking view ---------------------------------------------------------------

function renderBooking() {
  const p = state.selectedProvider;
  const isQuote = !!state.selectedService.quoteOnly;

  app.innerHTML = `
    <div class="page-narrow">
      <button class="back-btn" id="backBtn">‹ Back</button>

      <p class="provider-header-category">${p.category}</p>
      <h1 class="provider-header-name font-serif">${p.name}</h1>
      <div class="provider-header-meta">
        <span>📍 ${p.location}</span>
        <span><span class="star">★</span> ${p.rating} (${p.reviews})</span>
      </div>

      <h2 class="section-label">Choose a service</h2>
      <div class="service-list" id="serviceList">
        ${p.services
          .map(
            (s) => `
          <button class="service-row ${s.id === state.selectedService.id ? "selected" : ""}" data-service-id="${s.id}">
            <div>
              <p class="service-name">${s.name} ${s.quoteOnly ? '<span class="quote-badge">Request only</span>' : ""}</p>
              <p class="service-duration">⏱ ${formatDuration(s.duration)}</p>
            </div>
            <span class="service-price">${s.quoteOnly ? "from " : ""}₦${s.price.toLocaleString()}</span>
          </button>
        `
          )
          .join("")}
      </div>

      ${isQuote ? renderQuoteForm() : renderInstantBooking()}
    </div>
  `;

  document.getElementById("backBtn").addEventListener("click", () => {
    setState({ view: "browse" });
  });

  document.getElementById("serviceList").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-service-id]");
    if (!btn) return;
    const service = state.selectedProvider.services.find((s) => s.id === btn.dataset.serviceId);
    setState({ selectedService: service, selectedSlot: null });
  });

  if (isQuote) {
    attachQuoteFormListeners();
  } else {
    attachInstantBookingListeners();
  }
}

function renderInstantBooking() {
  const slots = getSlotsForDay(state.dayIndex);
  return `
    <h2 class="section-label">Choose a time</h2>
    <div class="day-row" id="dayRow">
      ${DAYS.map((d, i) => `<button class="day-pill ${i === state.dayIndex ? "active" : ""}" data-day-index="${i}">${d}</button>`).join("")}
    </div>

    <div class="slot-row" id="slotRow">
      ${
        slots.length
          ? slots.map((t) => `<button class="slot-stub ${t === state.selectedSlot ? "selected" : ""}" data-slot="${t}">${t}</button>`).join("")
          : `<p class="no-slots">No open slots this day — try another.</p>`
      }
    </div>

    <div class="summary-bar">
      <div>
        <p class="summary-label">
          ${
            state.selectedSlot
              ? `${DAYS[state.dayIndex]}, ${state.selectedSlot} – ${addDurationToSlot(state.selectedSlot, state.selectedService.duration) || "?"}`
              : "Total"
          }
        </p>
        <p class="summary-price">₦${state.selectedService.price.toLocaleString()}</p>
      </div>
      <button class="confirm-btn ${state.selectedSlot ? "enabled" : ""}" id="confirmBtn" ${state.selectedSlot ? "" : "disabled"}>
        Confirm booking
      </button>
    </div>
  `;
}

function renderQuoteForm() {
  return `
    <div class="quote-panel">
      <h2 class="section-label">Request details</h2>
      <p class="quote-note">Big jobs like this need a quick conversation first — ${state.selectedProvider.name} will confirm availability, exact pricing, and details before it's booked.</p>

      <label class="login-label" for="quoteDate">Preferred date</label>
      <input class="edit-input" type="text" id="quoteDate" placeholder="e.g. Sat 20 Sep, or 'flexible in October'" />

      <label class="login-label" for="quoteMessage">Anything the provider should know?</label>
      <textarea class="edit-input quote-textarea" id="quoteMessage" placeholder="Location, guest count, style you're after, etc."></textarea>

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
    setState({ dayIndex: Number(btn.dataset.dayIndex), selectedSlot: null });
  });

  document.getElementById("slotRow").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-slot]");
    if (!btn) return;
    setState({ selectedSlot: btn.dataset.slot });
  });

  const confirmBtn = document.getElementById("confirmBtn");
  confirmBtn.addEventListener("click", () => {
    if (!state.selectedSlot) return;
    setState({ view: "confirmed" });
  });
}

function attachQuoteFormListeners() {
  document.getElementById("sendQuoteBtn").addEventListener("click", () => {
    const date = document.getElementById("quoteDate").value.trim();
    setState({ view: "quote-sent", quoteDate: date || "your preferred date" });
  });
}

// ---- Confirmation view ------------------------------------------------------------

function renderConfirmed() {
  const p = state.selectedProvider;
  app.innerHTML = `
    <div class="page-narrow confirm-wrap">
      <div class="confirm-check">✓</div>
      <h2 class="confirm-title font-serif">Booking confirmed</h2>
      <p class="confirm-detail">
        ${state.selectedService.name} with ${p.name}<br />
        ${DAYS[state.dayIndex]}, ${state.selectedSlot} – ${addDurationToSlot(state.selectedSlot, state.selectedService.duration) || "?"}
      </p>
      <button class="confirm-link" id="backToBrowse">Back to browsing</button>
    </div>
  `;

  document.getElementById("backToBrowse").addEventListener("click", () => {
    setState({ view: "browse", selectedProvider: null, selectedSlot: null });
  });
}

function renderQuoteSent() {
  const p = state.selectedProvider;
  app.innerHTML = `
    <div class="page-narrow confirm-wrap">
      <div class="confirm-check">✓</div>
      <h2 class="confirm-title font-serif">Quote requested</h2>
      <p class="confirm-detail">
        ${state.selectedService.name} with ${p.name}<br />
        Preferred date: ${escapeAttr(state.quoteDate || "your preferred date")}<br />
        ${p.name} will follow up to confirm availability and final pricing.
      </p>
      <button class="confirm-link" id="backToBrowse">Back to browsing</button>
    </div>
  `;

  document.getElementById("backToBrowse").addEventListener("click", () => {
    setState({ view: "browse", selectedProvider: null, selectedSlot: null, quoteDate: null });
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
