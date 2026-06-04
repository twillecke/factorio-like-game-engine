import { useEffect, useState } from "react";
import { DebugPanel } from "./components/DebugPanel";
import { GameCanvas } from "./components/GameCanvas";
import { Toolbar } from "./components/Toolbar";
import type { AssetType } from "./core/assetTypes";

export default function App() {
  const [tool, setTool] = useState<AssetType | null>("pipe");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTool(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <GameCanvas tool={tool} />
      <Toolbar selected={tool} onSelect={setTool} />
      <DebugPanel />
    </>
  );
}
