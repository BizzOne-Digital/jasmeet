export interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  role?: string;
  focus?: string;
}

/** Frontend-seeded testimonials — not managed in the admin CMS. */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Aisha Rahman",
    location: "Toronto, ON",
    role: "Strength coach",
    quote:
      "The fit is unreal — supportive without feeling restrictive. I wear DAYAURA for training and still feel put together after class.",
    focus: "AuraImpact Sculpt Leggings",
  },
  {
    id: "2",
    name: "Maya Chen",
    location: "Vancouver, BC",
    role: "Yoga instructor",
    quote:
      "Soft enough for flow, structured enough for long days. The hidden message detail made me smile the first time I found it.",
    focus: "AuraWave Flare Set",
  },
  {
    id: "3",
    name: "Jordan Ellis",
    location: "Ottawa, ON",
    role: "Runner",
    quote:
      "I've tried a lot of premium sets. DAYAURA feels intentional — the fabrics hold up, and the silhouettes photograph beautifully.",
    focus: "AuraMesh Legging Set",
  },
  {
    id: "4",
    name: "Priya Nair",
    location: "Mississauga, ON",
    role: "Studio founder",
    quote:
      "Clients keep asking what I'm wearing. It's that rare mix of performance and quiet luxury.",
    focus: "AuraFlow Off-Shoulder Lounge Set",
  },
  {
    id: "5",
    name: "Elena Vargas",
    location: "Montreal, QC",
    role: "Wellness writer",
    quote:
      "From lounge days to HIIT, the pieces move with me. Packaging, fit, and finish all feel elevated.",
    focus: "AuraImpact Performance Sports Bra",
  },
  {
    id: "6",
    name: "Hannah Brooks",
    location: "Calgary, AB",
    role: "Pilates enthusiast",
    quote:
      "Finally found activewear that feels like fashion without sacrificing squat-proof confidence.",
    focus: "DAYAURA Gym Bag",
  },
];
