let DASH_PROVIDER = {
  name: "Ada's Braids & Weaves",
  category: "Beauty & Grooming",
};

let DASH_SERVICES = [
  { id: "s1", name: "Box Braids (Medium)", duration: 240, price: 15000 },
  { id: "s2", name: "Silk Press", duration: 90, price: 10000 },
  { id: "s3", name: "Wig Install", duration: 60, price: 8000 },
];

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = ["9:00", "11:00", "13:00", "15:00", "17:00"];

let DASH_AVAILABILITY = {
  Monday: ["9:00", "11:00", "13:00"],
  Tuesday: ["9:00", "11:00", "13:00", "15:00"],
  Wednesday: [],
  Thursday: ["11:00", "13:00", "15:00"],
  Friday: ["9:00", "11:00", "13:00", "15:00", "17:00"],
  Saturday: ["9:00", "11:00"],
  Sunday: [],
};

let DASH_BOOKINGS = [
  { id: "b1", client: "Chiamaka O.", service: "Box Braids (Medium)", day: "Mon, 1 Sep", time: "9:00 AM", status: "Confirmed", price: 15000 },
  { id: "b2", client: "Funke A.", service: "Silk Press", day: "Mon, 1 Sep", time: "1:00 PM", status: "Confirmed", price: 10000 },
  { id: "b3", client: "Blessing E.", service: "Wig Install", day: "Tue, 2 Sep", time: "11:00 AM", status: "Pending", price: 8000 },
  { id: "b4", client: "Ngozi T.", service: "Box Braids (Medium)", day: "Fri, 5 Sep", time: "9:00 AM", status: "Confirmed", price: 15000 },
  { id: "b5", client: "Ifeoma K.", service: "Silk Press", day: "Sat, 6 Sep", time: "11:00 AM", status: "Pending", price: 10000 },
];

// PLACEHOLDER PRICE — swap monthlyFee to the real subscription amount once decided.
let DASH_SUBSCRIPTION = {
  active: false,
  monthlyFee: 5000,
  lastPaymentRef: null,
};
