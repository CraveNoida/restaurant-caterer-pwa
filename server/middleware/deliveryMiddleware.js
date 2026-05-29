export function requireDelivery(req, res, next) {
  if (req.user?.role !== "delivery") {
    return res.status(403).json({ message: "Delivery access required" });
  }

  return next();
}
