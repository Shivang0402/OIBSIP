import { Link } from 'react-router-dom';
import { Clock, Mail, MapPin, Phone, Pizza } from 'lucide-react';
import '../styles/footer.css';

function BrandSvg({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function InstagramIcon() {
  return (
    <BrandSvg>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </BrandSvg>
  );
}

function FacebookIcon() {
  return (
    <BrandSvg>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </BrandSvg>
  );
}

function TwitterIcon() {
  return (
    <BrandSvg>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </BrandSvg>
  );
}

function LinkedInIcon() {
  return (
    <BrandSvg>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </BrandSvg>
  );
}

function GithubIcon() {
  return (
    <BrandSvg>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </BrandSvg>
  );
}

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Menu', to: '/menu' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
  { label: 'Track Order', to: '/orders' },
];

const SUPPORT_LINKS = [
  { label: 'Help Center', href: '#help' },
  { label: 'FAQs', href: '#faqs' },
  { label: 'Privacy Policy', href: '#privacy' },
  { label: 'Terms & Conditions', href: '#terms' },
  { label: 'Refund Policy', href: '#refund' },
];

const CONTACT_DETAILS = [
  { icon: Phone, label: '+91 98765 43210' },
  { icon: Mail, label: 'hello@pizzanova.in' },
  { icon: MapPin, label: 'Surat, Gujarat' },
  { icon: Clock, label: 'Mon–Sun | 10 AM – 11 PM' },
];

const SOCIAL_LINKS = [
  { icon: InstagramIcon, label: 'Instagram', href: '#' },
  { icon: FacebookIcon, label: 'Facebook', href: '#' },
  { icon: TwitterIcon, label: 'X (Twitter)', href: '#' },
  { icon: LinkedInIcon, label: 'LinkedIn', href: '#' },
  { icon: GithubIcon, label: 'GitHub', href: '#' },
];

function FooterLink({ item }) {
  if (item.to) {
    return (
      <li>
        <Link className="footer-link" to={item.to}>
          {item.label}
        </Link>
      </li>
    );
  }
  return (
    <li>
      <a className="footer-link" href={item.href}>
        {item.label}
      </a>
    </li>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link className="footer-brand" to="/">
              <span className="footer-brand__icon">
                <Pizza size={20} />
              </span>
              PizzaNova
            </Link>
            <p className="footer-brand__desc">
              Handcrafted pizzas made with premium ingredients and a seamless ordering
              experience — from our oven to your door.
            </p>
            <p className="footer-brand__tagline">Crafted With Every Slice.</p>
          </div>

          <div className="footer__col">
            <h3 className="footer__heading">Quick Links</h3>
            <ul className="footer__list">
              {QUICK_LINKS.map((item) => (
                <FooterLink key={item.label} item={item} />
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h3 className="footer__heading">Support</h3>
            <ul className="footer__list">
              {SUPPORT_LINKS.map((item) => (
                <FooterLink key={item.label} item={item} />
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h3 className="footer__heading">Contact</h3>
            <ul className="footer__list footer__list--contact">
              {CONTACT_DETAILS.map(({ icon: Icon, label }) => (
                <li key={label}>
                  <Icon size={15} className="footer-contact__icon" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h3 className="footer__heading">Follow Us</h3>
            <div className="footer__social">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  className="footer-social"
                  href={href}
                  aria-label={label}
                  title={label}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer__bar">
          <p>© 2026 PizzaNova. &nbsp; All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
