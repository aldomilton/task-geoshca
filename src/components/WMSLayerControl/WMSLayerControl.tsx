
import { useState } from "react";
import TileWMS from "ol/source/TileWMS"; // WMS source connection
import TileLayer from "ol/layer/Tile";   // Tile layer for map
import { Map } from "ol";                // OpenLayers Map type

interface WMSLayerControlProps {
  map: Map;           // OpenLayers map instance
  layerName: string;  // WMS Layer name (workspace:layer format)
  wmsUrl: string;     // Base WMS server URL
}

function WMSLayerControl({ map, layerName, wmsUrl }: WMSLayerControlProps) {

  // Store reference to added WMS layer
  const [layer, setLayer] = useState<TileLayer<TileWMS> | null>(null);

  // Checkbox state (layer visibility)
  const [checked, setChecked] = useState(false);

  // Store legend URL (generated dynamically)
  const [legendUrl, setLegendUrl] = useState<string | null>(null);

  // Toggle Layer On/Off
  const handleToggle = () => {

    // If layer is not currently added → Add it
    if (!checked) {

      // Create new WMS Tile Layer
      const newLayer = new TileLayer({
        source: new TileWMS({
          url: wmsUrl,  
          params: {
            LAYERS: layerName,                                      // Specify which layer to render
            VERSION: "1.1.1",      
            FORMAT: "image/png",    
            TRANSPARENT: true,      
          },
          serverType: "geoserver",  
          crossOrigin: "anonymous",                                          // Avoid CORS issues
        }),
        opacity: 1,                                                       // Default full opacity
      });

      // Add layer to map
      map.addLayer(newLayer);

      // Store layer reference
      setLayer(newLayer);

      // Generate Legend URL using GetLegendGraphic request
      const legendGraphicUrl =
        `${wmsUrl}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=${layerName}`;

      setLegendUrl(legendGraphicUrl);

    } else {
      if (layer) {                                           // If layer already exists Remove it
        map.removeLayer(layer);
      }

      setLayer(null);
      setLegendUrl(null);
    }

    // Toggle checkbox state
    setChecked(!checked);
  };

  // Handle Opacity Change
  const handleOpacity = (value: number) => {
    if (layer) {
      layer.setOpacity(value); 
      
    }                                                           
  };                                                           // Dynamically update transparency 

  return (
    <div
      style={{
        marginBottom: "10px",
        borderBottom: "1px solid #ccc",
        paddingBottom: "10px",
      }}
    >
      {/* ============================ */}
      {/* Layer Toggle Section */}
      {/* ============================ */}

      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={handleToggle}
        />
        {layerName}
      </label>

      {/* ============================ */}
      {/* Opacity + Legend Section */}
      {/* ============================ */}

      {checked && (
        <>
          {/* Opacity Slider */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            defaultValue="1"
            onChange={(e) =>
              handleOpacity(Number(e.target.value))
            }
            style={{ width: "100%", marginTop: "5px" }}
          />

          {/* Legend Image (Only if legend URL exists) */}
          {legendUrl && (
            <div style={{ marginTop: "8px" }}>
              <img
                src={legendUrl}
                alt="Legend"
                style={{
                  maxWidth: "100%",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WMSLayerControl;