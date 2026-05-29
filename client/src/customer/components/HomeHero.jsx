import { useEffect, useMemo, useState } from "react";
import { heroHighlights, PHONE_NUMBER, WHATSAPP_NUMBER } from "./homeData.js";
import Reveal from "./Reveal.jsx";

export default function HomeHero() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const isSmall = window.matchMedia("(max-width: 620px)").matches;
    const count = isSmall ? 4 : 9;
    setParticles(
      Array.from({ length: count }, (_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: `${7 + Math.random() * 8}s`,
        opacity: 0.2 + Math.random() * 0.55,
        delay: `${Math.random() * -10}s`
      }))
    );
  }, []);

  const whatsappUrl = useMemo(() => {
    const message = "Hi Ahmad Caterers, I want to place an order or book catering.";
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }, []);

  return (
    <section className="hero" id="home">
      <div className="hero-media" />
      <div className="hero-shade" />
      <div className="hero-particles">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="particle"
            style={{
              left: particle.left,
              top: particle.top,
              "--duration": particle.duration,
              "--opacity": particle.opacity,
              animationDelay: particle.delay
            }}
          />
        ))}
      </div>
      <div className="hero-steam" />
      <div className="hero-reflection" />
      <div className="container hero-grid">
        <Reveal className="hero-copy">
          <p className="eyebrow">Margao, Goa | Restaurant and catering</p>
          <h1>Premium catering and restaurant favourites for every occasion.</h1>
          <p className="hero-text">
            Ahmad Caterers serves memorable wedding feasts, corporate buffets, family functions, party trays, and fresh
            restaurant orders with direct phone, email, and WhatsApp support.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={whatsappUrl} target="_blank" rel="noreferrer">
              WhatsApp enquiry
            </a>
            <a className="btn btn-secondary" href={`tel:${PHONE_NUMBER}`}>
              Call now
            </a>
          </div>
        </Reveal>
        <Reveal className="hero-panel" delay={120}>
          <div className="hero-panel-top">
            <span>Today at Ahmad Caterers</span>
            <strong>Orders, events, and catering bookings handled with care.</strong>
          </div>
          {heroHighlights.map(([number, title, copy]) => (
            <div className="panel-row" key={title}>
              <span>{number}</span>
              <div>
                <strong>{title}</strong>
                <p>{copy}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
