import { useState } from "react";
import { DebugPanel } from "./components/DebugPanel";
import { GameCanvas } from "./components/GameCanvas";
import { Toolbar } from "./components/Toolbar";
import type { ToolType } from "./core/toolTypes";

export default function App() {
  const [tool, setTool] = useState<ToolType>("pipe");
  return (
    <>
      <GameCanvas tool={tool} />
      <Toolbar selected={tool} onSelect={setTool} />
      <DebugPanel />
    </>
  );
}
