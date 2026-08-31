import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import "./styles/index.css";

// This experience is a single scroll-driven timeline starting at Earth, not
// something a mid-page reload should resume - without this, refreshing while
// scrolled into India restores that scroll offset before the intro/GSAP setup
// runs, so the pinned scene starts out of view until the next scroll event.
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);