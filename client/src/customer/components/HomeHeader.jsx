import { useEffect, useState } from "react";
import logoImage from "../../assets/images/logo-site.png";
import { navLinks } from "./homeData.js";

export default function HomeHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("#home");

  useEffect(() => {
    document.body.classList.toggle("menu-open", isMenuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [isMenuOpen]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const sections = navLinks
      .map((link) => document.querySelector(link.href))
      .filter(Boolean);

    if (!sections.length || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveLink(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleAnchorClick = (event, href) => {
    const target = document.querySelector(href);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setIsMenuOpen(false);

    if (!target || reduceMotion) return;

    event.preventDefault();
    const headerHeight = document.getElementById("site-header")?.offsetHeight || 0;
    const y = target.getBoundingClientRect().top + window.scrollY - headerHeight - 24;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    window.history.pushState(null, "", href);
  };

  return (
    <header id="site-header" className={`site-header${isScrolled ? " scrolled" : ""}${isMenuOpen ? " open" : ""}`}>
      <div className="nav-shell">
        <a className="brand" href="#home" onClick={(event) => handleAnchorClick(event, "#home")} aria-label="Ahmad Caterers">
          <span className="brand-mark">
            <img src={logoImage} alt="" />
          </span>
          <span>
            <strong>Ahmad Caterers</strong>
            <small>Restaurant and catering</small>
          </span>
        </a>
        <nav className={`site-nav${isMenuOpen ? " open" : ""}`} aria-label="Customer website navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              className={activeLink === link.href ? "active" : ""}
              href={link.href}
              onClick={(event) => handleAnchorClick(event, link.href)}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a className="nav-cta" href="#contact" onClick={(event) => handleAnchorClick(event, "#contact")}>
          Book catering
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label="Open customer navigation"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
