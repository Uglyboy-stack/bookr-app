let activeTab = "overview";
let showAddForm = false;

// ---- Load the correct provider's data for this session --------------------
// Demo account always uses the polished hardcoded data from dashboard-data.js.
// Anyone who signed up gets their own (initially empty) profile, loaded from
// localStorage and re-saved after every change so it persists across visits.
(function loadActiveProfile() {
  if (typeof isDemoAccount === "function" && isDemoAccount()) return; // keep demo data as-is

  const email = sessionStorage.getItem("bookr_provider_email");
  if (!email || typeof getStoredProfile !== "function") return;

  const profile = getStoredProfile(email);
  if (!profile) return;

  DASH_PROVIDER = profile.provider;
  DASH_SERVICES = profile.services;
  DASH_AVAILABILITY = profile.availability;
  DASH_BOOKINGS = profile.bookings;
  DASH_SUBSCRIPTION = profile.subscription;
})();

function saveProfileIfNotDemo() {
  if (typeof isDemoAccount === "function" && isDemoAccount()) return;
  const email = sessionStorage.getItem("bookr_provider_email");
  if (!email || typeof profileKey !== "function") return;
  localStorage.setItem(
    profileKey(email),
    JSON.stringify({
      provider: DASH_PROVIDER,
      services: DASH_SERVICES,
      availability: DASH_AVAILABILITY,
      bookings: DASH_BOOKINGS,
      subscription: DASH_SUBSCRIPTION,
    })
  );
}

// ---- Live updates across tabs (same device only) ---------------------------
// The browser fires a "storage" event in every OTHER tab on this origin whenever
// localStorage changes in one tab. A client paying for a booking (or requesting
// a quote) in one tab writes straight into this provider's stored profile (see
// app.js), which fires this listener here — so if the provider's dashboard is
// open, it updates without them needing to refresh. This does NOT reach a
// different device; that needs a real backend, which is the honest limit here.
if (typeof isDemoAccount !== "function" || !isDemoAccount()) {
  window.addEventListener("storage", (e) => {
    const email = sessionStorage.getItem("bookr_provider_email");
    if (!email || typeof profileKey !== "function") return;
    if (e.key !== profileKey(email)) return; // a change to some other provider's data — ignore

    const previousBookingCount = DASH_BOOKINGS.length;
    const previousStatusById = new Map(DASH_BOOKINGS.map((b) => [b.id, b.status]));

    const profile = getStoredProfile(email);
    if (!profile) return;

    DASH_PROVIDER = profile.provider;
    DASH_SERVICES = profile.services;
    DASH_AVAILABILITY = profile.availability;
    DASH_BOOKINGS = profile.bookings;
    DASH_SUBSCRIPTION = profile.subscription;

    if (DASH_BOOKINGS.length > previousBookingCount) {
      const newest = DASH_BOOKINGS[0];
      showLiveToast(newest && newest.status === "Pending" ? "💬 New quote request received!" : "🎉 New booking received!");
    } else {
      const newlyCancelled = DASH_BOOKINGS.find(
        (b) => b.status === "Cancelled" && previousStatusById.get(b.id) && previousStatusById.get(b.id) !== "Cancelled"
      );
      if (newlyCancelled) {
        showLiveToast(`A client cancelled: ${newlyCancelled.service}, ${newlyCancelled.day}`);
      }
    }

    if (activeTab === "overview" || activeTab === "bookings") {
      renderTab();
    }
  });
}

function showLiveToast(message) {
  const existing = document.getElementById("liveToast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "liveToast";
  toast.className = "live-toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

const content = document.getElementById("dashContent");
const nav = document.getElementById("dashNav");

nav.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-tab]");
  if (!btn) return;
  activeTab = btn.dataset.tab;
  showAddForm = false;
  document.querySelectorAll(".dash-nav-item").forEach((el) => el.classList.remove("active"));
  btn.classList.add("active");
  renderTab();
});

function renderTab() {
  if (activeTab === "overview") return renderOverview();
  if (activeTab === "services") return renderServices();
  if (activeTab === "availability") return renderAvailability();
  if (activeTab === "bookings") return renderBookings();
  if (activeTab === "billing") return renderBilling();
  if (activeTab === "settings") return renderSettings();
}

// ---- Overview ------------------------------------------------------------

function renderOverview() {
  const active = DASH_BOOKINGS.filter((b) => b.status !== "Cancelled");
  const upcoming = active.slice(0, 4);
  const revenue = active.reduce((sum, b) => sum + b.price, 0);

  content.innerHTML = `
    <h1 class="dash-title">Welcome back, ${DASH_PROVIDER.name}</h1>
    <p class="dash-sub">${
      DASH_SERVICES.length === 0
        ? "Let's get your profile set up — start by adding your services."
        : "Here's what's happening with your bookings."
    }</p>

    <div class="stat-grid">
      <div class="stat-card">
        <p class="stat-value">${active.length}</p>
        <p class="stat-label">Upcoming bookings</p>
      </div>
      <div class="stat-card">
        <p class="stat-value">₦${revenue.toLocaleString()}</p>
        <p class="stat-label">Expected revenue</p>
      </div>
      <div class="stat-card">
        <p class="stat-value">${DASH_SERVICES.length}</p>
        <p class="stat-label">Active services</p>
      </div>
      <div class="stat-card">
        <p class="stat-value">${DASH_SERVICES.length === 0 && DASH_BOOKINGS.length === 0 ? "New" : "4.9"}</p>
        <p class="stat-label">Average rating</p>
      </div>
    </div>

    <h2 class="section-label">Upcoming</h2>
    <div class="upcoming-list">
      ${
        upcoming.length
          ? upcoming
              .map(
                (b) => `
        <div class="upcoming-row">
          <div>
            <p class="upcoming-client">${b.client} — ${b.service}</p>
            <p class="upcoming-meta">${b.day} at ${b.time}</p>
          </div>
          <span class="status-chip ${b.status === "Confirmed" ? "status-confirmed" : "status-pending"}">${b.status}</span>
        </div>
      `
              )
              .join("")
          : `<p class="empty-state" style="padding:24px 0;">No upcoming bookings right now.</p>`
      }
    </div>
  `;
}

// ---- Services --------------------------------------------------------------

function formatDuration(mins) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr${h > 1 ? "s" : ""}` : `${h} hr${h > 1 ? "s" : ""} ${m} min`;
}

function renderServices() {
  content.innerHTML = `
    <h1 class="dash-title">Services</h1>
    <p class="dash-sub">What you offer, and what clients pay.</p>

    <div id="serviceRows">
      ${
        DASH_SERVICES.length
          ? DASH_SERVICES.map(serviceRowHTML).join("")
          : `<p class="empty-state" style="padding:24px 0;">You haven't added any services yet.</p>`
      }
    </div>

    ${
      showAddForm
        ? `
      <div class="inline-form" id="addForm">
        <div>
          <label>Service name</label>
          <input type="text" id="newServiceName" placeholder="e.g. Gel Manicure" />
        </div>
        <div>
          <label>Duration (min)</label>
          <input type="number" id="newServiceDuration" placeholder="60" />
        </div>
        <div>
          <label>Price (₦)</label>
          <input type="number" id="newServicePrice" placeholder="8000" />
        </div>
        <button class="save-btn" id="saveServiceBtn">Save</button>
        <p class="settings-status" id="addServiceError" style="grid-column: 1 / -1; margin: 4px 0 0;"></p>
      </div>
    `
        : `<button class="add-btn" id="showAddFormBtn">+ Add a service</button>`
    }
  `;

  document.querySelectorAll("[data-remove-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      DASH_SERVICES = DASH_SERVICES.filter((s) => s.id !== btn.dataset.removeId);
      saveProfileIfNotDemo();
      renderServices();
    });
  });

  const showBtn = document.getElementById("showAddFormBtn");
  if (showBtn) {
    showBtn.addEventListener("click", () => {
      showAddForm = true;
      renderServices();
    });
  }

  const saveBtn = document.getElementById("saveServiceBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const name = document.getElementById("newServiceName").value.trim();
      const durationRaw = document.getElementById("newServiceDuration").value.trim();
      const priceRaw = document.getElementById("newServicePrice").value.trim();
      const errorEl = document.getElementById("addServiceError");

      if (!name) {
        errorEl.textContent = "Give the service a name.";
        errorEl.classList.add("settings-status-error");
        return;
      }
      if (!priceRaw || Number(priceRaw) <= 0) {
        errorEl.textContent = "Enter a price for this service.";
        errorEl.classList.add("settings-status-error");
        return;
      }

      const duration = Number(durationRaw) || 30;
      const price = Number(priceRaw);
      DASH_SERVICES.push({ id: "s" + Date.now(), name, duration, price });
      showAddForm = false;
      saveProfileIfNotDemo();
      renderServices();
    });
  }
}

function serviceRowHTML(s) {
  return `
    <div class="service-manage-row">
      <div class="service-manage-info">
        <p class="service-manage-name">${s.name}</p>
        <p class="service-manage-detail">${formatDuration(s.duration)} · ₦${s.price.toLocaleString()}</p>
      </div>
      <div class="service-actions">
        <button class="icon-btn danger" data-remove-id="${s.id}">Remove</button>
      </div>
    </div>
  `;
}

// ---- Availability ----------------------------------------------------------

function renderAvailability() {
  content.innerHTML = `
    <h1 class="dash-title">Availability</h1>
    <p class="dash-sub">Click a time slot to open or close it for bookings.</p>

    <div class="avail-grid" id="availGrid">
      ${WEEK_DAYS.map(
        (day) => `
        <div class="avail-day-row">
          <span class="avail-day-name">${day}</span>
          <div class="avail-slots">
            ${HOURS.map(
              (h) => `
              <button class="avail-toggle ${DASH_AVAILABILITY[day].includes(h) ? "on" : ""}" data-day="${day}" data-hour="${h}">${h}</button>
            `
            ).join("")}
          </div>
        </div>
      `
      ).join("")}
    </div>
  `;

  document.getElementById("availGrid").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-day]");
    if (!btn) return;
    const { day, hour } = btn.dataset;
    const list = DASH_AVAILABILITY[day];
    const idx = list.indexOf(hour);
    if (idx === -1) list.push(hour);
    else list.splice(idx, 1);
    saveProfileIfNotDemo();
    renderAvailability();
  });
}

// ---- Bookings ----------------------------------------------------------------

let editingBookingId = null;

function renderBookings() {
  content.innerHTML = `
    <h1 class="dash-title">Bookings</h1>
    <p class="dash-sub">All appointments and quote requests. Click Edit to change the day, time, or status.</p>

    <div class="booking-table-wrap">
    ${
      DASH_BOOKINGS.length
        ? `<table class="booking-table">
      <thead>
        <tr>
          <th>Client</th>
          <th>Service</th>
          <th>When</th>
          <th>Status</th>
          <th>Price</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="bookingRows">
        ${DASH_BOOKINGS.map(bookingRowHTML).join("")}
      </tbody>
    </table>`
        : `<p class="empty-state" style="padding:24px 0;">No bookings yet — they'll show up here once clients start booking you.</p>`
    }
    </div>
  `;

  attachBookingListeners();
}

function bookingRowHTML(b) {
  if (b.id === editingBookingId) {
    return `
      <tr class="booking-edit-row">
        <td>${b.client}</td>
        <td>${b.service}</td>
        <td>
          <input class="edit-input" type="text" id="editDay-${b.id}" value="${b.day}" />
          <input class="edit-input" type="text" id="editTime-${b.id}" value="${b.time}" />
        </td>
        <td>
          <select class="edit-input" id="editStatus-${b.id}">
            <option value="Confirmed" ${b.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
            <option value="Pending" ${b.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Cancelled" ${b.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
          </select>
        </td>
        <td class="font-mono">₦${b.price.toLocaleString()}</td>
        <td>
          <div class="service-actions">
            <button class="icon-btn" data-save-id="${b.id}">Save</button>
            <button class="icon-btn danger" data-cancel-edit-id="${b.id}">Cancel</button>
          </div>
        </td>
      </tr>
    `;
  }

  const statusClass =
    b.status === "Confirmed" ? "status-confirmed" : b.status === "Pending" ? "status-pending" : "status-cancelled";

  return `
    <tr>
      <td>${b.client}</td>
      <td>${b.service}</td>
      <td>${b.day}, ${b.time}</td>
      <td><span class="status-chip ${statusClass}">${b.status}</span></td>
      <td class="font-mono">₦${b.price.toLocaleString()}</td>
      <td><button class="icon-btn" data-edit-id="${b.id}">Edit</button></td>
    </tr>
  `;
}

function attachBookingListeners() {
  document.querySelectorAll("[data-edit-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      editingBookingId = btn.dataset.editId;
      renderBookings();
    });
  });

  document.querySelectorAll("[data-cancel-edit-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      editingBookingId = null;
      renderBookings();
    });
  });

  document.querySelectorAll("[data-save-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.saveId;
      const booking = DASH_BOOKINGS.find((b) => b.id === id);
      const day = document.getElementById(`editDay-${id}`).value.trim();
      const time = document.getElementById(`editTime-${id}`).value.trim();
      const status = document.getElementById(`editStatus-${id}`).value;
      if (day) booking.day = day;
      if (time) booking.time = time;
      booking.status = status;
      editingBookingId = null;
      saveProfileIfNotDemo();
      renderBookings();
    });
  });
}

// ---- Billing ----------------------------------------------------------------

function renderBilling() {
  const sub = DASH_SUBSCRIPTION;

  content.innerHTML = `
    <h1 class="dash-title">Billing</h1>
    <p class="dash-sub">Your Bookr subscription.</p>

    <div class="billing-card">
      <div class="billing-status-row">
        <div>
          <p class="billing-plan-name">Bookr Provider Plan</p>
          <p class="billing-plan-price">₦${sub.monthlyFee.toLocaleString()}<span class="billing-per">/month</span></p>
        </div>
        <span class="status-chip ${sub.active ? "status-confirmed" : "status-pending"}">${sub.active ? "Active" : "Not active"}</span>
      </div>

      ${
        sub.active
          ? `<p class="billing-detail">Your subscription is active. Last payment ref: <span class="font-mono">${sub.lastPaymentRef || "—"}</span></p>`
          : `<p class="billing-detail">Pay your monthly fee to keep your profile visible to clients and accepting bookings.</p>
             <button class="add-btn" id="paySubscriptionBtn"><span id="subBtnLabel">Pay ₦${sub.monthlyFee.toLocaleString()} now</span></button>`
      }
      <p class="payment-note" id="subPaymentStatus" style="text-align:left; margin-top:16px;">Secure test payment via Paystack. No real charge will be made.</p>
    </div>
  `;

  const payBtn = document.getElementById("paySubscriptionBtn");
  if (payBtn) {
    payBtn.addEventListener("click", () => paySubscription());
  }
}

function paySubscription() {
  const email = sessionStorage.getItem("bookr_provider_email") || "provider@example.com";
  const payBtn = document.getElementById("paySubscriptionBtn");
  const label = document.getElementById("subBtnLabel");
  const status = document.getElementById("subPaymentStatus");

  payBtn.disabled = true;
  payBtn.classList.add("processing");
  label.innerHTML = '<span class="btn-spinner"></span> Opening secure payment…';
  status.textContent = "Redirecting to Paystack — don't close this tab.";
  status.classList.remove("payment-status-error");

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: DASH_SUBSCRIPTION.monthlyFee * 100,
    currency: "NGN",
    ref: "bookr_sub_" + Date.now(),
    callback: function (response) {
      DASH_SUBSCRIPTION.active = true;
      DASH_SUBSCRIPTION.lastPaymentRef = response.reference;
      saveProfileIfNotDemo();
      renderBilling();
    },
    onClose: function () {
      const btn = document.getElementById("paySubscriptionBtn");
      const lbl = document.getElementById("subBtnLabel");
      const st = document.getElementById("subPaymentStatus");
      if (btn) {
        btn.disabled = false;
        btn.classList.remove("processing");
      }
      if (lbl) lbl.textContent = `Pay ₦${DASH_SUBSCRIPTION.monthlyFee.toLocaleString()} now`;
      if (st) {
        st.textContent = "Payment was cancelled — nothing was charged. You can try again anytime.";
        st.classList.add("payment-status-error");
      }
    },
  });
  handler.openIframe();
}

// ---- Settings ----------------------------------------------------------------

const BOOKR_CATEGORIES = ["Home Services", "Beauty & Grooming", "Tutoring", "Events", "Auto & Repair", "Cleaning", "Fitness & Wellness", "Tech Repairs", "Pet Care"];

function renderSettings() {
  const p = DASH_PROVIDER;
  const isDemo = typeof isDemoAccount === "function" && isDemoAccount();

  content.innerHTML = `
    <h1 class="dash-title">Settings</h1>
    <p class="dash-sub">Your business profile, as clients see it.</p>

    <div class="settings-card">
      ${
        isDemo
          ? `<p class="settings-demo-note">You're viewing the demo account — changes here won't be saved, since this profile resets each session.</p>`
          : ""
      }

      <label class="login-label" for="settingsName">Business name</label>
      <input class="edit-input" type="text" id="settingsName" value="${escapeAttr(p.name)}" />

      <label class="login-label" for="settingsCategory">Category</label>
      <select class="edit-input" id="settingsCategory">
        ${BOOKR_CATEGORIES.map((c) => `<option value="${c}" ${p.category === c ? "selected" : ""}>${c}</option>`).join("")}
      </select>

      <label class="login-label" for="settingsLocation">Location</label>
      <input class="edit-input" type="text" id="settingsLocation" value="${escapeAttr(p.location || "")}" />

      <p class="settings-status" id="settingsStatus" role="status" aria-live="polite"></p>

      <button class="add-btn" id="saveSettingsBtn">Save changes</button>
    </div>
  `;

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const name = document.getElementById("settingsName").value.trim();
    const category = document.getElementById("settingsCategory").value;
    const location = document.getElementById("settingsLocation").value.trim();
    const status = document.getElementById("settingsStatus");

    if (!name || !location) {
      status.textContent = "Business name and location can't be empty.";
      status.classList.add("settings-status-error");
      return;
    }

    DASH_PROVIDER.name = name;
    DASH_PROVIDER.category = category;
    DASH_PROVIDER.location = location;
    saveProfileIfNotDemo();

    status.textContent = isDemo ? "Updated for this session (demo changes aren't saved)." : "Saved.";
    status.classList.remove("settings-status-error");
  });
}

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

// ---- Init -----------------------------------------------------------------------

renderTab();
