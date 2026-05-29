import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ShieldCheck, Utensils } from "../components/icons.jsx";
import FoodCard from "../components/FoodCard.jsx";
import { categoryData } from "../data/categoryData.js";
import { foodData } from "../data/foodData.js";
import { menuService } from "../../services/menuService.js";

export default function Menu() {
  const [params] = useSearchParams();
  const initialCategory = params.get("category") || "All";
  const [activeCategory, setActiveCategory] = useState(categoryData.includes(initialCategory) ? initialCategory : "All");
  const [query, setQuery] = useState("");
  const [foodType, setFoodType] = useState("All");
  const [sortBy, setSortBy] = useState("Popular");
  const [menuItems, setMenuItems] = useState(foodData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const sortMap = {
      Popular: "rating",
      "Price Low to High": "price_asc",
      "Price High to Low": "price_desc"
    };

    setLoading(true);
    setError("");
    menuService
      .getMenuItems({
        category: activeCategory === "All" ? "" : activeCategory,
        foodType: foodType === "All" ? "" : foodType === "Veg" ? "veg" : "nonveg",
        search: query,
        sort: sortMap[sortBy]
      })
      .then((items) => {
        if (!isMounted) return;
        setMenuItems(items.length ? items : []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Unable to load menu right now.");
        setMenuItems(foodData);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCategory, foodType, query, sortBy]);

  const filteredFood = useMemo(
    () => {
      const filtered = menuItems.filter((food) => {
        const matchesCategory = activeCategory === "All" || food.category === activeCategory;
        const matchesType = foodType === "All" || food.foodType === foodType;
        const matchesQuery = `${food.name} ${food.description} ${food.category} ${(food.tags || []).join(" ")}`.toLowerCase().includes(query.toLowerCase());
        return matchesCategory && matchesType && matchesQuery;
      });

      return [...filtered].sort((a, b) => {
        if (sortBy === "Price Low to High") return a.price - b.price;
        if (sortBy === "Price High to Low") return b.price - a.price;
        return b.popularity - a.popularity;
      });
    },
    [activeCategory, foodType, query, sortBy, menuItems]
  );

  return (
    <div className="app-screen">
      <section className="menu-search-card sticky-menu-tools">
        <h1>What would you like to eat?</h1>
        <label className="input-with-icon">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search biryani, starters, desserts..." />
        </label>
      </section>
      <section className="menu-filter-panel">
        <div className="segmented-control three">
          {["All", "Veg", "Non-Veg"].map((type) => (
            <button key={type} type="button" className={foodType === type ? "active" : ""} onClick={() => setFoodType(type)}>
              <ShieldCheck size={15} /> {type}
            </button>
          ))}
        </div>
        <select className="sort-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option>Popular</option>
          <option>Price Low to High</option>
          <option>Price High to Low</option>
        </select>
      </section>
      <div className="category-filter-row">
        {categoryData.map((category) => (
          <button
            key={category}
            className={activeCategory === category ? "active" : ""}
            type="button"
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <section className="food-list-grid">
        {loading ? (
          <div className="app-card empty-order-tab">
            <Utensils size={34} />
            <h2>Loading menu</h2>
            <p>Fetching fresh dishes from the kitchen.</p>
          </div>
        ) : error ? (
          <div className="app-card empty-order-tab">
            <Utensils size={34} />
            <h2>Showing demo menu</h2>
            <p>{error}</p>
          </div>
        ) : filteredFood.length ? (
          filteredFood.map((food) => (
            <FoodCard food={food} key={food.id} />
          ))
        ) : (
          <div className="app-card empty-order-tab">
            <Utensils size={34} />
            <h2>No menu items available</h2>
            <p>Add menu items from admin later.</p>
          </div>
        )}
        {!loading && error && foodData.map((food) => <FoodCard food={food} key={food.id} />)}
      </section>
    </div>
  );
}
