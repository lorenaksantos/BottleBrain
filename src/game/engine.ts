import type { BallColor, Board } from './types';

export const BOTTLE_CAPACITY = 4;

export function topBall(bottle: BallColor[]): BallColor | undefined {
  return bottle[bottle.length - 1];
}

export function isValidMove(board: Board, fromIdx: number, toIdx: number) {
  if (fromIdx === toIdx) return false;
  const from = board[fromIdx];
  const to = board[toIdx];
  if (!from || !to) return false;
  if (from.length === 0) return false;
  if (to.length >= BOTTLE_CAPACITY) return false;

  const moving = topBall(from);
  if (!moving) return false;
  const destTop = topBall(to);
  return to.length === 0 || destTop === moving;
}

export function moveOneBall(board: Board, fromIdx: number, toIdx: number): Board {
  if (!isValidMove(board, fromIdx, toIdx)) return board;

  const next: Board = board.map((b) => [...b]);
  const moving = next[fromIdx].pop();
  if (moving == null) return board;
  next[toIdx].push(moving);
  return next;
}

export function isBottleSolved(bottle: BallColor[]): boolean {
  if (bottle.length === 0) return true;
  if (bottle.length !== BOTTLE_CAPACITY) return false;
  const first = bottle[0];
  return bottle.every((c) => c === first);
}

export function checkWin(board: Board): boolean {
  return board.every((bottle) => isBottleSolved(bottle));
}

