import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { RootStackParamList } from '../navigation/types';
import { getLevelBoard, getTotalLevels } from '../game/levels';
import { useBottleBrainGame } from '../game/useBottleBrainGame';
import { useBottleLayout } from '../ui/useBottleLayout';
import { usePlayerProgress } from '../storage/usePlayerProgress';
import { useSounds } from '../hooks/useSounds';
import useRateApp from '../hooks/useRateApp';
import { BottleView } from '../ui/BottleView';
import { LevelCompleteModal } from '../ui/LevelCompleteModal';
import { SkipLevelModal } from '../ui/SkipLevelModal';
import { RateAppModal } from '../ui/RateAppModal';
import { AdMobBanner } from '../ui/AdMobBanner';
import {
  trackLevelStarted,
  trackLevelAbandoned,
  trackLevelCompleted,
  trackSkipTapped,
  trackSkipDismissed,
  trackSkipAdResult,
  trackRemoveAdsTapped,
} from '../analytics/analytics';





type Props = NativeStackScreenProps<RootStackParamList, 'GameBoard'>;

const TOTAL_LEVELS = getTotalLevels();

export function GameBoardScreen({ route, navigation }: Props) {
  const { progress, isLoaded, solveLevel, skipLevel } = usePlayerProgress();
  const level       = route.params?.level ?? progress.currentLevel ?? 1;
  const adsRemoved  = progress.adsRemoved ?? false;
  const isLastLevel = level >= TOTAL_LEVELS;

  const [skipModalVisible, setSkipModalVisible] = React.useState(false);

  const movesMadeRef = React.useRef(0);
  const hasWonRef    = React.useRef(false);

  const { showPrompt, checkAutoPrompt, rateNow, dismiss } = useRateApp();

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: `Level ${level}` });
  }, [level, navigation]);

  React.useEffect(() => {
    movesMadeRef.current = 0;
    hasWonRef.current    = false;
    trackLevelStarted(level);
  }, [level]);

  React.useEffect(() => {
    return () => {
      if (!hasWonRef.current) {
        trackLevelAbandoned(level, movesMadeRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const initialBoard = React.useMemo(() => getLevelBoard(level), [level]);
  const sounds       = useSounds();

  const game = useBottleBrainGame({
    initialBoard,
    onValidMove: () => {
      sounds.playMove();
      movesMadeRef.current += 1;
    },
    onInvalidMove: sounds.playInvalid,
    onSelect:      sounds.playSelect,
    onWin:         sounds.playComplete,
  });

  React.useEffect(() => {
    hasWonRef.current = game.hasWon;
  }, [game.hasWon]);

  const layout = useBottleLayout(game.board.length);

  // When player wins — persist + track + check rate prompt
  React.useEffect(() => {
    if (!game.hasWon || !isLoaded) return;
    trackLevelCompleted(level, movesMadeRef.current);
    solveLevel(level).catch(() => {});
    checkAutoPrompt(level); // triggers rate modal if level === 5
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.hasWon]);

  const goToLevel = React.useCallback(
    (nextLevel: number) => navigation.replace('GameBoard', { level: nextLevel }),
    [navigation],
  );

  const onNextLevel = React.useCallback(() => {
    if (isLastLevel) goToLevel(1);
    else goToLevel(level + 1);
  }, [level, isLastLevel, goToLevel]);

  const onReplay = React.useCallback(() => {
    movesMadeRef.current = 0;
    game.reset();
  }, [game]);

  const onSkipButtonPress = React.useCallback(() => {
    trackSkipTapped(level, movesMadeRef.current);
    setSkipModalVisible(true);
  }, [level]);

  const onSkipConfirmed = React.useCallback(async () => {
    trackSkipAdResult(level, true);
    setSkipModalVisible(false);
    await skipLevel(level);
    goToLevel(level + 1);
  }, [level, skipLevel, goToLevel]);

  const onSkipDismiss = React.useCallback((watchedAd: boolean) => {
    if (watchedAd) trackSkipAdResult(level, false);
    else trackSkipDismissed(level);
    setSkipModalVisible(false);
  }, [level]);

  const onRemoveAdsTapped = React.useCallback(() => {
    trackRemoveAdsTapped('skip_modal');
    setSkipModalVisible(false);
  }, []);

  const showBanner = isLoaded && !game.hasWon && !adsRemoved;

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F0FF' }}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', top: -90, left: -60,
          width: 260, height: 260, borderRadius: 130,
          backgroundColor: 'rgba(109, 75, 255, 0.18)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', bottom: -120, right: -80,
          width: 320, height: 320, borderRadius: 160,
          backgroundColor: 'rgba(111, 204, 255, 0.18)',
        }}
      />

      <View
        style={{
          flex: 1,
          paddingTop: 14,
          paddingHorizontal: 18,
          paddingBottom: showBanner ? 50 : 14,
          gap: 12,
        }}
      >
        {/* Top bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <Text
            style={{ flex: 1, fontSize: 13, color: '#4a3b7a', fontWeight: '700' }}
            numberOfLines={1}
          >
            Tap a bottle, then tap a destination.
          </Text>
          <TopBarButton onPress={onReplay} label="Replay" />
          {level > 1 && !isLastLevel && (
            <TopBarButton onPress={onSkipButtonPress} label="Skip" accent />
          )}
        </View>

        {/* Game board */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: layout.columnGap,
              justifyContent: 'center',
              maxWidth: '100%',
            }}
          >
            {game.board.map((bottleColors, idx) => {
              const ids   = game.ballIdBoard[idx] ?? [];
              const balls = bottleColors.map((color, ballIdx) => ({
                id: ids[ballIdx] ?? `fallback-${idx}-${ballIdx}-${color}`,
                color,
              }));
              return (
                <BottleView
                  key={idx}
                  balls={balls}
                  isSelected={game.selectedBottleIdx === idx}
                  onPress={() => game.onTapBottle(idx)}
                  shakeKey={game.invalidMovePulseKey}
                  shouldShake={game.shakeBottleIdx === idx}
                  bottleWidth={layout.bottleWidth}
                  bottleHeight={layout.bottleHeight}
                  ballSize={layout.ballSize}
                  ballGap={layout.ballGap}
                  borderRadius={layout.borderRadius}
                />
              );
            })}
          </View>
        </View>

        <LevelCompleteModal
          visible={game.hasWon}
          onNextLevel={onNextLevel}
          onReplay={onReplay}
          movesMade={movesMadeRef.current}
          isLastLevel={isLastLevel}
        />

        <SkipLevelModal
          visible={skipModalVisible}
          onSkip={onSkipConfirmed}
          onDismiss={onSkipDismiss}
          onRemoveAdsTapped={onRemoveAdsTapped}
        />

        {/* Rate prompt — shown once after level 5 */}
        <RateAppModal
          visible={showPrompt}
          onRateNow={rateNow}
          onDismiss={dismiss}
        />
      </View>

      {showBanner ? (
        <View style={{ height: 50, width: '100%', justifyContent: 'center' }}>
          <AdMobBanner />
        </View>
      ) : null}
    </View>
  );
}

function TopBarButton({
  label, onPress, accent = false,
}: {
  label: string;
  onPress: () => void;
  accent?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: accent
          ? pressed ? '#6d4bff' : '#7a5cff'
          : pressed ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.35)',
        borderWidth: 1,
        borderColor: accent ? '#5a3de0' : 'rgba(255,255,255,0.65)',
      })}
    >
      <Text style={{ fontWeight: '800', fontSize: 13, color: accent ? '#fff' : '#2b1a66' }}>
        {label}
      </Text>
    </Pressable>
  );
}

