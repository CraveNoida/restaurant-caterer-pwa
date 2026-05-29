import { useEffect, useRef, useState } from "react";
import { trustStats } from "./homeData.js";

function Counter({ target, suffix }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) {
      setValue(target);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        const start = performance.now();
        const duration = 1500;

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(target * eased));

          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.55 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="stat-number">
      {value}
      {suffix}
    </span>
  );
}

export default function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Ahmad Caterers trust highlights">
      <div className="container trust-grid">
        {trustStats.map((stat) => (
          <div key={stat.label}>
            <strong>
              <Counter target={stat.target} suffix={stat.suffix} />
              {stat.label}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}
