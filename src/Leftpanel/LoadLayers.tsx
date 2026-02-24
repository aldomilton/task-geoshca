import { useState } from "react";
import WMSCapabilities from "ol/format/WMSCapabilities"; 
// OpenLayers parser for WMS GetCapabilities XML
import { Map } from "ol";
import WMSLayerControl from "../components/WMSLayerControl/WMSLayerControl";

interface LoadLayerProps {
  olmapview: Map; 
  // Receives OpenLayers map instance from LeftPanel
}

function LoadLayer({ olmapview }: LoadLayerProps) {

  // Store WMS server URL (default value provided)
  const [url, setUrl] = useState<string>(
    "https://geoserver.geoshcatechnologies.com/Narasaraopet/wms"
  );

  // Store list of extracted layer names from GetCapabilities
  const [layersList, setLayersList] = useState<string[]>([]);

  // Function to fetch WMS GetCapabilities
  const getURLcapabilities = async (inputUrl: string) => {

    if (!inputUrl || inputUrl.trim() === "") {
      alert("Please enter a valid WMS URL");
      return;
    }

    try {
      // Construct GetCapabilities request URL
      const capabilitiesUrl =
        `${inputUrl}?service=WMS&version=1.1.1&request=GetCapabilities`;

      // Send  request to WMS server
      const response = await fetch(capabilitiesUrl);

      // Check if response is successful
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      // Get XML response as text
      const text = await response.text();

      // Safety check to ensure valid WMS XML
      if (!text || !text.includes("WMS_Capabilities")) {
        console.error("Invalid XML response:", text);
        return;
      }

      // Parse XML using OpenLayers WMSCapabilities parser
      const parser = new WMSCapabilities();

      // Convert XML string to JavaScript object
      const result = parser.read(text);

      // Extract layer names from nested structure
      // result.Capability.Layer. this Layer contains actual layer list
      const layernames =
        result?.Capability?.Layer?.Layer
          ?.map((layer: any) => layer.Name) 
          .filter(Boolean) || []; 

      // Store layer names in state
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

      {/* Button to trigger GetCapabilities request */}
      <button
        onClick={() => getURLcapabilities(url)}
        style={{ marginTop: "5px" }}
      >
        Load Layers
      </button>
      

      {/* Render layer controls only if layers exist */}
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