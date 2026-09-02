const CATEGORIES = ["All", "Home Services", "Beauty & Grooming", "Tutoring", "Events", "Auto & Repair"];

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
      { id: "s14", name: "Event Coverage (Half Day)", duration: 240, price: 60000 },
      { id: "s15", name: "Wedding Package", duration: 480, price: 150000 },
    ],
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
      { id: "s19", name: "Bridal Makeup", duration: 120, price: 55000 },
      { id: "s20", name: "Soft Glam", duration: 75, price: 20000 },
      { id: "s21", name: "Makeup Trial", duration: 60, price: 15000 },
    ],
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
  },
];

const DAYS = ["Today", "Tomorrow", "Wed 3rd"];

function getSlotsForDay(dayIndex) {
  const base = [9, 10, 11, 13, 14, 15, 16];
  return base
    .filter((_, i) => (dayIndex + i) % 3 !== 0)
    .map((h) => `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`);
}
