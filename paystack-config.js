// Paystack public key — safe to expose in client-side code (it's designed for this).
// The SECRET key must never appear in frontend code — it stays server-side only,
// used later to verify payments actually succeeded before trusting them.
const PAYSTACK_PUBLIC_KEY = "pk_test_37acf4bd37fed2f5564a778e4c9c125976e2300e";
