import { useMemo, useRef, useEffect, useState } from "react";
import "./CategoryShop.css";

/* ------------------------------------------------------------------
   Demo data – replace with your Supabase `categories` / `products`.
   product: { id, name, cat, price, brand, compat, inStock, createdAt }
------------------------------------------------------------------- */
const CATEGORIES = [
  { slug: "gaming", label: "Gaming Accessories", image: "/assets/cat/gaming.jpg" },
  { slug: "mobile", label: "Mobile Accessories", image: "/assets/cat/mobile.jpg" },
  { slug: "computer", label: "Computer & Laptop", image: "/assets/cat/computer.jpg" },
  { slug: "gadgets", label: "Gadgets", image: "/assets/cat/gadgets.jpg" },
  { slug: "cleaning", label: "Cleaning & Care", image: "/assets/cat/cleaning.jpg" },
  { slug: "lighting", label: "Lighting", image: "/assets/cat/lighting.jpg" },
];

const PRODUCTS = [
  { id: 1, name: "RGB Mechanical Keyboard", cat: "gaming", price: 12900, brand: "Redragon", compat: "PC", inStock: true, createdAt: "2026-10-01" },
  { id: 2, name: "Wireless Gaming Mouse", cat: "gaming", price: 7500, brand: "Logitech", compat: "PC", inStock: true, createdAt: "2026-09-12" },
  { id: 3, name: "65W Fast Charger", cat: "mobile", price: 4200, brand: "Baseus", compat: "Android", inStock: false, createdAt: "2026-08-20" },
  { id: 4, name: "Screen Cleaning Kit", cat: "cleaning", price: 1250, brand: "Generic", compat: "Any", inStock: true, createdAt: "2026-10-10" },
];

const SORTS = {
  featured: () => 0,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
};

const lkr = (n) => "LKR " + n.toLocaleString("en-LK");
const plural = (n) => `${n} ${n === 1 ? "Product" : "Products"}`;

const BoxIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
    <path d="M3 8l9 5 9-5M12 13v8" />
  </svg>
);

const EMPTY_FILTERS = { sort: "featured", min: "", max: "", brand: "", compat: "", stockOnly: false };

export default function CategoryShop({ categories = CATEGORIES, products = PRODUCTS }) {
  // null  -> Home view (category grid only, NO products)
  // slug  -> Category view
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const activeChip = useRef(null);
  const topRef = useRef(null);

  const counts = useMemo(() => {
    const c = {};
    products.forEach((p) => (c[p.cat] = (c[p.cat] || 0) + 1));
    return c;
  }, [products]);

  const current = categories.find((c) => c.slug === selectedCategory) || null;
  const inCategory = products.filter((p) => p.cat === selectedCategory);

  const brands = useMemo(() => [...new Set(inCategory.map((p) => p.brand))].sort(), [inCategory]);
  const compats = useMemo(() => [...new Set(inCategory.map((p) => p.compat))].sort(), [inCategory]);

  const visible = useMemo(() => {
    const min = filters.min === "" ? 0 : Number(filters.min);
    const max = filters.max === "" ? Infinity : Number(filters.max);
    return inCategory
      .filter((p) => p.price >= min && p.price <= max)
      .filter((p) => !filters.brand || p.brand === filters.brand)
      .filter((p) => !filters.compat || p.compat === filters.compat)
      .filter((p) => !filters.stockOnly || p.inStock)
      .sort(SORTS[filters.sort]);
  }, [inCategory, filters]);

  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));

  const open = (slug) => {
    setSelectedCategory(slug);
    setFilters(EMPTY_FILTERS); // each category starts clean
  };
  const back = () => {
    setSelectedCategory(null); // reset -> Home grid
    setFilters(EMPTY_FILTERS);
  };

  // keep the active pill visible in the horizontal slider + jump to top
  useEffect(() => {
    activeChip.current?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    topRef.current?.scrollIntoView({ block: "start" });
  }, [selectedCategory]);

  // browser Back button support
  useEffect(() => {
    const onPop = (e) => setSelectedCategory(e.state?.cat ?? null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const go = (slug) => {
    window.history.pushState({ cat: slug }, "", slug ? `#c-${slug}` : "#shop");
    slug ? open(slug) : back();
  };

  return (
    <section className="cs" ref={topRef} aria-label="Shop">
      {/* ───────── HOME VIEW: categories only ───────── */}
      {!current && (
        <div className="cs-home">
          <header className="cs-head">
            <h2>
              <i className="cs-slash" aria-hidden="true" />
              Shop by <em>Category</em>
            </h2>
          </header>

          <div className="cs-grid">
            {categories.map((c) => (
              <button key={c.slug} type="button" className="cs-card" onClick={() => go(c.slug)}>
                <span className="cs-art">
                  {c.image ? <img src={c.image} alt="" loading="lazy" /> : <BoxIcon />}
                </span>
                <span className="cs-meta">
                  <span className="cs-ic"><BoxIcon /></span>
                  <span className="cs-txt">
                    <span className="cs-name">{c.label}</span>
                    <span className="cs-n">{plural(counts[c.slug] || 0)}</span>
                  </span>
                  <span className="cs-go" aria-hidden="true">›</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ───────── CATEGORY VIEW ───────── */}
      {current && (
        <div className="cs-cat">
          <div className="cs-banner">
            <div className="cs-top">
              <button type="button" className="cs-back" onClick={() => go(null)}>
                ‹ All categories
              </button>
              <h2 className="cs-title">
                {current.label}
                <span className="cs-count" aria-live="polite">
                  {" "}– {plural(visible.length).toLowerCase()}
                </span>
              </h2>
            </div>

            <div className="cs-pills" role="tablist" aria-label="Switch category">
              {categories.map((c) => {
                const on = c.slug === selectedCategory;
                return (
                  <button
                    key={c.slug}
                    ref={on ? activeChip : null}
                    role="tab"
                    aria-selected={on}
                    className={"cs-pill" + (on ? " on" : "")}
                    onClick={() => go(c.slug)}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter & sort bar */}
          <div className="cs-filters" role="group" aria-label="Filter and sort">
            <label className="cs-f">
              Sort
              <select value={filters.sort} onChange={(e) => set({ sort: e.target.value })}>
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="newest">Newest</option>
              </select>
            </label>

            <div className="cs-f">
              Price (LKR)
              <input type="number" min="0" inputMode="numeric" placeholder="Min" aria-label="Minimum price"
                value={filters.min} onChange={(e) => set({ min: e.target.value })} />
              <span aria-hidden="true">–</span>
              <input type="number" min="0" inputMode="numeric" placeholder="Max" aria-label="Maximum price"
                value={filters.max} onChange={(e) => set({ max: e.target.value })} />
            </div>

            <label className="cs-f">
              Brand
              <select value={filters.brand} onChange={(e) => set({ brand: e.target.value })}>
                <option value="">All brands</option>
                {brands.map((b) => <option key={b}>{b}</option>)}
              </select>
            </label>

            <label className="cs-f">
              Compatible with
              <select value={filters.compat} onChange={(e) => set({ compat: e.target.value })}>
                <option value="">Any</option>
                {compats.map((b) => <option key={b}>{b}</option>)}
              </select>
            </label>

            <label className="cs-f cs-check">
              <input type="checkbox" checked={filters.stockOnly}
                onChange={(e) => set({ stockOnly: e.target.checked })} />
              In stock only
            </label>

            <button type="button" className="cs-reset" onClick={() => setFilters(EMPTY_FILTERS)}>
              Reset
            </button>
          </div>

          {/* Products */}
          {visible.length ? (
            <ul className="cs-products">
              {visible.map((p) => (
                <li key={p.id} className="cs-product">
                  <span className={"cs-stock " + (p.inStock ? "in" : "out")}>
                    {p.inStock ? "In stock" : "Out of stock"}
                  </span>
                  <h3>{p.name}</h3>
                  <p className="cs-meta2">{p.brand} · {p.compat}</p>
                  <strong>{lkr(p.price)}</strong>
                  <button type="button" disabled={!p.inStock}>
                    {p.inStock ? "Add to cart" : "Notify me"}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="cs-empty">
              <p>No products match these filters.</p>
              <button type="button" onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
