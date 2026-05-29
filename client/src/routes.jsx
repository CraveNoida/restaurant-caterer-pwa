import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import Login from "./auth/Login.jsx";
import Register from "./auth/Register.jsx";
import CustomerLayout from "./customer/layout/CustomerLayout.jsx";
import Splash from "./customer/pages/Splash.jsx";
import Home from "./customer/pages/Home.jsx";
import Menu from "./customer/pages/Menu.jsx";
import FoodDetails from "./customer/pages/FoodDetails.jsx";
import Cart from "./customer/pages/Cart.jsx";
import Checkout from "./customer/pages/Checkout.jsx";
import OrderSuccess from "./customer/pages/OrderSuccess.jsx";
import TrackOrder from "./customer/pages/TrackOrder.jsx";
import MyOrders from "./customer/pages/MyOrders.jsx";
import Catering from "./customer/pages/Catering.jsx";
import CateringBooking from "./customer/pages/CateringBooking.jsx";
import Profile from "./customer/pages/Profile.jsx";
import AdminLayout from "./admin/layout/AdminLayout.jsx";
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import Dashboard from "./admin/pages/Dashboard.jsx";
import Orders from "./admin/pages/Orders.jsx";
import MenuManagement from "./admin/pages/MenuManagement.jsx";
import CateringBookings from "./admin/pages/CateringBookings.jsx";
import Customers from "./admin/pages/Customers.jsx";
import DeliveryBoys from "./admin/pages/DeliveryBoys.jsx";
import Payments from "./admin/pages/Payments.jsx";
import Reports from "./admin/pages/Reports.jsx";
import Settings from "./admin/pages/Settings.jsx";
import DeliveryLayout from "./delivery/layout/DeliveryLayout.jsx";
import DeliveryLogin from "./delivery/pages/DeliveryLogin.jsx";
import DeliveryDashboard from "./delivery/pages/DeliveryDashboard.jsx";
import AssignedOrders from "./delivery/pages/AssignedOrders.jsx";
import DeliveryOrderDetails from "./delivery/pages/DeliveryOrderDetails.jsx";
import CompletedDeliveries from "./delivery/pages/CompletedDeliveries.jsx";
import DeliveryProfile from "./delivery/pages/DeliveryProfile.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/food/:id" element={<FoodDetails />} />
        <Route path="/catering" element={<Catering />} />
        <Route path="/catering-booking" element={<CateringBooking />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/track-order/:id" element={<TrackOrder />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="bookings" element={<CateringBookings />} />
          <Route path="catering-bookings" element={<Navigate to="/admin/bookings" replace />} />
          <Route path="customers" element={<Customers />} />
          <Route path="delivery-boys" element={<DeliveryBoys />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="/delivery/login" element={<DeliveryLogin />} />
      <Route element={<ProtectedRoute allowedRoles={["delivery"]} />}>
        <Route path="/delivery" element={<DeliveryLayout />}>
          <Route index element={<Navigate to="/delivery/dashboard" replace />} />
          <Route path="dashboard" element={<DeliveryDashboard />} />
          <Route path="orders" element={<AssignedOrders />} />
          <Route path="assigned-orders" element={<Navigate to="/delivery/orders" replace />} />
          <Route path="orders/:id" element={<DeliveryOrderDetails />} />
          <Route path="completed" element={<CompletedDeliveries />} />
          <Route path="profile" element={<DeliveryProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
