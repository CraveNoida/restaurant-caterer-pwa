import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bike,
  CreditCard,
  MapPin,
  PackageCheck,
  UserRound,
  Wallet
} from "../components/icons.jsx";
import { useCart } from "../../context/CartContext.jsx";
import BillSummary from "../components/BillSummary.jsx";
import { calculateCartTotals } from "../../utils/orderUtils.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatAccuracy, googleMapsUrl, reverseGeocode } from "../../utils/mapUtils.js";
import { saveCustomerLocation } from "../../utils/customerLocation.js";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, placeOrder } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [errors, setErrors] = useState({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    houseDetails: "",
    landmark: "",
    deliveryLocation: null,
    rawDetectedAddress: "",
    fulfillment: "Delivery",
    notes: "",
    paymentMethod: "Cash on Delivery"
  });

  useEffect(() => {
    if (user) {
      const defaultAddress = user.addresses?.find((address) => address.isDefault) || user.addresses?.[0];
      const addressText = defaultAddress
        ? [defaultAddress.addressLine, defaultAddress.city, defaultAddress.state, defaultAddress.pincode].filter(Boolean).join(", ")
        : "";
      setForm((current) => ({
        ...current,
        name: current.name || user.name || "",
        phone: current.phone || user.phone || "",
        address: current.address || addressText,
        landmark: current.landmark || defaultAddress?.landmark || ""
      }));
    }
  }, [user]);

  const checkoutTotals = calculateCartTotals(items, { orderType: form.fulfillment });
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const validateForm = () => {
    const nextErrors = {};
    const phoneDigits = form.phone.replace(/\D/g, "").slice(-10);

    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!/^[6-9]\d{9}$/.test(phoneDigits)) nextErrors.phone = "Enter a valid 10 digit Indian mobile number.";
    if (form.fulfillment === "Delivery" && !form.address.trim()) nextErrors.address = "Address is required for delivery.";
    if (!form.paymentMethod) nextErrors.paymentMethod = "Select a payment method.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const useCurrentLocation = () => {
    setErrors((current) => ({ ...current, address: undefined }));
    setLocationNotice(null);

    if (!window.isSecureContext) {
      setErrors((current) => ({
        ...current,
        address: "Unable to detect location. Please try again or enter address manually."
      }));
      return;
    }

    if (!navigator.geolocation) {
      setErrors((current) => ({
        ...current,
        address: "Unable to detect location. Please try again or enter address manually."
      }));
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const deliveryLocation = {
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
          mapsLink: googleMapsUrl({ lat: coords.latitude, lng: coords.longitude })
        };

        setForm((current) => ({ ...current, deliveryLocation }));

        try {
          const detected = await reverseGeocode(coords.latitude, coords.longitude);
          const detectedAddress = typeof detected === "string" ? detected : detected.address;
          const rawDetectedAddress = typeof detected === "string" ? detected : detected.rawAddress;
          setForm((current) => ({
            ...current,
            address: detectedAddress,
            rawDetectedAddress,
            deliveryLocation
          }));
          saveCustomerLocation({ address: detectedAddress, rawDetectedAddress, deliveryLocation });
          setErrors((current) => ({ ...current, address: undefined }));
          setLocationNotice({
            type: "success",
            title: "Address detected",
            message: "Please check and complete your address."
          });
        } catch {
          setErrors((current) => ({
            ...current,
            address: "Location detected, but address could not be found. Please enter address manually."
          }));
          setLocationNotice({
            type: "partial",
            title: "Location detected",
            message: "GPS location saved for delivery"
          });
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        const messages = {
          1: "Location permission denied. Please enter your address manually.",
          2: "Unable to detect location. Please try again or enter address manually.",
          3: "Unable to detect location. Please try again or enter address manually."
        };

        setErrors((current) => ({
          ...current,
          address: messages[error.code] || "Unable to detect location. Please try again or enter address manually."
        }));
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm() || isPlacingOrder) return;
    if (!isAuthenticated) {
      setErrors({ form: "Please login or register before placing an order." });
      return;
    }

    setIsPlacingOrder(true);
    try {
      const order = await placeOrder({
          ...form,
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: user?.email || "",
          address: form.address.trim(),
          houseDetails: form.houseDetails.trim(),
          landmark: form.landmark.trim(),
          deliveryLocation: form.deliveryLocation,
          rawDetectedAddress: form.rawDetectedAddress,
          notes: form.notes.trim(),
          transactionId: "",
          clearCartOnSuccess: true
        });

      navigate(`/order-success?orderId=${order.orderId}`);
    } catch (error) {
      setErrors({ form: error.message || "Could not place your order. Please try again." });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!items.length && !isPlacingOrder) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <form className="app-screen checkout-screen" onSubmit={handleSubmit}>
      {errors.form && (
        <section className="success-banner error-banner">
          <strong>{errors.form}</strong>
          {!isAuthenticated && <span>Use the profile tab to login, then come back to checkout.</span>}
        </section>
      )}
      <section className="checkout-mini-summary app-card">
        <span>{items.length} items</span>
        <strong>Secure local checkout</strong>
        <small>Complete your contact, delivery time, and payment details.</small>
      </section>

      <section className="checkout-progress">
        {[
          ["Contact", UserRound],
          ["Address", MapPin],
          ["Payment", CreditCard]
        ].map(([step, Icon], index) => (
          <div className="active" key={step}>
            <span><Icon size={14} /></span>
            <small>{index + 1}. {step}</small>
          </div>
        ))}
      </section>

      <section className="checkout-step app-card form-card">
        <span className="step-label">Contact</span>
        <h1><UserRound size={22} /> Your Details</h1>
        <label>
          Name
          <input required value={form.name} onChange={(event) => updateField("name", event.target.value)} />
          {errors.name && <small className="field-error">{errors.name}</small>}
        </label>
        <label>
          Phone
          <input required inputMode="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
          {errors.phone && <small className="field-error">{errors.phone}</small>}
        </label>
      </section>

      <section className="checkout-step app-card form-card">
        <span className="step-label">Address</span>
        <h2><MapPin size={21} /> Delivery Details</h2>
        <div className="segmented-control">
          {[["Delivery", Bike], ["Pickup", PackageCheck]].map(([option, Icon]) => (
            <button
              key={option}
              type="button"
              className={form.fulfillment === option ? "active" : ""}
              onClick={() => updateField("fulfillment", option)}
            >
              <Icon size={17} /> {option}
            </button>
          ))}
        </div>
        {form.fulfillment === "Delivery" ? (
          <>
            <label>
              Address
              <small className="field-helper">Please enter your complete address. GPS helps our delivery partner find you faster.</small>
              <textarea
                required
                placeholder="House no., building, street, area"
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
              />
              {errors.address && <small className="field-error">{errors.address}</small>}
            </label>
            <label>
              House / Flat / Floor
              <input
                placeholder="Flat, floor, nearby detail"
                value={form.houseDetails}
                onChange={(event) => updateField("houseDetails", event.target.value)}
              />
            </label>
            <label>
              Landmark
              <input value={form.landmark} onChange={(event) => updateField("landmark", event.target.value)} />
            </label>
            <button
              className="app-button outline full-width"
              type="button"
              onClick={useCurrentLocation}
              disabled={isDetectingLocation}
            >
              <MapPin size={17} /> {isDetectingLocation ? "Detecting location..." : "Detect my location"}
            </button>
            {form.deliveryLocation && (
              <section className="location-detected-card">
                <div>
                  <span>{locationNotice?.title || "Location detected successfully"}</span>
                  <strong>{locationNotice?.message || "GPS location saved for delivery"}</strong>
                  {locationNotice?.type === "success" && <small>Please verify and complete your address</small>}
                  <small>Accuracy: {formatAccuracy(form.deliveryLocation).toLowerCase()}</small>
                </div>
                {form.deliveryLocation.mapsLink && (
                  <a className="app-button outline full-width" href={form.deliveryLocation.mapsLink} target="_blank" rel="noreferrer">Open in Google Maps</a>
                )}
              </section>
            )}
          </>
        ) : (
          <div className="saved-address-card">
            <strong>Pickup from restaurant</strong>
            <span>No delivery address required. We will keep your order ready at the counter.</span>
          </div>
        )}
      </section>

      <section className="checkout-step app-card form-card">
        <span className="step-label">Payment</span>
        <h2><CreditCard size={21} /> Payment Method</h2>
        {[["Cash on Delivery", Wallet], ["UPI", CreditCard]].map(([method, Icon]) => (
          <label className="radio-row" key={method}>
            <input
              type="radio"
              name="paymentMethod"
              checked={form.paymentMethod === method}
              onChange={() => updateField("paymentMethod", method)}
            />
            <Icon size={17} />
            {method}
          </label>
        ))}
        {form.paymentMethod === "UPI" && (
          <div className="payment-instructions">
            <strong>Manual UPI payment</strong>
            <span>Pay to UPI ID: ahmadcaterers@upi</span>
            <small>Keep your UPI confirmation ready. The restaurant may verify it by phone.</small>
          </div>
        )}
        {errors.paymentMethod && <small className="field-error">{errors.paymentMethod}</small>}
        <label>
          Order notes optional
          <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
        </label>
      </section>

      <BillSummary totals={checkoutTotals} />

      <button className="checkout-bottom-bar place-order-bar" type="submit" disabled={isPlacingOrder}>
        <span>
          <small>Payable amount</small>
          <strong>{formatCurrency(checkoutTotals.grandTotal)}</strong>
        </span>
        <em>{isPlacingOrder ? "Processing..." : "Place Order"} <ArrowRight size={18} /></em>
      </button>
    </form>
  );
}
