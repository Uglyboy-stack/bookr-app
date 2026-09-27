const CATEGORIES = ["All", "Home Services", "Beauty & Grooming", "Tutoring", "Events", "Auto & Repair", "Cleaning", "Fitness & Wellness", "Tech Repairs", "Pet Care"];

// Shared set of bookable hour slots (24-hour "HH:MM" format), matching what
// providers see and toggle in their own Availability tab.
const HOURS = ["9:00", "11:00", "13:00", "15:00", "17:00"];

const PROVIDERS = [
  {
    id: 1,
    name: "Ada's Braids & Weaves",
    category: "Beauty & Grooming",
    location: "Lekki Phase 1",
    rating: 4.9,
    reviews: 128,
    priceFrom: 8000,
    tag: "Top rated",
    services: [
      { id: "s1", name: "Box Braids (Medium)", duration: 240, price: 15000 },
      { id: "s2", name: "Silk Press", duration: 90, price: 10000 },
      { id: "s3", name: "Wig Install", duration: 60, price: 8000 },
    ],
    availability: {
      Monday: ["9:00", "11:00", "13:00"],
      Tuesday: ["9:00", "11:00", "13:00", "15:00"],
      Wednesday: [],
      Thursday: ["11:00", "13:00", "15:00"],
      Friday: ["9:00", "11:00", "13:00", "15:00", "17:00"],
      Saturday: ["9:00", "11:00"],
      Sunday: [],
    },
    bookings: [],
  },
  {
    id: 2,
    name: "Kingsley Fades",
    category: "Beauty & Grooming",
    location: "Yaba",
    rating: 4.8,
    reviews: 96,
    priceFrom: 3500,
    tag: "Fast booking",
    services: [
      { id: "s4", name: "Skin Fade", duration: 30, price: 3500 },
      { id: "s5", name: "Fade + Beard Line-up", duration: 45, price: 5000 },
      { id: "s6", name: "Kids Cut", duration: 25, price: 3000 },
    ],
    availability: {
      Monday: ["9:00", "11:00", "13:00", "15:00", "17:00"],
      Tuesday: ["9:00", "11:00", "13:00", "15:00", "17:00"],
      Wednesday: ["9:00", "11:00", "13:00", "15:00", "17:00"],
      Thursday: ["9:00", "11:00", "13:00", "15:00", "17:00"],
      Friday: ["9:00", "11:00", "13:00", "15:00", "17:00"],
      Saturday: ["9:00", "11:00", "13:00"],
      Sunday: [],
    },
    bookings: [],
  },
  {
    id: 3,
    name: "Emeka Plumbing Works",
    category: "Home Services",
    location: "Ikeja",
    rating: 4.6,
    reviews: 54,
    priceFrom: 6000,
    tag: null,
    services: [
      { id: "s7", name: "Pipe Leak Repair", duration: 60, price: 8000 },
      { id: "s8", name: "Drain Unclogging", duration: 45, price: 6000 },
      { id: "s9", name: "Water Heater Install", duration: 120, price: 20000 },
    ],
    availability: {
      Monday: ["9:00", "11:00", "13:00", "15:00"],
      Tuesday: ["9:00", "11:00", "13:00", "15:00"],
      Wednesday: ["9:00", "11:00", "13:00", "15:00"],
      Thursday: ["9:00", "11:00", "13:00", "15:00"],
      Friday: ["9:00", "11:00", "13:00"],
      Saturday: ["9:00", "11:00"],
      Sunday: [],
    },
    bookings: [],
  },
  {
    id: 4,
    name: "Bright Minds Tutors",
    category: "Tutoring",
    location: "Yaba",
    rating: 4.9,
    reviews: 73,
    priceFrom: 5000,
    tag: "Top rated",
    services: [
      { id: "s10", name: "Math Tutoring Session", duration: 60, price: 5000 },
      { id: "s11", name: "WAEC Prep Package", duration: 90, price: 8000 },
      { id: "s12", name: "JAMB Crash Course", duration: 60, price: 6000 },
    ],
    availability: {
      Monday: ["15:00", "17:00"],
      Tuesday: ["15:00", "17:00"],
      Wednesday: ["15:00", "17:00"],
      Thursday: ["15:00", "17:00"],
      Friday: ["15:00", "17:00"],
      Saturday: ["9:00", "11:00", "13:00", "15:00"],
      Sunday: ["13:00", "15:00"],
    },
    bookings: [],
  },
  {
    id: 5,
    name: "Frame & Focus Photography",
    category: "Events",
    location: "Victoria Island",
    rating: 4.8,
    reviews: 40,
    priceFrom: 15000,
    tag: "New",
    services: [
      { id: "s13", name: "Portrait Session", duration: 60, price: 15000 },
      { id: "s14", name: "Event Coverage (Half Day)", duration: 240, price: 60000, quoteOnly: true },
      { id: "s15", name: "Wedding Package", duration: 480, price: 150000, quoteOnly: true },
    ],
    availability: {
      Monday: [],
      Tuesday: ["11:00", "13:00"],
      Wednesday: ["11:00", "13:00"],
      Thursday: ["11:00", "13:00", "15:00"],
      Friday: ["11:00", "13:00", "15:00"],
      Saturday: ["9:00", "11:00", "13:00", "15:00"],
      Sunday: ["11:00", "13:00"],
    },
    bookings: [],
  },
  {
    id: 6,
    name: "AutoFix Garage",
    category: "Auto & Repair",
    location: "Ojota",
    rating: 4.5,
    reviews: 61,
    priceFrom: 5000,
    tag: null,
    services: [
      { id: "s16", name: "Oil Change", duration: 30, price: 5000 },
      { id: "s17", name: "Brake Inspection", duration: 45, price: 7000 },
      { id: "s18", name: "Full Service", duration: 120, price: 25000 },
    ],
    availability: {
      Monday: ["9:00", "11:00", "13:00", "15:00"],
      Tuesday: ["9:00", "11:00", "13:00", "15:00"],
      Wednesday: ["9:00", "11:00", "13:00", "15:00"],
      Thursday: ["9:00", "11:00", "13:00", "15:00"],
      Friday: ["9:00", "11:00", "13:00", "15:00"],
      Saturday: ["9:00", "11:00", "13:00"],
      Sunday: [],
    },
    bookings: [],
  },
  {
    id: 7,
    name: "Face by Tomi",
    category: "Beauty & Grooming",
    location: "Ikeja GRA",
    rating: 5.0,
    reviews: 61,
    priceFrom: 15000,
    tag: null,
    services: [
      { id: "s19", name: "Bridal Makeup", duration: 120, price: 55000, quoteOnly: true },
      { id: "s20", name: "Soft Glam", duration: 75, price: 20000 },
      { id: "s21", name: "Makeup Trial", duration: 60, price: 15000 },
    ],
    availability: {
      Monday: [],
      Tuesday: ["11:00", "13:00"],
      Wednesday: ["11:00", "13:00"],
      Thursday: ["11:00", "13:00", "15:00"],
      Friday: ["11:00", "13:00", "15:00", "17:00"],
      Saturday: ["9:00", "11:00", "13:00", "15:00", "17:00"],
      Sunday: ["11:00", "13:00"],
    },
    bookings: [],
  },
  {
    id: 8,
    name: "Glow Lash & Nail Bar",
    category: "Beauty & Grooming",
    location: "Surulere",
    rating: 4.7,
    reviews: 84,
    priceFrom: 6000,
    tag: null,
    services: [
      { id: "s22", name: "Classic Lash Set", duration: 90, price: 12000 },
      { id: "s23", name: "Gel Manicure", duration: 45, price: 6000 },
      { id: "s24", name: "Pedicure", duration: 50, price: 7000 },
    ],
    availability: {
      Monday: ["9:00", "11:00", "13:00", "15:00"],
      Tuesday: ["9:00", "11:00", "13:00", "15:00"],
      Wednesday: ["9:00", "11:00", "13:00", "15:00"],
      Thursday: [],
      Friday: ["9:00", "11:00", "13:00", "15:00"],
      Saturday: ["9:00", "11:00", "13:00"],
      Sunday: [],
    },
    bookings: [],
  },
  {
    id: 9,
    name: "SparkleClean Services",
    category: "Cleaning",
    location: "Ikoyi",
    rating: 4.6,
    reviews: 47,
    priceFrom: 8000,
    tag: null,
    services: [
      { id: "s25", name: "Standard Home Clean", duration: 120, price: 8000 },
      { id: "s26", name: "Laundry Pickup & Fold", duration: 45, price: 4000 },
      { id: "s27", name: "Move-in/Move-out Deep Clean", duration: 300, price: 35000, quoteOnly: true },
    ],
    availability: {
      Monday: ["9:00", "11:00", "13:00"],
      Tuesday: ["9:00", "11:00", "13:00"],
      Wednesday: ["9:00", "11:00", "13:00"],
      Thursday: ["9:00", "11:00", "13:00"],
      Friday: ["9:00", "11:00"],
      Saturday: ["9:00", "11:00", "13:00"],
      Sunday: [],
    },
    bookings: [],
  },
  {
    id: 10,
    name: "Flex Fitness Coaching",
    category: "Fitness & Wellness",
    location: "Lekki",
    rating: 4.9,
    reviews: 58,
    priceFrom: 6000,
    tag: "Top rated",
    services: [
      { id: "s28", name: "1-on-1 Training Session", duration: 60, price: 8000 },
      { id: "s29", name: "Group Class Drop-in", duration: 45, price: 6000 },
      { id: "s30", name: "4-Week Coaching Plan", duration: 60, price: 40000, quoteOnly: true },
    ],
    availability: {
      Monday: ["9:00", "11:00", "17:00"],
      Tuesday: ["9:00", "11:00", "17:00"],
      Wednesday: ["9:00", "11:00", "17:00"],
      Thursday: ["9:00", "11:00", "17:00"],
      Friday: ["9:00", "11:00"],
      Saturday: ["9:00", "11:00", "13:00"],
      Sunday: [],
    },
    bookings: [],
  },
  {
    id: 11,
    name: "QuickFix Gadgets",
    category: "Tech Repairs",
    location: "Computer Village, Ikeja",
    rating: 4.5,
    reviews: 112,
    priceFrom: 4000,
    tag: "Fast booking",
    services: [
      { id: "s31", name: "Phone Screen Repair", duration: 45, price: 12000 },
      { id: "s32", name: "Laptop Diagnostics", duration: 30, price: 4000 },
      { id: "s33", name: "Data Recovery", duration: 90, price: 20000 },
    ],
    availability: {
      Monday: ["9:00", "11:00", "13:00", "15:00", "17:00"],
      Tuesday: ["9:00", "11:00", "13:00", "15:00", "17:00"],
      Wednesday: ["9:00", "11:00", "13:00", "15:00", "17:00"],
      Thursday: ["9:00", "11:00", "13:00", "15:00", "17:00"],
      Friday: ["9:00", "11:00", "13:00", "15:00", "17:00"],
      Saturday: ["9:00", "11:00", "13:00"],
      Sunday: [],
    },
    bookings: [],
  },
  {
    id: 12,
    name: "Paws & Claws Grooming",
    category: "Pet Care",
    location: "Yaba",
    rating: 4.8,
    reviews: 33,
    priceFrom: 5000,
    tag: "New",
    services: [
      { id: "s34", name: "Dog Bath & Groom", duration: 60, price: 7000 },
      { id: "s35", name: "Nail Trim", duration: 15, price: 2000 },
      { id: "s36", name: "Pet Sitting (per day)", duration: 480, price: 5000, quoteOnly: true },
    ],
    availability: {
      Monday: ["9:00", "11:00", "13:00"],
      Tuesday: ["9:00", "11:00", "13:00"],
      Wednesday: ["9:00", "11:00", "13:00"],
      Thursday: ["9:00", "11:00", "13:00"],
      Friday: ["9:00", "11:00", "13:00"],
      Saturday: ["9:00", "11:00", "13:00", "15:00"],
      Sunday: [],
    },
    bookings: [],
  },
];

// Sample reviews per provider (by provider id). Clearly illustrative placeholder
// content for the prototype — replace with real client reviews once providers
// have real bookings.
const REVIEWS = {
  1: [
    { name: "Chiamaka O.", rating: 5, text: "My braids lasted 8 weeks and looked fresh the whole time. Booking was so easy too." },
    { name: "Funke A.", rating: 5, text: "Ada is gentle and fast. Best silk press I've had in Lagos." },
  ],
  2: [
    { name: "Tunde B.", rating: 5, text: "Cleanest fade I've gotten. In and out in 30 minutes exactly like the app said." },
  ],
  3: [
    { name: "Yusuf A.", rating: 5, text: "Fixed a leak under my sink in 40 minutes, cleaned up after himself too." },
  ],
  4: [
    { name: "Ifeoma N.", rating: 5, text: "My son's math grade went from a C to an A in one term. Patient tutor." },
  ],
  5: [
    { name: "Bisi A.", rating: 5, text: "Did our engagement shoot — photos were ready in 3 days and stunning." },
  ],
  6: [
    { name: "Michael K.", rating: 4, text: "Quick oil change, honest about what my car actually needed." },
  ],
  7: [
    { name: "Zainab M.", rating: 5, text: "Did my makeup for my sister's wedding — flawless and it lasted all day." },
  ],
  8: [
    { name: "Ngozi T.", rating: 5, text: "Lash set is still full 3 weeks later. Definitely booking again." },
  ],
  9: [
    { name: "Chidinma E.", rating: 4, text: "Thorough clean, showed up exactly on time." },
  ],
  10: [
    { name: "David O.", rating: 5, text: "Lost 6kg in 2 months with the coaching plan. Actually holds me accountable." },
  ],
  11: [
    { name: "Amaka P.", rating: 4, text: "Screen repair took 45 minutes while I waited. Good as new." },
  ],
  12: [
    { name: "Tobi F.", rating: 5, text: "My dog actually enjoys bath day now. Gentle with nervous pets." },
  ],
};

// ---- Real day/slot generation ----------------------------------------------
// Computes the actual next 3 calendar days from today, and — for a given
// provider — reads their real Availability settings plus their existing
// bookings to work out genuinely open slots. Only used for instant-booking
// services; quoteOnly services skip this entirely and use the request form.

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getBookingDays() {
  const days = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dow = WEEKDAY_NAMES[d.getDay()];
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : `${dow.slice(0, 3)} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
    days.push({ label, dow, dateKey });
  }
  return days;
}

function formatHourLabel(hour24) {
  const [hStr, mStr] = hour24.split(":");
  let h = parseInt(hStr, 10);
  const meridiem = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${mStr} ${meridiem}`;
}

function getAvailableSlots(provider, dayEntry) {
  const openHours = (provider.availability && provider.availability[dayEntry.dow]) || [];
  const existingBookings = provider.bookings || [];

  const takenHours = new Set(
    existingBookings
      .filter((b) => b.status !== "Cancelled" && b.dateKey === dayEntry.dateKey)
      .map((b) => b.hour24)
      .filter(Boolean)
  );

  return openHours
    .filter((h) => !takenHours.has(h))
    .map((h) => ({ hour24: h, label: formatHourLabel(h) }));
}
