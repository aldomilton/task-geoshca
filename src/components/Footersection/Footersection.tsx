// FooterSection Component
// -------------------------------------------------------------------
// Responsibilities:
// 1. Add drawing interactions (Line & Polygon)
// 2. Show real-time measurement tooltip using Overlay
// 3. Calculate length and area dynamically
// 4. Position tooltip properly (midpoint for line, center for polygon)
// 5. Safely remove interactions and listeners
// -------------------------------------------------------------------

import React, { useRef } from "react";
import Draw from "ol/interaction/Draw";
import VectorSource from "ol/source/Vector";
import { getLength, getArea } from "ol/sphere"; // Geodesic calculations
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import Map from "ol/Map";
import Overlay from "ol/Overlay"; // Used for tooltip
import type { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable"; // Used to remove listeners

// Props definition
interface FooterSectionProps {
  map: Map;                         // OpenLayers map instance
  vectorSource: VectorSource;       // Source for drawn features
  drawTool: Draw | null;            // Current active draw interaction
  setDrawTool: (tool: Draw | null) => void;
  setLength: (val: string) => void; // Update length in parent
  setArea: (val: string) => void;   // Update area in parent
}

function FooterSection(props: FooterSectionProps) {

  const {
    map,
    vectorSource,
    drawTool,
    setDrawTool,
    setLength,
    setArea,
  } = props;

  // Store overlay reference (tooltip)
  const overlayRef = useRef<Overlay | null>(null);

  // Store geometry change listener reference
  const listenerRef = useRef<EventsKey | null>(null);

  // Remove existing interaction & listeners safely
  const removeInteraction = () => {

    if (drawTool) {
      map.removeInteraction(drawTool);
      setDrawTool(null);
    }

    if (overlayRef.current) {
      map.removeOverlay(overlayRef.current);
      overlayRef.current = null;
    }

    if (listenerRef.current) {
      unByKey(listenerRef.current);
      listenerRef.current = null;
    }
  };

  // Create tooltip overlay dynamically
  const createOverlay = () => {

    // Remove existing overlay if exists
    if (overlayRef.current) {
      map.removeOverlay(overlayRef.current);
    }

    // Create HTML element for tooltip
    const element = document.createElement("div");

    // Style tooltip appearance
    element.style.background = "white";
    element.style.color = "black";
    element.style.padding = "2px 6px";
    element.style.borderRadius = "4px";
    element.style.fontWeight = "bold";
    element.style.whiteSpace = "nowrap";
    element.style.pointerEvents = "none";
    element.style.position = "absolute";
    element.style.transformOrigin = "center";

    // Create OpenLayers overlay
    const overlay = new Overlay({
      element,
      positioning: "center-center",
      stopEvent: false,
    });

    map.addOverlay(overlay);
    overlayRef.current = overlay;

    return element;
  };

  // Draw Line with dynamic midpoint rotation
  const drawLine = () => {

    removeInteraction();

    const draw = new Draw({
      source: vectorSource,
      type: "LineString",
    });

    const tooltipElement = createOverlay();

    draw.on("drawstart", (evt) => {

      const feature = evt.feature;

      // Listen to geometry changes while drawing
      listenerRef.current = feature.getGeometry()?.on("change", (e: any) => {

        const geometry = e.target as LineString;

        // Calculate geodesic length
        const length = getLength(geometry);
        const output = (length / 1000).toFixed(2) + " km";

        tooltipElement.innerHTML = output;

        const coords = geometry.getCoordinates();

        if (coords.length >= 2) {

          let total = 0;
          const segmentLengths: number[] = [];

          // Calculate total segment length
          for (let i = 0; i < coords.length - 1; i++) {
            const dx = coords[i + 1][0] - coords[i][0];
            const dy = coords[i + 1][1] - coords[i][1];
            const segLen = Math.sqrt(dx * dx + dy * dy);
            segmentLengths.push(segLen);
            total += segLen;
          }

          // Find midpoint of line
          const halfDistance = total / 2;
          let accumulated = 0;

          for (let i = 0; i < segmentLengths.length; i++) {

            if (accumulated + segmentLengths[i] >= halfDistance) {

              const ratio = (halfDistance - accumulated) / segmentLengths[i];

              const x =
                coords[i][0] +
                (coords[i + 1][0] - coords[i][0]) * ratio;

              const y =
                coords[i][1] +
                (coords[i + 1][1] - coords[i][1]) * ratio;

              overlayRef.current?.setPosition([x, y]);

              // Calculate angle for rotation
              const dx = coords[i + 1][0] - coords[i][0];
              const dy = coords[i + 1][1] - coords[i][1];

              let angle = Math.atan2(dy, dx) * (180 / Math.PI);

              if (angle > 90) angle -= 180;
              if (angle < -90) angle += 180;

              tooltipElement.style.transform =
                `translate(-50%, -50%) rotate(${angle}deg)`;

              break;
            }

            accumulated += segmentLengths[i];
          }
        }

        setLength(output);

      }) as EventsKey;
    });

    draw.on("drawend", () => {
      if (listenerRef.current) {
        unByKey(listenerRef.current);
        listenerRef.current = null;
      }
    });

    map.addInteraction(draw);
    setDrawTool(draw);
  };

  // Draw Polygon with center tooltip
  const drawPolygon = () => {

    removeInteraction();

    const draw = new Draw({
      source: vectorSource,
      type: "Polygon",
    });

    const tooltipElement = createOverlay();

    draw.on("drawstart", (evt) => {

      const feature = evt.feature;

      listenerRef.current = feature.getGeometry()?.on("change", (e: any) => {

        const geometry = e.target as Polygon;

        // Calculate geodesic area
        const area = getArea(geometry);
        const output = (area / 1000000).toFixed(2) + " km²";

        tooltipElement.innerHTML = output;

        // Position at polygon center
        const interiorPoint = geometry.getInteriorPoint().getCoordinates();
        overlayRef.current?.setPosition(interiorPoint);

        setArea(output);

      }) as EventsKey;
    });

    draw.on("drawend", () => {
      if (listenerRef.current) {
        unByKey(listenerRef.current);
        listenerRef.current = null;
      }
    });

    map.addInteraction(draw);
    setDrawTool(draw);
  };

  // Clear all features and reset
  const clearAll = () => {
    vectorSource.clear();
    removeInteraction();
    setLength("0");
    setArea("0");
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 10,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.6)",
        padding: "8px 12px",
        borderRadius: "6px",
        color: "white",
        display: "flex",
        gap: "10px",
      }}
    >
      <button onClick={drawLine}>Line</button>
      <button onClick={drawPolygon}>Polygon</button>
      <button onClick={clearAll}>Clear</button>
    </div>
  );
}

export default FooterSection;