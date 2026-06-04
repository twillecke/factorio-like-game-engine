import { useEffect, useState } from "react";
import { DebugPanel } from "./ui/DebugPanel";
import { GameCanvas } from "./ui/GameCanvas";
import { Toolbar } from "./ui/Toolbar";
import type { AssetType } from "./entities/assetTypes";

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
