import { services } from "./homeData.js";
import Reveal from "./Reveal.jsx";

export default function ServicesSection() {
  return (
    <section className="section services-section" id="services">
      <div className="container">
        <Reveal className="section-heading">
          <p className="eyebrow">Services</p>
          <h2>Catering, restaurant orders, and event food support.</h2>
          <p>Keep the same Ahmad Caterers experience whether you need a single meal or a full buffet service.</p>
        </Reveal>
        <div className="card-grid">
          {services.map(([number, title, copy], index) => (
            <Reveal as="article" className="service-card" delay={index * 80} key={title}>
              <div className="service-icon">{number}</div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
