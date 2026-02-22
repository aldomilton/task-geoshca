import React, { useRef } from "react";
import Draw from "ol/interaction/Draw";
import VectorSource from "ol/source/Vector";
import { getLength, getArea } from "ol/sphere";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import Map from "ol/Map";
import Overlay from "ol/Overlay";
import type { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";

interface FooterSectionProps {
  map: Map;
  vectorSource: VectorSource;
  drawTool: Draw | null;
  setDrawTool: (tool: Draw | null) => void;
  setLength: (val: string) => void;
  setArea: (val: string) => void;
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

  const overlayRef = useRef<Overlay | null>(null);
  const listenerRef = useRef<EventsKey | null>(null);

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

  const createOverlay = () => {
    if (overlayRef.current) {
      map.removeOverlay(overlayRef.current);
    }

    const element = document.createElement("div");

    element.style.background = "white";
    element.style.color = "black";
    element.style.padding = "2px 6px";
    element.style.borderRadius = "4px";
    element.style.fontWeight = "bold";
    element.style.whiteSpace = "nowrap";
    element.style.pointerEvents = "none";
    element.style.position = "absolute";
    element.style.transformOrigin = "center";

    const overlay = new Overlay({
      element,
      positioning: "center-center",
      stopEvent: false,
    });

    map.addOverlay(overlay);
    overlayRef.current = overlay;

    return element;
  };

  const drawLine = () => {
    removeInteraction();

    const draw = new Draw({
      source: vectorSource,
      type: "LineString",
    });

    const tooltipElement = createOverlay();

    draw.on("drawstart", (evt) => {
      const feature = evt.feature;

      listenerRef.current = feature.getGeometry()?.on("change", (e: any) => {
        const geometry = e.target as LineString;

        const length = getLength(geometry);
        const output = (length / 1000).toFixed(2) + " km";
        tooltipElement.innerHTML = output;

        const coords = geometry.getCoordinates();

        if (coords.length >= 2) {
          let total = 0;
          const segmentLengths: number[] = [];

          for (let i = 0; i < coords.length - 1; i++) {
            const dx = coords[i + 1][0] - coords[i][0];
            const dy = coords[i + 1][1] - coords[i][1];
            const segLen = Math.sqrt(dx * dx + dy * dy);
            segmentLengths.push(segLen);
            total += segLen;
          }

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

        const area = getArea(geometry);
        const output = (area / 1000000).toFixed(2) + " km²";

        tooltipElement.innerHTML = output;

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
