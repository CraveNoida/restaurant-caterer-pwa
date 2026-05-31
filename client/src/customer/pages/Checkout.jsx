import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bike,
  CalendarClock,
  Clock,
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
import { paymentService } from "../../services/paymentService.js";
import { formatAccuracy, googleMapsUrl, reverseGeocode } from "../../utils/mapUtils.js";

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, placeOrder, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [errors, setErrors] = useState({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);
  const paymentLockRef = useRef(false);
  const pendingRazorpayOrderRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    houseDetails: "",
    landmark: "",
    deliveryLocation: null,
    fulfillment: "Delivery",
    deliveryTime: "ASAP",
    scheduledTime: "",
    notes: "",
    paymentMethod: "Cash on Delivery",
    transactionId: ""
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
        email: current.email || user.email || "",
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
    if (form.deliveryTime === "Schedule" && !form.scheduledTime) nextErrors.scheduledTime = "Choose a schedule date and time.";
    if (!form.paymentMethod) nextErrors.paymentMethod = "Select a payment method.";
    if (form.paymentMethod === "UPI" && !form.transactionId.trim()) nextErrors.transactionId = "Enter your UPI transaction ID after payment.";

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
          const detectedAddress = await reverseGeocode(coords.latitude, coords.longitude);
          setForm((current) => ({
            ...current,
            address: detectedAddress,
            deliveryLocation
          }));
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

  const verifyRazorpayPayment = (providerOrder, order) => new Promise((resolve, reject) => {
    const key = providerOrder.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (providerOrder.providerOrder.localPlaceholder && !key) {
      paymentService.verify({
        razorpay_order_id: providerOrder.providerOrder.id,
        razorpay_payment_id: `pay_dev_${order.orderId}`,
        razorpay_signature: "local_signature"
      }).then(resolve).catch(reject);
      return;
    }

    if (!key) {
      reject(new Error("Razorpay key is not configured yet. Please choose COD or UPI for now."));
      return;
    }

    const checkout = new window.Razorpay({
      key,
      amount: providerOrder.providerOrder.amount,
      currency: providerOrder.providerOrder.currency || "INR",
      name: "Ahmad Caterers",
      description: `Payment for ${order.orderId}`,
      order_id: providerOrder.providerOrder.id,
      prefill: {
        name: form.name,
        contact: form.phone,
        email: form.email
      },
      handler: async (response) => {
        try {
          await paymentService.verify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          resolve(response);
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: () => {
          reject(new Error("Payment was cancelled. Your order is saved with payment pending."));
        }
      }
    });
    checkout.on?.("payment.failed", () => {
      reject(new Error("Payment failed. Please try again or choose COD/UPI."));
    });
    checkout.open();
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm() || isPlacingOrder || paymentLockRef.current) return;
    if (!isAuthenticated) {
      setErrors({ form: "Please login or register before placing an order." });
      return;
    }

    setIsPlacingOrder(true);
    paymentLockRef.current = true;
    try {
      const isRazorpay = form.paymentMethod === "Razorpay Online";
      const order = isRazorpay && pendingRazorpayOrderRef.current
        ? pendingRazorpayOrderRef.current
        : await placeOrder({
          ...form,
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          houseDetails: form.houseDetails.trim(),
          landmark: form.landmark.trim(),
          deliveryLocation: form.deliveryLocation,
          notes: form.notes.trim(),
          transactionId: form.transactionId.trim(),
          clearCartOnSuccess: !isRazorpay
        });

      if (isRazorpay) {
        pendingRazorpayOrderRef.current = order;
        const providerOrder = await paymentService.createOrder({
          orderId: order.orderId,
          amount: order.totalAmount,
          paymentMethod: "Razorpay"
        });
        if (!providerOrder.providerOrder?.localPlaceholder) {
          const scriptReady = await loadRazorpayScript();
          if (!scriptReady) throw new Error("Could not load Razorpay checkout. Please try again.");
        }
        await verifyRazorpayPayment(providerOrder, order);
        pendingRazorpayOrderRef.current = null;
        clearCart();
      }

      navigate(`/order-success?orderId=${order.orderId}`);
    } catch (error) {
      setErrors({ form: error.message || "Could not place your order. Please try again." });
    } finally {
      setIsPlacingOrder(false);
      paymentLockRef.current = false;
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
          ["Time", CalendarClock],
          ["Payment", CreditCard]
        ].map(([step, Icon], index) => (
          <div className="active" key={step}>
            <span><Icon size={14} /></span>
            <small>{index + 1}. {step}</small>
          </div>
        ))}
      </section>

      <section className="checkout-step app-card form-card">
        <span className="step-label">Step 1</span>
        <h1><UserRound size={22} /> Contact Details</h1>
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
        <label>
          Email optional
          <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
        </label>
      </section>

      <section className="checkout-step app-card form-card">
        <span className="step-label">Step 2</span>
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
            <div className="saved-address-card">
              <strong>Saved address</strong>
              <span>Home address placeholder - add login and backend later.</span>
            </div>
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
                placeholder="Example: Flat 204, 2nd floor"
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
        <span className="step-label">Step 3</span>
        <h2><Clock size={21} /> Delivery Time</h2>
        <div className="segmented-control">
          {["ASAP", "Schedule"].map((option) => (
            <button key={option} type="button" className={form.deliveryTime === option ? "active" : ""} onClick={() => updateField("deliveryTime", option)}>
              <Clock size={17} /> {option}
            </button>
          ))}
        </div>
        {form.deliveryTime === "Schedule" && (
          <label>
            Schedule time
            <input type="datetime-local" value={form.scheduledTime} onChange={(event) => updateField("scheduledTime", event.target.value)} />
            {errors.scheduledTime && <small className="field-error">{errors.scheduledTime}</small>}
          </label>
        )}
        <label>
          Order notes
          <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
        </label>
      </section>

      <section className="checkout-step app-card form-card">
        <span className="step-label">Step 4</span>
        <h2><CreditCard size={21} /> Payment Method</h2>
        {[["Cash on Delivery", Wallet], ["UPI", CreditCard], ["Razorpay Online", CreditCard]].map(([method, Icon]) => (
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
            <small>QR code placeholder will be added when the restaurant shares the final QR.</small>
            <label>
              UPI transaction ID
              <input value={form.transactionId} onChange={(event) => updateField("transactionId", event.target.value)} placeholder="Example: UPI123456789" />
              {errors.transactionId && <small className="field-error">{errors.transactionId}</small>}
            </label>
          </div>
        )}
        {form.paymentMethod === "Razorpay Online" && (
          <div className="payment-instructions">
            <strong>Online payment</strong>
            <span>Place order to open Razorpay checkout securely.</span>
            <small>If the payment is cancelled, the order payment status will be marked failed.</small>
          </div>
        )}
        {errors.paymentMethod && <small className="field-error">{errors.paymentMethod}</small>}
      </section>

      <BillSummary totals={checkoutTotals} />

      <button className="checkout-bottom-bar place-order-bar" type="submit" disabled={isPlacingOrder}>
        <span>
          <small>Payable amount</small>
          <strong>{formatCurrency(checkoutTotals.grandTotal)}</strong>
        </span>
        <em>{isPlacingOrder ? "Processing..." : form.paymentMethod === "Razorpay Online" ? "Pay Online" : "Place Order"} <ArrowRight size={18} /></em>
      </button>
    </form>
  );
}
