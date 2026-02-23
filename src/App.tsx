import { useState } from "react";
import Map from "ol/Map"; // OpenLayers Map type
import Mapviewer from "./components/Mapviewer/Mapviewer";
import LeftPanel from "./Leftpanel/Leftpanel";

function App() {

  // Store OpenLayers map instance so it can be shared
  const [map, setMap] = useState<Map | null>(null);

  return (
    // Layout container (Sidebar + Map)
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* Sidebar receives map for layer control & bookmarks */}
      <LeftPanel olmapview={map} />

      {/* Mapviewer creates map and sends it back using setMap */}
      <div style={{ flex: 1 }}>
        <Mapviewer setMap={setMap} />
      </div>

    </div>
  );
}

export default App;