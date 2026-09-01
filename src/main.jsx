import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./app/App";
import { ProjectPage } from "./components/projects/ProjectPage";
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
    <BrowserRouter>
      <Routes>
        {/*
          ProjectPage is a nested route on the same "/" element so App
          (and everything inside it - the Mapbox map, the Three.js scene,
          the current phase/camera) stays mounted the whole time a
          project page is open, rendered as an <Outlet /> overlay on top
          instead of replacing App.
        */}
        <Route path="/" element={<App />}>
          <Route path="projects/:id" element={<ProjectPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);