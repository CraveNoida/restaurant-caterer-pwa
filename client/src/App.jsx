import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import PwaManifestManager from "./components/PwaManifestManager.jsx";
import PwaInstallPrompt from "./components/PwaInstallPrompt.jsx";
import AppRoutes from "./routes.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <PwaManifestManager />
          <PwaInstallPrompt />
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
