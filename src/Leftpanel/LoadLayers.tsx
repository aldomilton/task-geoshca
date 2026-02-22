import { useState } from "react";
import WMSCapabilities from "ol/format/WMSCapabilities";
import { Map } from "ol";
import WMSLayerControl from "../components/WMSLayerControl/WMSLayerControl";

interface LoadLayerProps {
  olmapview: Map;
}

function LoadLayer({ olmapview }: LoadLayerProps) {
  const [url, setUrl] = useState<string>(
    "https://geoserver.geoshcatechnologies.com/Narasaraopet/wms"
  );
  const [layersList, setLayersList] = useState<string[]>([]);

  const getURLcapabilities = async (inputUrl: string) => {
    if (!inputUrl || inputUrl.trim() === "") {
      alert("Please enter a valid WMS URL");
      return;
    }

    try {
      const capabilitiesUrl = `${inputUrl}?service=WMS&version=1.1.1&request=GetCapabilities`;

      const response = await fetch(capabilitiesUrl);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const text = await response.text();

      // 🔥 SAFETY CHECK
      if (!text || !text.includes("WMS_Capabilities")) {
        console.error("Invalid XML response:", text);
        return;
      }

      const parser = new WMSCapabilities();
      const result = parser.read(text);

      const layernames =
        result?.Capability?.Layer?.Layer
          ?.map((layer: any) => layer.Name)
          .filter(Boolean) || [];

      setLayersList(layernames);

    } catch (error) {
      console.error("Error fetching WMS Capabilities:", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter WMS URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "100%" }}
      />

      <button
        onClick={() => getURLcapabilities(url)}
        style={{ marginTop: "5px" }}
      >
        Load Layers
      </button>

      {layersList.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          {layersList.map((layerName, index) => (
            <WMSLayerControl
              key={index}
              map={olmapview}
              layerName={layerName}
              wmsUrl={url}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default LoadLayer;