import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Hide the initial loader once React has painted the first frame.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const loader = document.getElementById("app-loader");
    if (!loader) return;
    loader.classList.add("is-hidden");
    setTimeout(() => loader.remove(), 400);
  });
});
