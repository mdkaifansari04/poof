export const faqItems = [
  {
    question: "How does Poof link expiry work?",
    answer:
      "Each share link stores a fixed expiresAt timestamp. When someone opens a shared URL after that time, Poof returns an expired state and blocks access.",
  },
  {
    question: "Can I share only one image instead of a full gallery?",
    answer:
      "Yes. Poof supports three share types: full gallery, single image, and multi-image selection from the same gallery.",
  },
  {
    question: "Can I revoke a link before it expires?",
    answer:
      "Yes. Owners can revoke any active share link manually. Revoked links immediately become inaccessible and show a revoked state.",
  },
  {
    question: "What file types and sizes are supported?",
    answer:
      "Poof accepts image/jpeg, image/png, image/webp, and image/heic files up to 10 MB each. Validation runs on the server.",
  },
  {
    question: "What happens when I delete photos or galleries?",
    answer:
      "Deletions are soft-deleted immediately in the database and hidden from normal queries. Storage objects are permanently removed within 24 hours by cleanup jobs.",
  },
  {
    question: "Do recipients need an account to view shared links?",
    answer:
      "No. Shared pages are public URLs. Recipients can open them directly until the link expires or is revoked.",
  },
];
