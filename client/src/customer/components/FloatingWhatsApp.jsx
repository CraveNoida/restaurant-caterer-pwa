import { WHATSAPP_NUMBER } from "./homeData.js";
import { MessageCircle } from "./icons.jsx";

export default function FloatingWhatsApp() {
  const message = "Hi Ahmad Caterers, I want to place an order or book catering.";

  return (
    <a
      className="app-whatsapp"
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Ahmad Caterers on WhatsApp"
    >
      <MessageCircle size={24} />
    </a>
  );
}
