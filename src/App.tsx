import { DebugPanel } from "./components/DebugPanel";
import { GameCanvas } from "./components/GameCanvas";

export default function App() {
  return (
    <>
      <GameCanvas />
      <DebugPanel />
    </>
  );
}
