export function generateBookingId() {
  const date = new Date();
  const datePart = date.toISOString().slice(2, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `BK-${datePart}-${randomPart}`;
}
