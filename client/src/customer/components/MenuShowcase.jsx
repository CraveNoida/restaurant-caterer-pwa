import { useState } from "react";
import { menuTabs } from "./homeData.js";
import Reveal from "./Reveal.jsx";

export default function MenuShowcase() {
  const [activeMenu, setActiveMenu] = useState(menuTabs[0].id);

  return (
    <section className="section menu-section" id="menu">
      <div className="container">
        <Reveal className="section-heading">
          <p className="eyebrow">Menu highlights</p>
          <h2>Useful choices for orders and catering enquiries.</h2>
        </Reveal>
        <Reveal>
          <div className="menu-board" role="tablist" aria-label="Menu categories">
            {menuTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`menu-tab${activeMenu === tab.id ? " active" : ""}`}
                onClick={() => setActiveMenu(tab.id)}
                role="tab"
                aria-selected={activeMenu === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="menu-panels">
            {menuTabs.map((tab) => (
              <div key={tab.id} className={`menu-panel${activeMenu === tab.id ? " active" : ""}`} role="tabpanel">
                <div>
                  <h3>{tab.title}</h3>
                  <p>{tab.copy}</p>
                </div>
                <ul>
                  {tab.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
