import { WHATSAPP_NUMBER } from "./homeData.js";
import { MessageCircle } from "./icons.jsx";

export default function WhatsAppButton({ message = "Hi Ahmad Caterers, I need help.", children = "WhatsApp" }) {
  return (
    <a className="app-button outline" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">
      <MessageCircle size={18} /> {children}
    </a>
  );
}
