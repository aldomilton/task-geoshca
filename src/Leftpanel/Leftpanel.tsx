import { Map } from "ol";
import Bookmark from "../Leftpanel/Bookmark";
import LoadLayers from "../Leftpanel/LoadLayers";
import WMSLayerControl from "../components/WMSLayerControl/WMSLayerControl";

interface LeftPanelProps {
  olmapview: Map | null;
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
      <Bookmark olMapview={olmapview} />

      <LoadLayers olmapview={olmapview} />

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