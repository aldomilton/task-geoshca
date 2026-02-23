
import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Draw from "ol/interaction/Draw";
import { getLength, getArea } from "ol/sphere";
import { fromLonLat, toLonLat } from "ol/proj";
import OverviewMap from "ol/control/OverviewMap";
import { defaults as defaultControls } from "ol/control";
import Style from "ol/style/Style";
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import CircleStyle from "ol/style/Circle";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import "ol/ol.css";

interface Props {
  setMap: React.Dispatch<React.SetStateAction<Map | null>>;
}

export default function Mapviewer({ setMap }: Props) {

  // Store map instance (prevents re-creation on re-render)
  const mapRef = useRef<Map | null>(null);

  // Store active drawing interaction
  const drawRef = useRef<Draw | null>(null);

  // Vector source stores all drawn features
  const vectorSource = useRef(new VectorSource());

  // State for measurement display
  const [lengthValue, setLengthValue] = useState("0 km");
  const [areaValue, setAreaValue] = useState("0 km²");

  useEffect(() => {
    // Prevent map from initializing multiple times
    if (mapRef.current) return;

    // Base OSM Layer (OpenStreetMap tiles)
    const baseLayer = new TileLayer({
      source: new OSM(),
    });

    // Vector layer for drawing features
    const vectorLayer = new VectorLayer({
      source: vectorSource.current,
    });

    // Overview mini map control
    const overview = new OverviewMap({
      layers: [new TileLayer({ source: new OSM() })],
      collapsed: false,
      collapsible: false,
    });

    // Create OpenLayers Map
    const map = new Map({
      target: "map", // Attach map to div id="map"
      layers: [baseLayer, vectorLayer],
      controls: defaultControls().extend([overview]),
      view: new View({
        center: fromLonLat([79.266, 17.057]), // Convert lon/lat to WebMercator
        zoom: 10,
      }),
    });

    // Store map reference
    mapRef.current = map;

    // Send map to parent (App.tsx)
    setMap(map);

  }, [setMap]);

  // Remove existing drawing interaction
  const stopDrawing = () => {
    if (drawRef.current && mapRef.current) {
      mapRef.current.removeInteraction(drawRef.current);
      drawRef.current = null;
    }
  };

  // Clear all drawn features
  const clearMap = () => {
    vectorSource.current.clear();
    setLengthValue("0 km");
    setAreaValue("0 km²");
  };

  // Draw Line and calculate  length
  const drawLine = () => {
    stopDrawing();

    const draw = new Draw({
      source: vectorSource.current,
      type: "LineString",
    });

    draw.on("drawend", (evt) => {
      const geometry = evt.feature.getGeometry() as LineString;

      // Calculate length on Earth surface
      const length = getLength(geometry);
      const lengthKm = (length / 1000).toFixed(2) + " km";

      setLengthValue(lengthKm);
      setAreaValue("0 km²");

      // Apply style and label
      evt.feature.setStyle(
        new Style({
          stroke: new Stroke({ color: "blue", width: 3 }),
          text: new Text({
            text: lengthKm,
            placement: "line",
            fill: new Fill({ color: "black" }),
            stroke: new Stroke({ color: "white", width: 3 }),
          }),
        })
      );
    });

    mapRef.current?.addInteraction(draw);
    drawRef.current = draw;
  };

  // Draw Polygon and calculate area
  const drawPolygon = () => {
    stopDrawing();

    const draw = new Draw({
      source: vectorSource.current,
      type: "Polygon",
    });

    draw.on("drawend", (evt) => {
      const geometry = evt.feature.getGeometry() as Polygon;

      // Calculate area on Earth surface
      const area = getArea(geometry);
      const areaKm = (area / 1000000).toFixed(2) + " km²";

      setAreaValue(areaKm);
      setLengthValue("0 km");

      evt.feature.setStyle(
        new Style({
          stroke: new Stroke({ color: "green", width: 2 }),
          fill: new Fill({ color: "rgba(0,255,0,0.2)" }),
          text: new Text({
            text: areaKm,
            placement: "line",
            fill: new Fill({ color: "black" }),
            stroke: new Stroke({ color: "white", width: 3 }),
          }),
        })
      );
    });

    mapRef.current?.addInteraction(draw);
    drawRef.current = draw;
  };

  // Draw Point and display coordinates
  const drawPoint = () => {
    stopDrawing();

    const draw = new Draw({
      source: vectorSource.current,
      type: "Point",
    });

    draw.on("drawend", (evt) => {
      const geometry = evt.feature.getGeometry() as Point;

      const coords = geometry.getCoordinates();

      // Convert  to Lon/Lat
      const lonLat = toLonLat(coords);

      evt.feature.setStyle([
        new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: "red" }),
            stroke: new Stroke({ color: "white", width: 2 }),
          }),
        }),
        new Style({
          text: new Text({
            text: `${lonLat[0].toFixed(5)}, ${lonLat[1].toFixed(5)}`,
            offsetY: -20,
            fill: new Fill({ color: "black" }),
            stroke: new Stroke({ color: "white", width: 3 }),
          }),
        }),
      ]);
    });

    mapRef.current?.addInteraction(draw);
    drawRef.current = draw;
  };

  return (
    <div style={{ position: "relative", height: "100%" }}>

      {/* Measurement Control Panel */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.7)",
          padding: "15px 25px",
          borderRadius: "10px",
          textAlign: "center",
          color: "white",
          zIndex: 1000,
        }}
      >
        <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
          Length: {lengthValue} | Area: {areaValue}
        </div>

        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
          <button style={buttonStyle} onClick={drawPoint}>Point</button>
          <button style={buttonStyle} onClick={drawLine}>Line</button>
          <button style={buttonStyle} onClick={drawPolygon}>Polygon</button>
          <button style={buttonStyle} onClick={clearMap}>Clear</button>
        </div>
      </div>

      {/* Map Container */}
      <div id="map" style={{ width: "100%", height: "100%" }}></div>

    </div>
  );
}

// Reusable button styling
const buttonStyle: React.CSSProperties = {
  backgroundColor: "green",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: "5px",
  cursor: "pointer",
};