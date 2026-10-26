"use client";

import { useState } from "react";
import { cafeConfig } from "@/config/cafe";
import { ScrollReveal } from "@/components/ScrollReveal";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function MenuSection() {
  const { menu } = cafeConfig;
  const [activeId, setActiveId] = useState(menu[0]?.id ?? "");

  const active = menu.find((c) => c.id === activeId) ?? menu[0];

  return (
    <ScrollReveal as="section" id="menu" className="section-pad border-t border-white/10">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Menu
          </p>
          <h2 className="font-heading mt-4 text-4xl sm:text-5xl">What we pour</h2>
        </div>

        <div
          className="mt-10 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Menu categories"
        >
          {menu.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={cat.id === activeId}
              aria-controls={`panel-${cat.id}`}
              id={`tab-${cat.id}`}
              onClick={() => setActiveId(cat.id)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                cat.id === activeId
                  ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
                  : "bg-white/5 text-[var(--color-text)] hover:bg-white/10"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {active && (
          <ul
            id={`panel-${active.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${active.id}`}
            className="mt-10 space-y-6"
          >
            {active.items.map((item) => (
              <li
                key={item.name}
                className="flex flex-col gap-1 border-b border-white/10 pb-6 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <div>
                  <h3 className="font-heading text-xl">{item.name}</h3>
                  <p className="mt-1 text-sm text-[var(--color-text)]/75">
                    {item.description}
                  </p>
                </div>
                <p className="font-medium text-[var(--color-accent)] sm:shrink-0 sm:pl-6">
                  {formatPrice(item.price)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ScrollReveal>
  );
}
