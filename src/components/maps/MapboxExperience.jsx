import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  cities,
  indiaLocations,
} from "../../data/cities";

import {
  getProjectsByCity,
} from "../../data/projects";

import { useSceneStore } from "../../store/sceneStore";

import {
  transitionController,
} from "../../animations/transitions/TransitionController";

import {
  PARALLAX,
} from "../../animations/transitions/cameraPaths";

const TOKEN =
  import.meta.env.VITE_MAP_TOKEN;

const STYLE_URL =
  import.meta.env.VITE_MAP_STYLE_URL ||
  "mapbox://styles/mapbox/dark-v11";

const INDIA_VIEW = {
  center: [79.5, 15.5],
  zoom: 4.3,
  pitch: 15,
  bearing: 0,
};

const CITY_ZOOM = {
  zoom: 12.2,
  pitch: 58,
  bearingOffset: -26,
};

function createMarkerEl(kind, label) {
  const el =
    document.createElement("button");

  el.type = "button";

  el.className =
    `map-marker map-marker--${kind}`;

  const pin = `
    <span class="map-marker__pin">
      <svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1C6.48 1 2 5.48 2 11c0 7.5 10 19 10 19s10-11.5 10-19c0-5.52-4.48-10-10-10z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
        <circle cx="12" cy="11" r="4" stroke="currentColor" stroke-width="1.6"/>
      </svg>
    </span>
    <span class="map-marker__pin-base"></span>
  `;

  el.innerHTML = label
    ? `
      ${pin}
      <span class="map-marker__label">
        ${label}
      </span>
    `
    : pin;

  return el;
}

function projectPopupHtml(project) {
  return `
    <div class="map-popup">
      <div class="map-popup__eyebrow">
        ${project.category}
      </div>

      <div class="map-popup__title">
        ${project.name}
      </div>
    </div>
  `;
}

/*
 * Full-screen India fallback.
 *
 * This is used until Mapbox token is added.
 */
function IndiaFallback() {
  const progress =
    useSceneStore((s) => s.progress);

  const phase =
    useSceneStore((s) => s.phase);

  const city =
    useSceneStore((s) => s.city);

  const active =
    phase === "india" ||
    phase === "city" ||
    phase === "project";

  /*
   * India map opacity during transition.
   */
  const transitionProgress =
    Math.min(
      1,
      Math.max(
        0,
        (progress - 0.30) /
          0.28
      )
    );

  const opacity =
    active
      ? 1
      : phase === "india-transition"
        ? transitionProgress
        : 0;

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#070a0e]"
      style={{
        opacity,
        transition:
          "opacity 700ms ease",
      }}
    >
      {/* subtle map grid */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(255,255,255,0.08) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.08) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* atmospheric glow */}
      <div className="absolute left-1/2 top-1/2 h-[65vw] w-[65vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.025] blur-3xl" />

      {/* India */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 600 700"
          className="h-[78vh] w-[min(70vw,600px)] max-w-[90vw]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter
              id="indiaGlow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur
                stdDeviation="8"
                result="blur"
              />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/*
           * Stylized India silhouette.
           * Replace with exact boundary SVG later.
           */}
          <path
            d="
              M250 35
              L295 62
              L320 100
              L350 125
              L382 160
              L405 205
              L435 230
              L425 270
              L455 305
              L430 345
              L445 385
              L420 415
              L395 450
              L380 495
              L350 540
              L325 590
              L300 655
              L275 610
              L250 565
              L220 525
              L195 480
              L165 450
              L145 405
              L115 370
              L135 335
              L115 300
              L145 265
              L130 225
              L165 190
              L175 145
              L210 120
              L225 80
              Z
            "
            fill="rgba(255,255,255,0.035)"
            stroke="rgba(255,255,255,0.52)"
            strokeWidth="2"
            filter="url(#indiaGlow)"
          />

          <path
            d="
              M250 35
              L295 62
              L320 100
              L350 125
              L382 160
              L405 205
              L435 230
              L425 270
              L455 305
              L430 345
              L445 385
              L420 415
              L395 450
              L380 495
              L350 540
              L325 590
              L300 655
              L275 610
              L250 565
              L220 525
              L195 480
              L165 450
              L145 405
              L115 370
              L135 335
              L115 300
              L145 265
              L130 225
              L165 190
              L175 145
              L210 120
              L225 80
              Z
            "
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* locations */}
      {indiaLocations.map(
        (location) => {
          const positions = {
            mumbai: {
              left: "37%",
              top: "61%",
            },

            bangalore: {
              left: "48%",
              top: "72%",
            },

            chennai: {
              left: "56%",
              top: "73%",
            },
          };

          const position =
            positions[
              location.id
            ] || {
              left: "50%",
              top: "50%",
            };

          const selected =
            city === location.id;

          return (
            <button
              key={location.id}
              type="button"
              onClick={() =>
                transitionController.goToCity(
                  location.id
                )
              }
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{
                left:
                  position.left,
                top:
                  position.top,
              }}
            >
              <span
                className={`
                  relative block h-4 w-4
                  rounded-full border
                  transition-all duration-500
                  ${
                    selected
                      ? "scale-125 border-white bg-white"
                      : "border-white/70 bg-white/80"
                  }
                `}
              >
                <span className="absolute -inset-3 animate-ping rounded-full border border-white/20" />
              </span>

              <span
                className={`
                  absolute left-6 top-1/2
                  -translate-y-1/2
                  whitespace-nowrap
                  text-[9px]
                  uppercase
                  tracking-[0.3em]
                  transition-opacity
                  ${
                    phase === "india"
                      ? "opacity-100"
                      : "opacity-70"
                  }
                `}
              >
                {location.name}
              </span>
            </button>
          );
        }
      )}

      <div className="absolute bottom-10 left-6 md:left-12">
        <p className="text-[9px] uppercase tracking-[0.4em] text-white/30">
          India / Project Atlas
        </p>

        <p className="mt-3 text-2xl font-light tracking-[-0.04em] md:text-4xl">
          Across India.
        </p>
      </div>
    </div>
  );
}

export function MapboxExperience() {
  const containerRef =
    useRef(null);

  const mapRef =
    useRef(null);

  const loadedRef =
    useRef(false);

  const cityMarkersRef =
    useRef([]);

  const projectMarkersRef =
    useRef([]);

  const popupRef =
    useRef(null);

  const phase =
    useSceneStore((s) => s.phase);

  const flyingRef =
    useRef(false);

  const cutTimersRef =
    useRef([]);

  const prevPhaseRef =
    useRef(phase);

  const city =
    useSceneStore((s) => s.city);

  const highlightedMarker =
    useSceneStore(
      (s) => s.highlightedMarker
    );

  const selectedProject =
    useSceneStore(
      (s) => s.selectedProject
    );

  /*
   * Map becomes active during the transition.
   */
  const active =
    phase === "india-transition" ||
    phase === "india" ||
    phase === "city" ||
    phase === "project";

  /*
   * Cursor parallax - a subtle mouse-tracked pan on the map container
   * itself (CSS transform, not the map's real camera) so both the India
   * and city views feel alive without touching Mapbox's own move/click
   * math. The container is oversized via CSS so the translated edges
   * never reveal empty space behind it.
   */
  const parallaxTarget = useRef({ x: 0, y: 0 });
  const parallaxCurrent = useRef({ x: 0, y: 0 });
  const parallaxActiveRef = useRef(false);

  parallaxActiveRef.current =
    phase === "india" ||
    phase === "city" ||
    phase === "project";

  useEffect(() => {
    const onMove = (event) => {
      if (!parallaxActiveRef.current) return;

      parallaxTarget.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () =>
      window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const MAX_OFFSET = 16;
    let frame;

    const tick = () => {
      const target = parallaxActiveRef.current
        ? parallaxTarget.current
        : { x: 0, y: 0 };

      parallaxCurrent.current.x +=
        (target.x - parallaxCurrent.current.x) * 0.045;

      parallaxCurrent.current.y +=
        (target.y - parallaxCurrent.current.y) * 0.045;

      if (containerRef.current) {
        const tx = -parallaxCurrent.current.x * MAX_OFFSET;
        const ty = -parallaxCurrent.current.y * MAX_OFFSET;
        containerRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  /*
   * If there is no token, use the fallback.
   */
  useEffect(() => {
    if (
      !TOKEN ||
      !containerRef.current ||
      mapRef.current
    ) {
      return;
    }

    mapboxgl.accessToken =
      TOKEN;

    const map =
      new mapboxgl.Map({
        container:
          containerRef.current,

        style: STYLE_URL,

        center:
          INDIA_VIEW.center,

        zoom:
          INDIA_VIEW.zoom,

        pitch:
          INDIA_VIEW.pitch,

        bearing:
          INDIA_VIEW.bearing,

        attributionControl:
          false,

        /*
         * Keep the India-scale tiles cached in memory while zoomed into
         * a city, instead of the default cache evicting them - without
         * this, flying back to India has to re-fetch/re-decode tiles
         * from the network, which is what was showing up as lag on the
         * way back.
         */
        maxTileCacheSize: 120,

        /*
         * Mapbox's default scroll-zoom anchors to the cursor position,
         * so anything not exactly under the mouse visibly drifts while
         * zooming (the city marker you're hovering near looks "fixed",
         * everything else looks like it's moving). Anchoring to the
         * view's center instead makes zooming predictable/symmetric
         * around the city marker that's actually there after the cut.
         */
        scrollZoom: {
          around: "center",
        },
      });

    mapRef.current = map;

    /*
     * Explicit hover tracking (rather than resolving each wheel event's
     * target) so the page-navigation snap controller can reliably tell
     * when the pointer is over the live map and hand scroll/zoom over
     * to Mapbox's own handling instead of intercepting it.
     */
    const handlePointerEnter = () =>
      useSceneStore
        .getState()
        .setIsPointerOverMap(true);

    const handlePointerLeave = () =>
      useSceneStore
        .getState()
        .setIsPointerOverMap(false);

    containerRef.current.addEventListener(
      "pointerenter",
      handlePointerEnter
    );

    containerRef.current.addEventListener(
      "pointerleave",
      handlePointerLeave
    );

    map.on(
      "movestart",
      () =>
        transitionController.setParallax(
          PARALLAX.transition
        )
    );

    map.on(
      "moveend",
      () =>
        transitionController.setParallax(
          PARALLAX.idle
        )
    );

    /*
     * Zoom stays enabled everywhere, India included - but a marker that
     * isn't exactly at the zoom's anchor point will visibly drift while
     * zoom level is actively changing (correct map physics, but reads
     * as broken in the city/project view where the framing is meant to
     * feel deliberate). Hiding markers for the duration of the zoom and
     * letting them settle back in once it stops means nothing is ever
     * seen sliding around, without turning zoom off. Skipped while a
     * cut transition (flyingRef) already owns the hide/reveal timing,
     * so the two don't fight each other.
     */
    map.on("zoomstart", () => {
      if (flyingRef.current) return;

      const phase =
        useSceneStore.getState().phase;

      if (
        phase !== "city" &&
        phase !== "project"
      ) {
        return;
      }

      [
        ...cityMarkersRef.current,
        ...projectMarkersRef.current,
      ].forEach(({ el }) => {
        el.classList.add(
          "map-marker--flying"
        );
      });
    });

    map.on("zoomend", () => {
      if (flyingRef.current) return;

      [
        ...cityMarkersRef.current,
        ...projectMarkersRef.current,
      ].forEach(({ el }) => {
        el.classList.remove(
          "map-marker--flying"
        );
      });
    });

    map.on("load", () => {
      /*
       * Hide place/road/POI labels baked into the base style so the only
       * names on the map are our own city markers - but keep sea/ocean
       * labels (Arabian Sea, Bay of Bengal) for geographic context, and
       * restyle them to match the muted, uppercase premium look.
       */
      const KEEP_LABEL =
        /water|sea|ocean|bay|gulf/i;

      const styleLayers =
        map.getStyle().layers;

      styleLayers.forEach((layer) => {
        if (layer.type !== "symbol") return;

        if (KEEP_LABEL.test(layer.id)) {
          try {
            map.setPaintProperty(
              layer.id,
              "text-color",
              "rgba(255,255,255,0.35)"
            );
            map.setPaintProperty(
              layer.id,
              "text-halo-width",
              0
            );
          } catch {
            // property not supported on this layer - leave default styling
          }
          return;
        }

        map.setLayoutProperty(
          layer.id,
          "visibility",
          "none"
        );
      });

      /*
       * Warm gold country/state borders instead of the style's default
       * grey, to match the premium satellite-atlas look.
       */
      [
        "admin-0-boundary",
        "admin-1-boundary",
        "admin-0-boundary-disputed",
      ].forEach((id) => {
        if (!map.getLayer(id)) return;
        map.setPaintProperty(id, "line-color", "#caa46b");
        map.setPaintProperty(id, "line-opacity", 0.55);
      });

      /*
       * Hillshade relief so mountain ranges (Himalayas, Western Ghats)
       * catch light instead of reading as flat, uniform terrain - only
       * meaningful at the India (country) scale, so it's capped to low
       * zooms. Without this cap it kept loading/rendering DEM tiles at
       * city zoom too, which was the main source of the lag flying back
       * to the India view (a lot of heavy raster tiles to discard).
       */
      map.addSource("brainwing-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 9,
      });

      const firstSymbolLayer =
        styleLayers.find(
          (layer) => layer.type === "symbol"
        );

      map.addLayer(
        {
          id: "brainwing-hillshade",
          type: "hillshade",
          source: "brainwing-dem",
          maxzoom: 9,
          paint: {
            "hillshade-illumination-direction": 315,
            "hillshade-exaggeration": 0.85,
            "hillshade-shadow-color": "#000000",
            "hillshade-highlight-color": "#caa46b",
            "hillshade-accent-color": "#3a2f22",
          },
        },
        firstSymbolLayer?.id
      );

      indiaLocations.forEach(
        (location) => {
          const el =
            createMarkerEl(
              "city",
              location.name
            );

          el.addEventListener(
            "click",
            () =>
              transitionController.goToCity(
                location.id
              )
          );

          const marker =
            new mapboxgl.Marker({
              element: el,
              anchor: "bottom",
              rotationAlignment: "viewport",
              pitchAlignment: "viewport",
            })
              .setLngLat(
                location.coordinates
              )
              .addTo(map);

          cityMarkersRef.current.push({
            id: location.id,
            marker,
            el,
          });
        }
      );

      loadedRef.current = true;
    });

    return () => {
      containerRef.current?.removeEventListener(
        "pointerenter",
        handlePointerEnter
      );

      containerRef.current?.removeEventListener(
        "pointerleave",
        handlePointerLeave
      );

      useSceneStore
        .getState()
        .setIsPointerOverMap(false);

      cutTimersRef.current.forEach(
        (id) => window.clearTimeout(id)
      );

      cutTimersRef.current = [];

      cityMarkersRef.current.forEach(
        ({ marker }) =>
          marker.remove()
      );

      cityMarkersRef.current =
        [];

      projectMarkersRef.current.forEach(
        (m) =>
          m.marker.remove()
      );

      projectMarkersRef.current =
        [];

      popupRef.current?.remove();

      map.remove();

      mapRef.current = null;

      loadedRef.current = false;
    };
  }, []);

  /*
   * City / India camera.
   */
  useEffect(() => {
    const map =
      mapRef.current;

    if (
      !map ||
      !loadedRef.current
    ) {
      return;
    }

    /*
     * Cinematic cut instead of an animated flyTo - a `flyTo` between
     * India and city scale has to stream tiles continuously across every
     * intermediate zoom level for 2-3 seconds, which is what was
     * showing up as lag. `jumpTo` moves the camera instantly, so Mapbox
     * only has to fetch tiles for the final view; a soft blur veil over
     * the map (plus hiding the markers) covers the cut so it still reads
     * as a deliberate transition rather than an abrupt snap. The city
     * view still lands bearing-rotated/tilted - it just arrives that way
     * behind the veil instead of visibly animating there.
     */
    const setMarkersHidden = (hidden) => {
      [
        ...cityMarkersRef.current,
        ...projectMarkersRef.current,
      ].forEach(({ el }) => {
        el.classList.toggle(
          "map-marker--flying",
          hidden
        );
      });
    };

    const cutToView = (options) => {
      flyingRef.current = true;
      setMarkersHidden(true);

      useSceneStore
        .getState()
        .setIsMapTransitioning(true);

      containerRef.current?.classList.add(
        "map-canvas--veiled"
      );

      const jumpTimer =
        window.setTimeout(() => {
          map.jumpTo(options);

          const revealTimer =
            window.setTimeout(() => {
              flyingRef.current = false;
              setMarkersHidden(false);

              useSceneStore
                .getState()
                .setIsMapTransitioning(
                  false
                );

              containerRef.current?.classList.remove(
                "map-canvas--veiled"
              );
            }, 220);

          cutTimersRef.current.push(
            revealTimer
          );
        }, 420);

      cutTimersRef.current.push(
        jumpTimer
      );
    };

    cutTimersRef.current.forEach(
      (id) => window.clearTimeout(id)
    );
    cutTimersRef.current = [];

    const prevPhase =
      prevPhaseRef.current;

    prevPhaseRef.current = phase;

    if (phase === "city") {
      const location =
        cities[city];

      if (location) {
        cutToView({
          center:
            location.coordinates,

          zoom: CITY_ZOOM.zoom,
          pitch: CITY_ZOOM.pitch,
          bearing:
            map.getBearing() +
            CITY_ZOOM.bearingOffset,
        });
      }
    }

    /*
     * The map camera already sits at INDIA_VIEW from the moment it's
     * created (and never moves for the Earth -> India scroll transition
     * - that crossfade is handled separately) - only actually cut the
     * camera back when returning from a city, where it really did move.
     */
    if (
      phase === "india" &&
      (prevPhase === "city" ||
        prevPhase === "project")
    ) {
      cutToView({
        ...INDIA_VIEW,
      });
    }

    /*
     * Arriving at India fresh from the Earth scroll (no camera cut
     * needed, that crossfade already handles the reveal) still gets the
     * same brief blur-veil flourish the city cut uses, plus the
     * markers' own settle-in fade, so the moment India "arrives" reads
     * consistently with every other transition in the app.
     */
    if (
      phase === "india" &&
      prevPhase === "india-transition"
    ) {
      setMarkersHidden(true);

      containerRef.current?.classList.add(
        "map-canvas--veiled"
      );

      const pulseTimer =
        window.setTimeout(() => {
          setMarkersHidden(false);

          containerRef.current?.classList.remove(
            "map-canvas--veiled"
          );
        }, 380);

      cutTimersRef.current.push(
        pulseTimer
      );
    }

    /*
     * Mirror that same flourish for the reverse trip - leaving India
     * back to Earth (via the "<- Earth" button or scroll-up) gets the
     * identical brief veil pulse right as Earth fully takes back over,
     * so both directions of this transition feel consistent.
     */
    if (
      phase === "earth" &&
      prevPhase === "india-transition"
    ) {
      setMarkersHidden(true);

      containerRef.current?.classList.add(
        "map-canvas--veiled"
      );

      const pulseTimer =
        window.setTimeout(() => {
          setMarkersHidden(false);

          containerRef.current?.classList.remove(
            "map-canvas--veiled"
          );
        }, 380);

      cutTimersRef.current.push(
        pulseTimer
      );
    }
  }, [phase, city]);

  /*
   * City marker states.
   */
  useEffect(() => {
    const dimmed =
      phase === "city" ||
      phase === "project";

    cityMarkersRef.current.forEach(
      ({ id, el }) => {
        el.classList.toggle(
          "map-marker--dimmed",
          dimmed &&
            id !== highlightedMarker
        );

        el.classList.toggle(
          "map-marker--active",
          id === highlightedMarker
        );
      }
    );
  }, [
    phase,
    highlightedMarker,
  ]);

  /*
   * Project markers.
   */
  useEffect(() => {
    const map =
      mapRef.current;

    if (
      !map ||
      !loadedRef.current
    ) {
      return;
    }

    projectMarkersRef.current.forEach(
      (m) =>
        m.marker.remove()
    );

    projectMarkersRef.current =
      [];

    popupRef.current?.remove();

    popupRef.current =
      null;

    if (
      phase !== "city" &&
      phase !== "project"
    ) {
      return;
    }

    getProjectsByCity(
      city
    ).forEach((project) => {
      const el =
        createMarkerEl(
          "project"
        );

      /*
       * If a camera cut is already in progress when these markers get
       * (re)built, start hidden too - the cut's own reveal handler shows
       * whatever markers exist at that point.
       */
      if (flyingRef.current) {
        el.classList.add(
          "map-marker--flying"
        );
      }

      el.addEventListener(
        "mouseenter",
        () => {
          popupRef.current?.remove();

          popupRef.current =
            new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 14,
              className:
                "map-popup-wrap",
            })
              .setLngLat(
                project.coordinates
              )
              .setHTML(
                projectPopupHtml(
                  project
                )
              )
              .addTo(map);
        }
      );

      el.addEventListener(
        "mouseleave",
        () => {
          popupRef.current?.remove();

          popupRef.current =
            null;
        }
      );

      el.addEventListener(
        "click",
        () =>
          transitionController.goToProject(
            project
          )
      );

      const marker =
        new mapboxgl.Marker({
          element: el,
          anchor: "bottom",
          rotationAlignment: "viewport",
          pitchAlignment: "viewport",
        })
          .setLngLat(
            project.coordinates
          )
          .addTo(map);

      projectMarkersRef.current.push({
        id: project.id,
        marker,
        el,
      });
    });
  }, [city, phase]);

  /*
   * Selected project marker.
   */
  useEffect(() => {
    projectMarkersRef.current.forEach(
      ({ id, el }) => {
        el.classList.toggle(
          "map-marker--active",
          selectedProject?.id === id
        );

        el.classList.toggle(
          "map-marker--dimmed",
          Boolean(
            selectedProject
          ) &&
            selectedProject.id !== id
        );
      }
    );
  }, [selectedProject]);

  return (
    <div
      className={`
        pointer-events-none
        absolute inset-0 z-20
        ${
          active
            ? "opacity-100"
            : "opacity-0"
        }
      `}
      style={{
        transition:
          "opacity 700ms ease",
      }}
    >
      {TOKEN ? (
        <div
          ref={containerRef}
          className={`map-canvas ${
            active
              ? "pointer-events-auto"
              : "pointer-events-none"
          }`}
          style={{
            position: "absolute",
            top: "-3%",
            left: "-3%",
            width: "106%",
            height: "106%",
          }}
        />
      ) : (
        <IndiaFallback />
      )}
    </div>
  );
}