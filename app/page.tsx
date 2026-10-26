import Link from "next/link";
// ─── Landing (/) — section map ──────────────────────────────────────────────
// hero → #how-it-works → #categories → #privacy → #faq (FaqAccordion) →
// FinaleCta → footer. Data: `categories` icons, `faqs` with answer CTA links.
// Styles: .hero*, .steps, .category-*, .split-feature, .faq-*, .finale-*.
import {
  ArrowRight,
  Check,
  CircleHelp,
  GraduationCap,
  HeartPulse,
  House,
  MessageCircle,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { FaqAccordion } from "@/components/faq-accordion";
import { FinaleCta } from "@/components/finale-cta";

const categories = [
  { name: "Hostel", icon: House, copy: "Living conditions and facilities." },
  { name: "Academic", icon: GraduationCap, copy: "Learning, access, and support." },
  { name: "Sports", icon: Trophy, copy: "Spaces, equipment, and teams." },
  { name: "Health", icon: HeartPulse, copy: "Care, counselling, and wellbeing." },
  { name: "SUG", icon: MessageCircle, copy: "Union ideas and accountability." },
];

const faqs = [
  {
    q: "Do I need to use my real name?",
    a: "No. Register with email and password, then post anonymously. Other students only see Anonymous.",
    linkLabel: "See how anonymity works",
    linkHref: "#privacy",
  },
  {
    q: "Who can see my identity if I post anonymously?",
    a: "Only welfare moderators, privately, to handle abuse or spam. There are no public student profiles and no directory.",
  },
  {
    q: "Can I vote without revealing myself?",
    a: "Yes. Votes are aggregate-only to other students. You stay logged in so one person cannot vote twice.",
    linkLabel: "Open the public feed",
    linkHref: "/app",
  },
  {
    q: "What happens after I raise an issue?",
    a: "It enters the public queue with a clear status — Under Review, Seen, In Progress, Resolved — plus official replies when there is an update.",
    linkLabel: "Raise your first issue",
    linkHref: "/register",
  },
  {
    q: "What should I report here?",
    a: "Anything affecting student life: hostel, academic, sports, health, or SUG matters. Keep it specific enough to act on.",
  },
  {
    q: "Is Wella free for students?",
    a: "Yes. Every student can browse, vote, and raise issues for free. Moderation is handled by the SUG welfare office.",
    linkLabel: "Create a free account",
    linkHref: "/register",
  },
];

export default function LandingPage() {
  return (
    <main className="site-shell">
      <header className="landing-header">
        <div className="container navbar">
          <Brand />
          <nav className="nav-links" aria-label="Main navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#categories">Categories</a>
            <a href="#privacy">Privacy</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="nav-actions">
            <Link className="button secondary" href="/login">
              Log in
            </Link>
            <Link className="button primary" href="/register">
              Raise an issue <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">Participate</div>
            <h1 className="display">
              Raise what
              needs fixing.
            </h1>
            <p className="hero-copy">
              Wella turns scattered welfare complaints into a visible, accountable queue the student
              community can move together.
            </p>
            <div className="hero-actions">
              <Link className="button primary" href="/register">
                Create your first issue <ArrowRight size={16} />
              </Link>
              <Link className="button secondary" href="/app">
                See the public feed
              </Link>
            </div>
            <div className="hero-meta">
              <strong>Built for student voices.</strong>
              <span>Designed for action.</span>
            </div>
          </div>
          <div className="hero-art">
            <img
              src="/illustrations/project-feedback.svg"
              alt="Students sharing structured feedback"
            />
          </div>
        </div>
      </section>
      <section className="section soft" id="how-it-works" aria-labelledby="how-heading">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">A simple loop</div>
              <h2 id="how-heading" className="display">
                From complaint to visible progress.
              </h2>
            </div>
            <p>Three moves. No noise, just a record the union can act on.</p>
          </div>
          <div className="steps">
            <article className="step">
              <span className="step-number">01</span>
              <h3>Raise it clearly.</h3>
              <p>Title, context, category, optional photo. Post anonymously if that helps.</p>
            </article>
            <article className="step">
              <span className="step-number">02</span>
              <h3>Let the signal build.</h3>
              <p>Students vote and add context while staying anonymous when needed.</p>
            </article>
            <article className="step">
              <span className="step-number">03</span>
              <h3>Track the response.</h3>
              <p>Status updates and official replies keep the record honest.</p>
            </article>
          </div>
        </div>
      </section>
      <section className="section soft" id="categories" aria-labelledby="categories-heading">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">What belongs here</div>
              <h2 id="categories-heading" className="display">
                If it affects student life, it belongs here.
              </h2>
            </div>
            <p>Specific enough to act on, broad enough to reflect campus life.</p>
          </div>
          <div className="category-list">
            {categories.map(({ name, icon: Icon, copy }) => (
              <article className="category" key={name}>
                <span className="category-icon">
                  <Icon size={16} />
                </span>
                <h3>{name}</h3>
                <p className="muted" style={{ fontSize: "0.76rem", margin: "7px 0 0" }}>
                  {copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section" id="privacy" aria-labelledby="privacy-heading">
        <div className="container split-feature">
          <img
            src="/illustrations/design-community.svg"
            alt="A community collaborating around ideas"
          />
          <div>
            <div className="eyebrow">A safer voice</div>
            <h2
              id="privacy-heading"
              className="display"
              style={{ fontSize: "clamp(2.4rem, 5vw, 4.3rem)", margin: "13px 0 20px" }}
            >
              Protect the person. Keep the signal.
            </h2>
            <p className="muted">
              Post anonymously or keep your vote private. Wella remembers enough internally to stop
              double voting.
            </p>
            <div className="feature-list">
              <div className="feature-row">
                <span>
                  <ShieldCheck size={16} />
                </span>
                <div>
                  <h3>Anonymous by design</h3>
                  <p>Public views show aggregate signal, never voter identities.</p>
                </div>
              </div>
              <div className="feature-row">
                <span>
                  <Check size={16} />
                </span>
                <div>
                  <h3>Clear status language</h3>
                  <p>Under Review, Seen, In Progress, and Resolved tell you where things stand.</p>
                </div>
              </div>
              <div className="feature-row">
                <span>
                  <CircleHelp size={16} />
                </span>
                <div>
                  <h3>Moderated when needed</h3>
                  <p>Report abusive content so the welfare team can keep things useful.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section soft" id="faq" aria-labelledby="faq-heading">
        <div className="container faq-split">
          <div className="faq-sticky">
            <span className="faq-pill">FAQs</span>
            <h2 id="faq-heading" className="display faq-big">
              You have likely got a few questions
            </h2>
            <p className="faq-side-copy">
              How Wella keeps you safe while keeping the signal visible.
            </p>
            <Link className="faq-side-link" href="/register">
              Create a free account <ArrowRight size={14} />
            </Link>
          </div>
          <FaqAccordion items={faqs} />
        </div>
      </section>
      <FinaleCta />
      <footer className="footer">
        <div className="container footer-row">
          <Brand />
          <span>Made for clearer student welfare conversations.</span>
          <span>© 2026 Wella</span>
        </div>
      </footer>
    </main>
  );
}
