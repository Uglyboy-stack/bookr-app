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
  const slots = getSlotsForDay(state.dayIndex);

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
              <p class="service-name">${s.name}</p>
              <p class="service-duration">⏱ ${s.duration} min</p>
            </div>
            <span class="service-price">₦${s.price.toLocaleString()}</span>
          </button>
        `
          )
          .join("")}
      </div>

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
          <p class="summary-label">Total</p>
          <p class="summary-price">₦${state.selectedService.price.toLocaleString()}</p>
        </div>
        <button class="confirm-btn ${state.selectedSlot ? "enabled" : ""}" id="confirmBtn" ${state.selectedSlot ? "" : "disabled"}>
          Confirm booking
        </button>
      </div>
    </div>
  `;

  document.getElementById("backBtn").addEventListener("click", () => {
    setState({ view: "browse" });
  });

  document.getElementById("serviceList").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-service-id]");
    if (!btn) return;
    const service = state.selectedProvider.services.find((s) => s.id === btn.dataset.serviceId);
    setState({ selectedService: service });
  });

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

// ---- Confirmation view ------------------------------------------------------------

function renderConfirmed() {
  const p = state.selectedProvider;
  app.innerHTML = `
    <div class="page-narrow confirm-wrap">
      <div class="confirm-check">✓</div>
      <h2 class="confirm-title font-serif">Booking confirmed</h2>
      <p class="confirm-detail">
        ${state.selectedService.name} with ${p.name}<br />
        ${DAYS[state.dayIndex]} at ${state.selectedSlot}
      </p>
      <button class="confirm-link" id="backToBrowse">Back to browsing</button>
    </div>
  `;

  document.getElementById("backToBrowse").addEventListener("click", () => {
    setState({ view: "browse", selectedProvider: null, selectedSlot: null });
  });
}

// ---- Utils ------------------------------------------------------------------------

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

// ---- Init ---------------------------------------------------------------------------

render();
