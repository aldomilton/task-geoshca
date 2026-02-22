import { useState } from "react";
import Map from "ol/Map";
import Mapviewer from "./components/Mapviewer/Mapviewer";
import LeftPanel from "./Leftpanel/Leftpanel";

function App() {
  const [map, setMap] = useState<Map | null>(null);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <LeftPanel olmapview={map} />
      <div style={{ flex: 1 }}>
        <Mapviewer setMap={setMap} />
      </div>
    </div>
  );
}

export default App;