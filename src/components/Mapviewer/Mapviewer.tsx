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
  const mapRef = useRef<Map | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const vectorSource = useRef(new VectorSource());

  const [lengthValue, setLengthValue] = useState("0 km");
  const [areaValue, setAreaValue] = useState("0 km²");

  useEffect(() => {
    if (mapRef.current) return;

    const baseLayer = new TileLayer({
      source: new OSM(),
    });

    // 🧹 removed the default WMS layer (clean map startup)
    const vectorLayer = new VectorLayer({
      source: vectorSource.current,
    });

    const overview = new OverviewMap({
      layers: [new TileLayer({ source: new OSM() })],
      collapsed: false,
      collapsible: false,
    });

    const map = new Map({
      target: "map",
      layers: [baseLayer, vectorLayer],
      controls: defaultControls().extend([overview]),
      view: new View({
        center: fromLonLat([79.266, 17.057]),
        zoom: 10,
      }),
    });

    mapRef.current = map;
    setMap(map);
  }, [setMap]);

  const stopDrawing = () => {
    if (drawRef.current && mapRef.current) {
      mapRef.current.removeInteraction(drawRef.current);
      drawRef.current = null;
    }
  };

  const clearMap = () => {
    vectorSource.current.clear();
    setLengthValue("0 km");
    setAreaValue("0 km²");
  };

  const drawLine = () => {
    stopDrawing();

    const draw = new Draw({
      source: vectorSource.current,
      type: "LineString",
    });

    draw.on("drawend", (evt) => {
      const geometry = evt.feature.getGeometry() as LineString;
      const length = getLength(geometry);
      const lengthKm = (length / 1000).toFixed(2) + " km";

      setLengthValue(lengthKm);
      setAreaValue("0 km²");

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

  const drawPolygon = () => {
    stopDrawing();

    const draw = new Draw({
      source: vectorSource.current,
      type: "Polygon",
    });

    draw.on("drawend", (evt) => {
      const geometry = evt.feature.getGeometry() as Polygon;
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

  const drawPoint = () => {
    stopDrawing();

    const draw = new Draw({
      source: vectorSource.current,
      type: "Point",
    });

    draw.on("drawend", (evt) => {
      const geometry = evt.feature.getGeometry() as Point;
      const coords = geometry.getCoordinates();
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
      <div id="map" style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: "green",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: "5px",
  cursor: "pointer",
};
