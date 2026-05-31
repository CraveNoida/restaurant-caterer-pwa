import { getFromLocalStorage, saveToLocalStorage } from "./storageUtils.js";

export const CUSTOMER_LOCATION_KEY = "ahmad_customer_delivery_location";

export function formatSavedAddress(address = {}) {
  if (typeof address === "string") return address;
  return [address.addressLine, address.city, address.state, address.pincode, address.country].filter(Boolean).join(", ");
}

export function getDefaultCustomerLocation(user) {
  const savedLocation = getFromLocalStorage(CUSTOMER_LOCATION_KEY, null);
  if (savedLocation?.address) return savedLocation.address;

  const defaultAddress = user?.addresses?.find((address) => address.isDefault) || user?.addresses?.[0];
  return formatSavedAddress(defaultAddress) || "";
}

export function saveCustomerLocation(payload) {
  saveToLocalStorage(CUSTOMER_LOCATION_KEY, payload);
  window.dispatchEvent(new CustomEvent("customer-location-updated", { detail: payload }));
}
