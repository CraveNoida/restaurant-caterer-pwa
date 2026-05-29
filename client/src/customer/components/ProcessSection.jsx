import { processSteps } from "./homeData.js";
import Reveal from "./Reveal.jsx";

export default function ProcessSection() {
  return (
    <section className="section process-section" id="process">
      <div className="container">
        <Reveal className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2>Simple planning from first enquiry to final service.</h2>
        </Reveal>
        <div className="steps">
          {processSteps.map(([number, title, copy], index) => (
            <Reveal as="article" className="step" delay={index * 80} key={title}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
