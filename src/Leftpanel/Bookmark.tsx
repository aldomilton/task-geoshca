import { Map } from "ol";
import { useState } from "react";

interface BookMarkProps {
  olMapview: Map | null;
}

interface BookmarkType {
  name: string;
  center: number[];
  zoom: number;
}

function BookMark({ olMapview }: BookMarkProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [bookmarkName, setBookmarkName] = useState<string>("");

  const addBookmark = () => {
    if (!olMapview || !bookmarkName) return;

    const view = olMapview.getView();
    const center = view.getCenter() || [0, 0];
    const zoom = view.getZoom() || 0;

    const newBookmark: BookmarkType = {
      name: bookmarkName,
      center,
      zoom,
    };

    setBookmarks([...bookmarks, newBookmark]);
    setBookmarkName("");
  };

  const goToBookmark = (bookmark: BookmarkType) => {
    if (!olMapview) return;

    olMapview.getView().animate({
      center: bookmark.center,
      zoom: bookmark.zoom,
      duration: 1000,
    });
  };

  return (
    <div>
      {/* Input + Button Same Row */}
      <div style={{ display: "flex", gap: "5px" }}>
        <input
          type="text"
          value={bookmarkName}
          onChange={(e) => setBookmarkName(e.target.value)}
          placeholder="Bookmark Name"
          style={{
            flex: 1,
            padding: "6px",
            backgroundColor: "#333",
            color: "white",
            border: "none",
          }}
        />

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

      {/* Bookmark List */}
      <div style={{ marginTop: "15px" }}>
        {bookmarks.map((bookmark, index) => (
          <div
            key={`bookmark_${index}`}
            onClick={() => goToBookmark(bookmark)}
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