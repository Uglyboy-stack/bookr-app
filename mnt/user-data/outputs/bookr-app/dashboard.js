let activeTab = "overview";
let showAddForm = false;

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
}

// ---- Overview ------------------------------------------------------------

function renderOverview() {
  const active = DASH_BOOKINGS.filter((b) => b.status !== "Cancelled");
  const upcoming = active.slice(0, 4);
  const revenue = active.reduce((sum, b) => sum + b.price, 0);

  content.innerHTML = `
    <h1 class="dash-title">Welcome back, ${DASH_PROVIDER.name}</h1>
    <p class="dash-sub">Here's what's happening with your bookings.</p>

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
        <p class="stat-value">4.9</p>
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

function renderServices() {
  content.innerHTML = `
    <h1 class="dash-title">Services</h1>
    <p class="dash-sub">What you offer, and what clients pay.</p>

    <div id="serviceRows">
      ${DASH_SERVICES.map(serviceRowHTML).join("")}
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
      </div>
    `
        : `<button class="add-btn" id="showAddFormBtn">+ Add a service</button>`
    }
  `;

  document.querySelectorAll("[data-remove-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      DASH_SERVICES = DASH_SERVICES.filter((s) => s.id !== btn.dataset.removeId);
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
      const duration = Number(document.getElementById("newServiceDuration").value) || 30;
      const price = Number(document.getElementById("newServicePrice").value) || 0;
      if (!name) return;
      DASH_SERVICES.push({ id: "s" + Date.now(), name, duration, price });
      showAddForm = false;
      renderServices();
    });
  }
}

function serviceRowHTML(s) {
  return `
    <div class="service-manage-row">
      <div class="service-manage-info">
        <p class="service-manage-name">${s.name}</p>
        <p class="service-manage-detail">${s.duration} min · ₦${s.price.toLocaleString()}</p>
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
    renderAvailability();
  });
}

// ---- Bookings ----------------------------------------------------------------

let editingBookingId = null;

function renderBookings() {
  content.innerHTML = `
    <h1 class="dash-title">Bookings</h1>
    <p class="dash-sub">All appointments, past and upcoming. Click Edit to change the day, time, or status.</p>

    <div class="booking-table-wrap">
    <table class="booking-table">
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
    </table>
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
      renderBookings();
    });
  });
}

// ---- Init -----------------------------------------------------------------------

renderTab();
