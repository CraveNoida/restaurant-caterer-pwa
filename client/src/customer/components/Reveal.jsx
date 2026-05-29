import { useEffect, useRef } from "react";

export default function Reveal({ as: Element = "div", className = "", delay = 0, children, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    node.style.setProperty("--reveal-delay", `${delay}ms`);

    if (!("IntersectionObserver" in window)) {
      node.classList.add("visible");
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -70px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Element ref={ref} className={`reveal ${className}`.trim()} {...props}>
      {children}
    </Element>
  );
}
