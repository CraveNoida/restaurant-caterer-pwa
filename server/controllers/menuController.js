import MenuItem from "../models/MenuItem.js";

function buildMenuQuery(query) {
  const filter = {};

  if (query.category) filter.category = query.category;
  if (query.foodType) filter.foodType = query.foodType;
  if (query.isAvailable !== undefined) filter.isAvailable = query.isAvailable === "true";
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
      { tags: { $regex: query.search, $options: "i" } }
    ];
  }

  return filter;
}

function buildSort(sort) {
  const options = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
    newest: { createdAt: -1 },
    name: { name: 1 }
  };

  return options[sort] || { createdAt: -1 };
}

export async function getMenuItems(req, res, next) {
  try {
    const items = await MenuItem.find(buildMenuQuery(req.query)).sort(buildSort(req.query.sort));
    return res.json({ count: items.length, items });
  } catch (error) {
    return next(error);
  }
}

export async function getMenuItemById(req, res, next) {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    return res.json({ item });
  } catch (error) {
    return next(error);
  }
}

export async function createMenuItem(req, res, next) {
  try {
    const { name, price, category, foodType } = req.body;
    if (!name || price === undefined || !category || !foodType) {
      return res.status(400).json({ message: "Name, price, category, and foodType are required" });
    }

    const item = await MenuItem.create(req.body);
    return res.status(201).json({ item });
  } catch (error) {
    return next(error);
  }
}

export async function updateMenuItem(req, res, next) {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true
    });

    if (!item) return res.status(404).json({ message: "Menu item not found" });
    return res.json({ item });
  } catch (error) {
    return next(error);
  }
}

export async function deleteMenuItem(req, res, next) {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    return res.json({ message: "Menu item deleted" });
  } catch (error) {
    return next(error);
  }
}
