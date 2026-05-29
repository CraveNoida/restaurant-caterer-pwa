import { clientTags } from "./homeData.js";
import Reveal from "./Reveal.jsx";

export default function AboutSection() {
  return (
    <section className="section about-section" id="about">
      <div className="container split">
        <Reveal className="section-heading">
          <p className="eyebrow">About Ahmad Caterers</p>
          <h2>Restaurant flavour with full event-service discipline.</h2>
        </Reveal>
        <Reveal className="body-copy" delay={100}>
          <p>
            Ahmad Caterers brings together fresh cooking, dependable service, and thoughtful presentation for customers
            across Margao, Goa.
          </p>
          <p>
            From daily restaurant orders to weddings, office lunches, and private parties, every enquiry is handled with
            clear coordination and practical menu planning.
          </p>
          <div className="chef-note">
            <span>Chef note</span>
            <strong>Menus are planned around guest count, occasion, timing, and the way the food should be served.</strong>
          </div>
          <div className="client-row">
            {clientTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
