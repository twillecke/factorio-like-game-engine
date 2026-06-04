import { useEffect, useState } from "react";
import { engine } from "../core/Engine";
import { world } from "../core/World";

export function DebugPanel() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [fps, setFps] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setCounts(world.getEntityCounts());
      try { setFps(Math.round(engine.ticker.FPS)); } catch { setFps(null); }
    }, 500);
    return () => clearInterval(id);
  }, []);

  const total = Object.values(counts).reduce((s, n) => s + n, 0);

  return (
    <div style={{
      position: "fixed",
      top: "1rem",
      right: "1rem",
      background: "rgba(0,0,0,0.75)",
      color: "#e0e0e0",
      fontFamily: "monospace",
      fontSize: "12px",
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid rgba(255,255,255,0.1)",
      minWidth: "160px",
      pointerEvents: "none",
      zIndex: 9999,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginBottom: "4px" }}>
        <span style={{ color: "#aaa" }}>entities ({total})</span>
        <span style={{ color: fps !== null && fps < 30 ? "#e74c3c" : "#2ecc71" }}>
          {fps !== null ? `${fps} fps` : "—"}
        </span>
      </div>
      {Object.entries(counts).map(([type, count]) => (
        <div key={type} style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
          <span style={{ color: "#7ec8e3" }}>{type}</span>
          <span>{count}</span>
        </div>
      ))}
    </div>
  );
}
