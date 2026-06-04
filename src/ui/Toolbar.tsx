import type { AssetType } from "../entities/assetTypes";
import { ASSET_DEFS, ASSET_LIST } from "../entities/registry";

interface ToolbarProps {
  selected: AssetType | null;
  onSelect: (asset: AssetType) => void;
}

export function Toolbar({ selected, onSelect }: ToolbarProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 8,
        background: "rgba(0,0,0,0.6)",
        borderRadius: 8,
        padding: "8px 12px",
        pointerEvents: "auto",
        userSelect: "none",
      }}
    >
      {ASSET_LIST.map((id) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          style={{
            padding: "6px 16px",
            borderRadius: 6,
            border: selected === id ? "2px solid #fff" : "2px solid transparent",
            background: selected === id ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
            color: "#fff",
            fontWeight: selected === id ? "bold" : "normal",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {ASSET_DEFS[id].label}
        </button>
      ))}
    </div>
  );
}
