#!/usr/bin/env node
/**
 * generateLevels.js
 *
 * Run this ONCE from your project root:
 *   node scripts/generateLevels.js
 *
 * It generates all 50 levels using the same logic as the old runtime
 * generator, then writes the result to src/game/levels.json.
 *
 * Commit levels.json to git. Every device will then get identical levels.
 * To update levels in the future: tweak the config below and re-run.
 */

const fs   = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Config — must match src/game/levels.ts rangeConfig
// ---------------------------------------------------------------------------
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'teal'];
const TOTAL_LEVELS = 50;

function rangeConfig(level) {
  if (level <= 2)  return { colorsCount: 2, totalBottles: 3 };
  if (level <= 5)  return { colorsCount: 3, totalBottles: 4 };
  if (level <= 10) return { colorsCount: 4, totalBottles: 5 };
  if (level <= 20) return { colorsCount: 5, totalBottles: 6 };
  if (level <= 35) return { colorsCount: 6, totalBottles: 7 };
  return           { colorsCount: 6, totalBottles: 8 };
}

// ---------------------------------------------------------------------------
// Seeded RNG
// ---------------------------------------------------------------------------
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Fisher-Yates shuffle
// ---------------------------------------------------------------------------
function shuffleArray(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Build a shuffled board (all bottles exactly full or empty)
// ---------------------------------------------------------------------------
function buildShuffledBoard(colorsCount, totalBottles, rng) {
  const allBalls = [];
  for (let c = 0; c < colorsCount; c++) {
    for (let i = 0; i < 4; i++) allBalls.push(COLORS[c]);
  }
  const shuffled = shuffleArray(allBalls, rng);
  const board = [];
  for (let b = 0; b < colorsCount; b++) {
    board.push(shuffled.slice(b * 4, b * 4 + 4));
  }
  for (let e = colorsCount; e < totalBottles; e++) board.push([]);
  return board;
}

// ---------------------------------------------------------------------------
// Shuffle quality — reject if any bottle has 3+ of the same color
// ---------------------------------------------------------------------------
function isWellShuffled(board) {
  for (const bottle of board) {
    if (bottle.length === 0) continue;
    const counts = {};
    for (const ball of bottle) {
      counts[ball] = (counts[ball] ?? 0) + 1;
      if (counts[ball] >= 3) return false;
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// Engine helpers (mirrors engine.ts)
// ---------------------------------------------------------------------------
function topBall(bottle) {
  return bottle[bottle.length - 1];
}

function isValidMove(board, fromIdx, toIdx) {
  if (fromIdx === toIdx) return false;
  const from = board[fromIdx];
  const to   = board[toIdx];
  if (!from || !to) return false;
  if (from.length === 0) return false;
  if (to.length >= 4) return false;
  const moving  = topBall(from);
  const destTop = topBall(to);
  return to.length === 0 || destTop === moving;
}

function moveOneBall(board, fromIdx, toIdx) {
  if (!isValidMove(board, fromIdx, toIdx)) return board;
  const next = board.map(b => [...b]);
  const ball = next[fromIdx].pop();
  next[toIdx].push(ball);
  return next;
}

// ---------------------------------------------------------------------------
// BFS solvability check
// ---------------------------------------------------------------------------
function isSolvable(initialBoard) {
  const serialize = b => b.map(bottle => bottle.join(',')).join('|');
  const isWon = b => b.every(
    bottle => bottle.length === 0 ||
      (bottle.length === 4 && bottle.every(ball => ball === bottle[0]))
  );

  if (isWon(initialBoard)) return true;

  const visited = new Set();
  const queue   = [initialBoard];
  let head      = 0;
  visited.add(serialize(initialBoard));

  while (head < queue.length && visited.size < 60000) {
    const current = queue[head++];
    if (isWon(current)) return true;
    for (let from = 0; from < current.length; from++) {
      for (let to = 0; to < current.length; to++) {
        if (from === to) continue;
        if (!isValidMove(current, from, to)) continue;
        const next = moveOneBall(current, from, to);
        const key  = serialize(next);
        if (visited.has(key)) continue;
        visited.add(key);
        queue.push(next);
      }
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Generate one level
// ---------------------------------------------------------------------------
function generateLevel(level) {
  const { colorsCount, totalBottles } = rangeConfig(level);

  // Primary: enforce all quality rules
  for (let attempt = 0; attempt < 100; attempt++) {
    const rng   = mulberry32(1000 + level * 1337 + attempt * 999983);
    const board = buildShuffledBoard(colorsCount, totalBottles, rng);
    const empties = board.filter(b => b.length === 0).length;
    if (empties < 1) continue;
    if (!isWellShuffled(board)) continue;
    if (isSolvable(board)) return board;
  }

  // Fallback: relax shuffle quality, still require solvability
  for (let attempt = 0; attempt < 50; attempt++) {
    const rng   = mulberry32(9999 + level * 7331 + attempt * 123457);
    const board = buildShuffledBoard(colorsCount, totalBottles, rng);
    const empties = board.filter(b => b.length === 0).length;
    if (empties < 1) continue;
    if (isSolvable(board)) return board;
  }

  // Last resort: solved board (should never happen)
  const solvedBoard = [];
  for (let c = 0; c < colorsCount; c++) {
    solvedBoard.push([COLORS[c], COLORS[c], COLORS[c], COLORS[c]]);
  }
  for (let e = colorsCount; e < totalBottles; e++) solvedBoard.push([]);
  return solvedBoard;
}

// ---------------------------------------------------------------------------
// Generate all levels and write JSON
// ---------------------------------------------------------------------------
console.log(`Generating ${TOTAL_LEVELS} levels...\n`);

const levels = [];
for (let i = 1; i <= TOTAL_LEVELS; i++) {
  process.stdout.write(`  Level ${String(i).padStart(2, '0')}/${TOTAL_LEVELS}... `);
  const board = generateLevel(i);
  levels.push(board);
  console.log(`✓  (${board.length} bottles)`);
}

const outPath = path.join(__dirname, '..', 'src', 'game', 'levels.json');
fs.writeFileSync(outPath, JSON.stringify(levels, null, 2), 'utf8');

console.log(`\n✅  Written to ${outPath}`);
console.log(`    Commit this file to git — levels are now deterministic on every device.`);
