import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircleHeart } from "lucide-react";
import { SeoBreadcrumbs } from "@/components/seo-breadcrumbs";
import { buildBreadcrumbSchema, buildCanonicalLink, buildSeoMeta, getCanonicalUrl } from "@/lib/site";

const CONTACT_EMAIL = "hello@random-pokemon-generator.com";

export const Route = createFileRoute("/contact-us")({
  head: () => ({
    meta: buildSeoMeta({
      title: "Contact Us — RandomPoké",
      description:
        "Get in touch with RandomPoké for feedback, support, partnership requests, or bug reports.",
      path: "/contact-us",
    }),
    links: buildCanonicalLink("/contact-us"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Us",
          url: getCanonicalUrl("/contact-us"),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact Us", path: "/contact-us" },
          ]),
        ),
      },
    ],
  }),
  component: ContactUsPage,
});

function ContactUsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
      <header className="max-w-2xl">
        <SeoBreadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Contact Us" },
          ]}
        />
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-5xl">Contact Us</h1>
        <p className="mt-3 text-muted-foreground">
          Questions, feedback, bug reports, or partnership ideas are all welcome. The fastest way to reach us is by email.
        </p>
      </header>

      <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--gradient-primary)] text-zinc-950 shadow-[var(--shadow-pop)]">
            <MessageCircleHeart className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold">Email Support</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We usually review messages related to feature requests, data issues, SEO feedback, and technical problems.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--gradient-primary)] px-5 py-2.5 text-sm font-bold text-zinc-950 shadow-[var(--shadow-pop)] transition-transform hover:scale-[1.02]"
            >
              <Mail className="h-4 w-4" />
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["General feedback", "Tell us what you enjoy or where the generator can improve."],
          ["Bug reports", "Send the page URL, your filters or seed, and what went wrong."],
          ["Partnerships", "Reach out for collaborations, content ideas, or brand inquiries."],
        ].map(([title, description]) => (
          <article key={title} className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-display text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
