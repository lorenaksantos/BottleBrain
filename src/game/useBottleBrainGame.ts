import * as React from 'react';

import { checkWin } from './engine';
import type { Board } from './types';

type Params = {
  initialBoard: Board;
  // Sound callbacks — all optional so the hook works without sounds too
  onValidMove?:   () => void;
  onInvalidMove?: () => void;
  onSelect?:      () => void;
  onWin?:         () => void;
};

export function useBottleBrainGame({
  initialBoard,
  onValidMove,
  onInvalidMove,
  onSelect,
  onWin,
}: Params) {
  const [board, setBoard] = React.useState<Board>(initialBoard);
  const [ballIdBoard, setBallIdBoard] = React.useState<string[][]>(() =>
    initialBoard.map((bottle, bottleIdx) =>
      bottle.map(
        (_, ballIdx) =>
          `b${bottleIdx}-i${ballIdx}-${Math.random().toString(16).slice(2)}`,
      ),
    ),
  );
  const [selectedBottleIdx, setSelectedBottleIdx] = React.useState<number | null>(null);
  const [hasWon, setHasWon] = React.useState(false);
  const [invalidMovePulseKey, setInvalidMovePulseKey] = React.useState(0);
  const [shakeBottleIdx, setShakeBottleIdx] = React.useState<number | null>(null);

  const reset = React.useCallback(() => {
    setBoard(initialBoard);
    setSelectedBottleIdx(null);
    setHasWon(false);
    setInvalidMovePulseKey((k) => k + 1);
    setShakeBottleIdx(null);
    setBallIdBoard(
      initialBoard.map((bottle, bottleIdx) =>
        bottle.map(
          (_, ballIdx) =>
            `b${bottleIdx}-i${ballIdx}-${Date.now().toString(16)}-${Math.random()
              .toString(16)
              .slice(2)}`,
        ),
      ),
    );
  }, [initialBoard]);

  const onTapBottle = React.useCallback(
    (idx: number) => {
      if (hasWon) return;

      // First tap — select a bottle
      if (selectedBottleIdx == null) {
        if (board[idx]?.length) {
          setSelectedBottleIdx(idx);
          onSelect?.();          // 🔊 select sound
        }
        setShakeBottleIdx(null);
        return;
      }

      // Tap same bottle — deselect silently
      if (selectedBottleIdx === idx) {
        setSelectedBottleIdx(null);
        setShakeBottleIdx(null);
        return;
      }

      const fromIdx = selectedBottleIdx;
      const toIdx   = idx;
      const from    = board[fromIdx];
      const to      = board[toIdx];

      const sourceNotEmpty  = from && from.length > 0;
      const destNotFull     = to && to.length < 4;
      const movingColor     = sourceNotEmpty ? from[from.length - 1] : undefined;
      const destTopColor    = to && to.length > 0 ? to[to.length - 1] : undefined;
      const colorMatch      =
        to && to.length === 0
          ? true
          : movingColor != null &&
            destTopColor != null &&
            movingColor === destTopColor;

      const isValid =
        sourceNotEmpty &&
        destNotFull &&
        colorMatch &&
        fromIdx !== toIdx &&
        !!from &&
        !!to;

      if (!isValid) {
        setSelectedBottleIdx(null);
        setShakeBottleIdx(fromIdx);
        setInvalidMovePulseKey((k) => k + 1);
        onInvalidMove?.();       // 🔊 invalid sound
        return;
      }

      // Valid move — update board
      const nextBoard: Board     = board.map((bottle) => [...bottle]);
      const nextBallIds: string[][] = ballIdBoard.map((ids) => [...ids]);

      const movedColor = nextBoard[fromIdx].pop();
      const movedId    = nextBallIds[fromIdx].pop();

      if (movedColor == null || movedId == null) {
        setSelectedBottleIdx(null);
        return;
      }

      nextBoard[toIdx].push(movedColor);
      nextBallIds[toIdx].push(movedId);

      setBoard(nextBoard);
      setBallIdBoard(nextBallIds);
      setSelectedBottleIdx(null);
      setShakeBottleIdx(null);

      onValidMove?.();           // 🔊 move sound

      const won = checkWin(nextBoard);
      setHasWon(won);
      if (won) onWin?.();        // 🔊 complete sound
    },
    [board, ballIdBoard, hasWon, selectedBottleIdx, onValidMove, onInvalidMove, onSelect, onWin],
  );

  return {
    board,
    ballIdBoard,
    selectedBottleIdx,
    hasWon,
    invalidMovePulseKey,
    shakeBottleIdx,
    reset,
    onTapBottle,
  };
}
