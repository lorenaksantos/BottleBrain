import { useWindowDimensions } from 'react-native';

/**
 * Returns bottle dimensions that always fit the screen,
 * regardless of device size or number of bottles on the board.
 *
 * Layout logic:
 *  - Bottles sit in a wrapping row, so we work out how many columns
 *    fit naturally (max 4 per row), then size each bottle so that
 *    a full row never overflows the screen width.
 *  - We also cap bottle height so tall phones don't get absurdly big bottles.
 *  - The ball size and gap scale proportionally with the bottle.
 */
export function useBottleLayout(bottleCount: number) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // How many columns will the wrapping grid produce?
  // We prefer 4 per row but drop to 3 if there are very few bottles.
  const columns = bottleCount <= 3 ? bottleCount : 4;

  // Horizontal space: subtract screen padding (18 each side) and gaps between columns
  const HORIZONTAL_PADDING = 36;
  const GAP = 14;
  const totalGapWidth = GAP * (columns - 1);
  const availableWidth = screenWidth - HORIZONTAL_PADDING - totalGapWidth;

  // Each bottle gets an equal share of available width
  const bottleWidth = Math.floor(availableWidth / columns);

  // Height: bottles are taller than wide (roughly 2.5:1 ratio feels good)
  // but cap so they never eat more than ~55% of screen height
  const maxBottleHeight = Math.floor(screenHeight * 0.55);
  const ratioHeight = Math.floor(bottleWidth * 2.6);
  const bottleHeight = Math.min(ratioHeight, maxBottleHeight);

  // Ball size: each bottle holds 4 balls + padding + gaps
  // Work backwards from the bottle interior
  const VERTICAL_PADDING = 32; // top + bottom padding inside bottle
  const BALL_GAP = Math.max(4, Math.floor(bottleWidth * 0.06));
  const interiorHeight = bottleHeight - VERTICAL_PADDING;
  const ballSize = Math.floor((interiorHeight - BALL_GAP * 3) / 4);

  // Border radius scales with width
  const borderRadius = Math.floor(bottleWidth * 0.28);

  return {
    bottleWidth,
    bottleHeight,
    ballSize,
    ballGap: BALL_GAP,
    borderRadius,
    columnGap: GAP,
  };
}