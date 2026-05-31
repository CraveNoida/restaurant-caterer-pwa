import { useEffect, useMemo, useState } from "react";
import { adminOrderService, adminService } from "../../services/adminService.js";
import { AdminPageState, StatusBadge, dateTime, money, orderStatuses } from "./adminUtils.jsx";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import AdminToast from "../components/AdminToast.jsx";
import { joinOrderTracking } from "../../services/socketService.js";
import { LiveTrackingMap } from "../../components/maps/index.js";
import { googleMapsRouteUrl, googleMapsUrl } from "../../utils/mapUtils.js";
import { DetailDrawer, FilterChips, InfoGrid, PageHeader, SearchInput } from "../components/AdminUI.jsx";

const nextStatus = {
  placed: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: "out_for_delivery",
  out_for_delivery: "delivered"
};

function trackingTime(value) {
  if (!value) return "No location yet";
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 10) return "Updated just now";
  if (seconds < 60) return `Updated ${seconds} seconds ago`;
  return `Updated ${Math.round(seconds / 60)} minutes ago`;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState(null);
  const [pendingCancel, setPendingCancel] = useState(null);
  const [selectedTracking, setSelectedTracking] = useState(null);
  const [trackingError, setTrackingError] = useState("");
  const [socketOnline, setSocketOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = () => {
    setLoading(true);
    Promise.all([adminOrderService.list(), adminService.deliveryBoys()])
      .then(([orderData, deliveryData]) => {
        setOrders(orderData.orders || []);
        setDeliveryBoys(deliveryData.deliveryBoys || []);
      })
      .catch((err) => setError(err.message || "Unable to load orders."))
      .finally(() => setLoading(false));
  };

  useEffect(loadOrders, []);

  useEffect(() => {
    if (!selected?.orderId) {
      setSelectedTracking(null);
      return undefined;
    }

    setSelectedTracking({
      orderId: selected.orderId,
      deliveryLocation: selected.deliveryLocation,
      deliveryTracking: selected.deliveryTracking
    });
    setTrackingError("");

    const session = joinOrderTracking(selected.orderId, "admin", {
      onLocation: (payload) => setSelectedTracking(payload),
      onError: (message) => setTrackingError(message),
      onConnect: () => setSocketOnline(true),
      onDisconnect: () => setSocketOnline(false)
    });

    return () => session?.cleanup();
  }, [selected?.orderId]);

  const filtered = useMemo(() => orders.filter((order) => {
    const haystack = `${order.orderId} ${order.customerName} ${order.customerPhone}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (!status || order.orderStatus === status);
  }), [orders, query, status]);

  const updateStatus = async (order, orderStatus) => {
    const data = await adminOrderService.updateStatus(order._id, orderStatus);
    setOrders((current) => current.map((item) => item._id === order._id ? data.order : item));
    setSelected(data.order);
    setToast({ message: `Order ${order.orderId} updated.` });
  };

  const assignDelivery = async (order, deliveryBoyId) => {
    if (!deliveryBoyId) return;
    const data = await adminOrderService.assignDelivery(order._id, deliveryBoyId);
    setOrders((current) => current.map((item) => item._id === order._id ? data.order : item));
    setSelected(data.order);
    setToast({ message: `Delivery assigned for ${order.orderId}.` });
  };

  const cancelOrder = async () => {
    if (!pendingCancel) return;
    try {
      await updateStatus(pendingCancel, "cancelled");
      setToast({ message: `Order ${pendingCancel.orderId} cancelled.` });
    } catch (error) {
      setToast({ type: "error", message: error.message || "Could not cancel order." });
    } finally {
      setPendingCancel(null);
    }
  };

  const state = <AdminPageState loading={loading} error={error} empty={!filtered.length} emptyText="No orders match your filters." />;
  if (loading || error) return state;
  const selectedLocation = selectedTracking?.deliveryLocation || selected?.deliveryLocation;
  const selectedCustomerLocation = selected?.customerLocation;
  const selectedTrackingInfo = selectedTracking?.deliveryTracking || selected?.deliveryTracking || {};
  const selectedLocationUrl = googleMapsUrl(selectedLocation);
  const selectedCustomerLocationUrl = googleMapsRouteUrl(selectedCustomerLocation);

  return (
    <section className="admin-page">
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <PageHeader title="Orders" subtitle="Manage live and past customer orders, delivery assignment, and customer communication." eyebrow="Order desk" />
      <div className="admin-toolbar">
        <SearchInput placeholder="Search order ID, customer, or phone" value={query} onChange={(event) => setQuery(event.target.value)} />
        <FilterChips options={orderStatuses} value={status} onChange={setStatus} />
      </div>
      {!filtered.length ? state : (
        <div className="admin-order-list">
          {filtered.map((order) => (
            <article className="admin-list-card" key={order._id}>
              <div>
                <h3>{order.orderId}</h3>
                <p>{order.customerName} - <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a></p>
                <small>{dateTime(order.createdAt)} - {order.items?.length || 0} items</small>
              </div>
              <strong>{money(order.totalAmount)}</strong>
              <StatusBadge value={order.paymentStatus || "pending"} />
              <StatusBadge value={order.orderStatus} />
              <div className="admin-row-actions">
                <button type="button" onClick={() => setSelected(order)}>View</button>
                {nextStatus[order.orderStatus] && <button type="button" onClick={() => updateStatus(order, nextStatus[order.orderStatus])}>Update</button>}
                <a href={`tel:${order.customerPhone}`}>Call</a>
                <a href={`https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(`Hi, update for order ${order.orderId}`)}`} target="_blank" rel="noreferrer">WhatsApp</a>
              </div>
            </article>
          ))}
        </div>
      )}
      {selected && (
        <DetailDrawer title={selected.orderId} subtitle={selected.deliveryAddress || "Pickup order"} onClose={() => setSelected(null)}>
          <InfoGrid items={[
            ["Customer", selected.customerName],
            ["Phone", <a href={`tel:${selected.customerPhone}`}>{selected.customerPhone}</a>],
            ["Total", money(selected.totalAmount)],
            ["Payment", <StatusBadge value={selected.paymentStatus || "pending"} />],
            ["Order status", <StatusBadge value={selected.orderStatus} />],
            ["Address", `${selected.deliveryAddress || "Pickup"} ${selected.houseDetails || ""} ${selected.landmark || ""}`]
          ]} />
          <h3>Items</h3>
          <div className="admin-list">{selected.items?.map((item) => <span key={`${item.name}-${item.quantity}`}>{item.quantity} x {item.name} - {money(item.price * item.quantity)}</span>)}</div>
          <div className="admin-tracking-card">
            <div>
              <span>Delivery live location</span>
              <strong>{selectedTrackingInfo.isLive ? "Live tracking active" : selectedLocation ? "Last known location" : "Waiting for location"}</strong>
              <small>{trackingTime(selectedLocation?.updatedAt || selectedTrackingInfo.lastUpdatedAt)}</small>
              {!socketOnline && <small>Realtime connection reconnecting</small>}
              {trackingError && <small>{trackingError}</small>}
            </div>
            <LiveTrackingMap
              className="admin-map-card"
              customerLocation={selectedCustomerLocation}
              deliveryLocation={selectedLocation}
              height={220}
              subtitle={selectedCustomerLocation || selectedLocation ? "Customer and delivery location" : "No location shared yet"}
              title="Order tracking map"
            />
            <div className="admin-map-actions">
              {selectedCustomerLocationUrl && <a href={selectedCustomerLocationUrl} target="_blank" rel="noreferrer">Open Customer Location in Maps</a>}
              {selectedLocationUrl && <a href={selectedLocationUrl} target="_blank" rel="noreferrer">Open delivery location</a>}
              {!selectedCustomerLocationUrl && !selectedLocationUrl && <span>No map link yet</span>}
            </div>
          </div>
          <div className="admin-inline-fields">
            <select value={selected.orderStatus} onChange={(event) => updateStatus(selected, event.target.value)}>{orderStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <select defaultValue="" onChange={(event) => assignDelivery(selected, event.target.value)}>
              <option value="">Assign delivery boy</option>
              {deliveryBoys.map((boy) => <option key={boy._id} value={boy._id}>{boy.name || boy.user?.name}</option>)}
            </select>
            {selected.orderStatus !== "cancelled" && selected.orderStatus !== "delivered" && <button type="button" className="danger" onClick={() => setPendingCancel(selected)}>Cancel order</button>}
            <button type="button" disabled>Print bill</button>
          </div>
        </DetailDrawer>
      )}
      <ConfirmationModal
        actionLabel="Cancel order"
        body={`Cancel order ${pendingCancel?.orderId || ""}? This action updates the customer order status to cancelled.`}
        isOpen={Boolean(pendingCancel)}
        onClose={() => setPendingCancel(null)}
        onConfirm={cancelOrder}
        title="Cancel order"
      />
    </section>
  );
}
