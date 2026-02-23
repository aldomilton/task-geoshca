import { Map } from "ol";
import Bookmark from "../Leftpanel/Bookmark";
import LoadLayers from "../Leftpanel/LoadLayers";
import WMSLayerControl from "../components/WMSLayerControl/WMSLayerControl";

interface LeftPanelProps {                       // Map instance received from App.tsx
  olmapview: Map | null;                         // Can be null before map initializes
}

function LeftPanel({ olmapview }: LeftPanelProps) {


  const wmsUrl =
    "/geoserver/Narasaraopet/wms";

  if (!olmapview) {
    return (
      <div style={{ width: "300px", padding: "20px" }}>
        Loading map...
      </div>
    );
  }

  return (
    <div style={{ width: "300px", padding: "10px" }}>
      <Bookmark olMapview={olmapview} />                     //  Pass map to Bookmark component 

      <LoadLayers olmapview={olmapview} />

 {/* 
        Below are predefined layers.
        Each WMSLayerControl:
        - Adds WMS layer to map
        - Provides checkbox toggle
        - Provides opacity slider
        - Shows legend automatically
      */}

      <WMSLayerControl
        map={olmapview}
        layerName="Narasaraopet:PalnaduConstitution"
        wmsUrl={wmsUrl}
      />

      <WMSLayerControl
        map={olmapview}
        layerName="Narasaraopet:PalnaduRevenueDivisions"
        wmsUrl={wmsUrl}
      />

      <WMSLayerControl
        map={olmapview}
        layerName="Narasaraopet:PalnaduMandals"
        wmsUrl={wmsUrl}
      />

      <WMSLayerControl
        map={olmapview}
        layerName="Narasaraopet:PalnaduVillages"
        wmsUrl={wmsUrl}
      />

      <WMSLayerControl
        map={olmapview}
        layerName="Narasaraopet:IndiaBoundary"
        wmsUrl={wmsUrl}
      />

      <WMSLayerControl
        map={olmapview}
        layerName="Narasaraopet:IndiaDistricts"
        wmsUrl={wmsUrl}
      />

      <WMSLayerControl
        map={olmapview}
        layerName="Narasaraopet:IndiaStates"
        wmsUrl={wmsUrl}
      />
    </div>
  );
}

export default LeftPanel;