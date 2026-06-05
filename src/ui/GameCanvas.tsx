import { useEffect, useRef } from "react";
import type { AssetType } from "../entities/assetTypes";
import { type GameHandle, initGame } from "../core/initGame";

interface GameCanvasProps {
  tool: AssetType | null;
}

export function GameCanvas({ tool }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameHandle | null>(null);

  useEffect(() => {
    const game = initGame(containerRef.current!);
    gameRef.current = game;
    return () => {
      gameRef.current = null;
      game.destroy();
    };
  }, []);

  useEffect(() => {
    gameRef.current?.placement?.setTool(tool);
  }, [tool]);

  return <div ref={containerRef} style={{ display: "block" }} />;
}
