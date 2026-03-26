const faqItems = [
  {
    question: 'How does Poof link expiry work?',
    answer:
      'Each share link stores a fixed expiresAt timestamp. When someone opens a shared URL after that time, Poof returns an expired state and blocks access.',
  },
  {
    question: 'Can I share only one image instead of a full gallery?',
    answer:
      'Yes. Poof supports three share types: full gallery, single image, and multi-image selection from the same gallery.',
  },
  {
    question: 'Can I revoke a link before it expires?',
    answer:
      'Yes. Owners can revoke any active share link manually. Revoked links immediately become inaccessible and show a revoked state.',
  },
  {
    question: 'What file types and sizes are supported?',
    answer:
      'Poof accepts image/jpeg, image/png, image/webp, and image/heic files up to 10 MB each. Validation runs on the server.',
  },
  {
    question: 'What happens when I delete photos or galleries?',
    answer:
      'Deletions are soft-deleted immediately in the database and hidden from normal queries. Storage objects are permanently removed within 24 hours by cleanup jobs.',
  },
  {
    question: 'Do recipients need an account to view shared links?',
    answer:
      'No. Shared pages are public URLs. Recipients can open them directly until the link expires or is revoked.',
  },
]

const limits = [
  ['Max file size', '10 MB per image'],
  ['Allowed MIME types', 'image/jpeg, image/png, image/webp, image/heic'],
  ['Max galleries per user', '3'],
  ['Max images per gallery', '10'],
  ['Max images in multi-image link', '100'],
  ['Max active links per gallery', '20'],
  ['Expiry window', '1 hour to 1 year'],
  ['Presigned upload URL TTL', '5 minutes'],
]

export function LandingSeoDetails() {
  return (
    <section id="faq" className="relative py-24 sm:py-32 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Built for expiring photo sharing at scale.
          </h2>
          <p className="text-lg text-poof-mist max-w-3xl mx-auto">
            Poof combines direct-to-storage uploads, server-side ownership validation, and deterministic expiry rules
            so link behavior stays predictable for every shared gallery.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
            <h3 className="font-heading font-bold text-2xl text-white mb-4">What Poof supports</h3>
            <ul className="space-y-3 text-poof-mist text-sm leading-relaxed">
              <li>Share full galleries, a single image, or a selected set of images.</li>
              <li>Create multiple independent links for the same gallery.</li>
              <li>Track per-link view count and expiry in your dashboard.</li>
              <li>Revoke links manually without deleting original content.</li>
              <li>Access shared links publicly with no recipient account required.</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
            <h3 className="font-heading font-bold text-2xl text-white mb-4">Security and data lifecycle</h3>
            <ul className="space-y-3 text-poof-mist text-sm leading-relaxed">
              <li>Authentication uses Better Auth with database-backed sessions.</li>
              <li>Upload URLs are presigned and expire quickly to reduce risk.</li>
              <li>Deleted galleries and images are removed from object storage within 24 hours.</li>
              <li>Pending uploads older than 30 minutes are marked failed automatically.</li>
              <li>Session cookies are httpOnly, secure, and SameSite=Lax.</li>
            </ul>
          </article>
        </div>

        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <h3 className="font-heading font-bold text-2xl text-white mb-6">Platform limits (v1)</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white">
                  <th className="py-2 pr-4">Rule</th>
                  <th className="py-2">Value</th>
                </tr>
              </thead>
              <tbody className="text-poof-mist align-top">
                {limits.map(([rule, value]) => (
                  <tr key={rule} className="border-b border-white/5 last:border-b-0">
                    <td className="py-2 pr-4">{rule}</td>
                    <td className="py-2">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-poof-mist text-sm mt-4">
            Need higher limits? Contact{' '}
            <a href="mailto:poof-support@k04.tech" className="text-poof-violet hover:underline">
              poof-support@k04.tech
            </a>{' '}
            or{' '}
            <a href="mailto:hello-poof@k04.tech" className="text-poof-violet hover:underline">
              hello-poof@k04.tech
            </a>
            .
          </p>
        </article>

        <article>
          <h3 className="font-heading font-bold text-2xl text-white mb-6">Frequently asked questions</h3>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4 open:bg-white/[0.03]"
              >
                <summary className="cursor-pointer list-none text-white font-medium">{item.question}</summary>
                <p className="mt-3 text-poof-mist text-sm leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

export const landingFaqForJsonLd = faqItems
