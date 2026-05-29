import { testimonials } from "./homeData.js";
import Reveal from "./Reveal.jsx";

export default function TestimonialsSection() {
  return (
    <section className="section testimonial-section" id="testimonials">
      <div className="container split">
        <Reveal className="section-kicker">
          <p className="eyebrow">Testimonials</p>
          <h2>Trusted for family celebrations and business meals.</h2>
        </Reveal>
        {testimonials.map(([quote, name, detail], index) => (
          <Reveal as="article" className="testimonial-card" delay={index * 100} key={name}>
            <p>{quote}</p>
            <strong>{name}</strong>
            <span>{detail}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
