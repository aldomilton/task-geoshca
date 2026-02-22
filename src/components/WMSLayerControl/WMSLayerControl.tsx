import { useState } from "react";
import TileWMS from "ol/source/TileWMS";
import TileLayer from "ol/layer/Tile";
import { Map } from "ol";

interface WMSLayerControlProps {
  map: Map;
  layerName: string;
  wmsUrl: string;
}

function WMSLayerControl({ map, layerName, wmsUrl }: WMSLayerControlProps) {

  const [layer, setLayer] = useState<TileLayer<TileWMS> | null>(null);
  const [checked, setChecked] = useState(false);

  const handleToggle = () => {
    if (!checked) {

      const newLayer = new TileLayer({
        source: new TileWMS({
  url: wmsUrl,
  params: {
    LAYERS: layerName,
    VERSION: "1.1.1",
    FORMAT: "image/png",
    TRANSPARENT: true,
  },
  serverType: "geoserver",
  crossOrigin: "anonymous",
}),
        opacity: 1,
      });

      map.addLayer(newLayer);
      setLayer(newLayer);

    } else {
      if (layer) {
        map.removeLayer(layer);
      }
      setLayer(null);
    }

    setChecked(!checked);
  };

  const handleOpacity = (value: number) => {
    if (layer) {
      layer.setOpacity(value);
    }
  };

  return (
    <div style={{ marginBottom: "10px", borderBottom: "1px solid #ccc" }}>
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={handleToggle}
        />
        {layerName}
      </label>

      {checked && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          defaultValue="1"
          onChange={(e) => handleOpacity(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      )}
    </div>
  );
}

export default WMSLayerControl;