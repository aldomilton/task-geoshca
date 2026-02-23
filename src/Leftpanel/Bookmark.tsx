// Bookmark Component
// -------------------------------------------------------------
// Responsibilities:
// 1. Save current map view (center + zoom)
// 2. Store bookmarks in local state
// 3. Display list of saved bookmarks
// 4. Animate map to selected bookmark location
// -------------------------------------------------------------

import { Map } from "ol"; // OpenLayers Map type
import { useState } from "react";

// Props definition
interface BookMarkProps {
  olMapview: Map | null; 
  // Map instance received from LeftPanel
  // Can be null before map initializes
}

// Bookmark data structure
interface BookmarkType {
  name: string;     // User-given bookmark name
  center: number[]; // Map center coordinates
  zoom: number;     // Map zoom level
}

function BookMark({ olMapview }: BookMarkProps) {

  // Store all saved bookmarks
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);

  // Store current bookmark name input
  const [bookmarkName, setBookmarkName] = useState<string>("");

  // Add new bookmark
  const addBookmark = () => {

    // Safety check: map must exist and name must not be empty
    if (!olMapview || !bookmarkName) return;

    // Get current map view
    const view = olMapview.getView();

    // Get current center coordinates
    const center = view.getCenter() || [0, 0];

    // Get current zoom level
    const zoom = view.getZoom() || 0;

    // Create new bookmark object
    const newBookmark: BookmarkType = {
      name: bookmarkName,
      center,
      zoom,
    };

    // Add bookmark to state (spread operator keeps old bookmarks)
    setBookmarks([...bookmarks, newBookmark]);

    // Clear input field after saving
    setBookmarkName("");
  };

  // Navigate to selected bookmark
  const goToBookmark = (bookmark: BookmarkType) => {

    if (!olMapview) return;

    // Smooth animation to bookmark location
    olMapview.getView().animate({
      center: bookmark.center,
      zoom: bookmark.zoom,
      duration: 1000, // Animation duration (ms)
    });
  };

  return (
    <div>

      {/* ============================ */}
      {/* INPUT SECTION */}
      {/* ============================ */}

      <div style={{ display: "flex", gap: "5px" }}>

        {/* Input for bookmark name */}
        <input
          type="text"
          value={bookmarkName}
          onChange={(e) => setBookmarkName(e.target.value)} 
          // Update state when user types
          placeholder="Bookmark Name"
          style={{
            flex: 1,
            padding: "6px",
            backgroundColor: "#333",
            color: "white",
            border: "none",
          }}
        />

        {/* Button to save bookmark */}
        <button
          onClick={addBookmark}
          style={{
            padding: "6px 10px",
            backgroundColor: "#333",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Add Bookmark
        </button>

      </div>

      {/* ============================ */}
      {/* BOOKMARK LIST SECTION */}
      {/* ============================ */}

      <div style={{ marginTop: "15px" }}>

        {/* Loop through saved bookmarks */}
        {bookmarks.map((bookmark, index) => (
          <div
            key={`bookmark_${index}`}
            onClick={() => goToBookmark(bookmark)}
            // Clicking navigates to saved location
            style={{
              marginTop: "8px",
              padding: "6px",
              background: "#e6e6e6",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {bookmark.name}
          </div>
        ))}

      </div>
    </div>
  );
}

export default BookMark;