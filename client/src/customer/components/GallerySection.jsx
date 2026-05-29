import { galleryItems } from "./homeData.js";
import Reveal from "./Reveal.jsx";

export default function GallerySection() {
  return (
    <section className="section gallery-section" id="gallery">
      <div className="container">
        <Reveal className="section-heading">
          <p className="eyebrow">Gallery</p>
          <h2>Food, service, and event-ready presentation.</h2>
        </Reveal>
        <div className="gallery-grid">
          {galleryItems.map((item, index) => (
            <Reveal as="figure" delay={index * 70} key={item.caption}>
              <img src={item.image} alt={item.caption} />
              <figcaption>{item.caption}</figcaption>
            </Reveal>
          ))}
          <Reveal className="quote-card">
            <blockquote>Food that arrives with warmth, polish, and the comfort of a well-planned event.</blockquote>
            <a href="#contact">Plan your menu</a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
