import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BeachMatch3D, { type FieldSet, type MatchAction } from './BeachMatch3D';
import {
  type GestureResponderEvent,
  type LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  type DimensionValue,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Defs, Ellipse, Line, LinearGradient, Path, Polygon, Rect, Stop, Text as SvgText } from 'react-native-svg';

const C = {
  ink: '#061426',
  deep: '#0B192C',
  card: '#0E1C2F',
  cardLight: '#142A43',
  mint: '#00F0FF',
  cream: '#F3F5F8',
  muted: '#9BAEC2',
  sand: '#D7B274',
  coral: '#FF7A00',
  white: '#FFFFFF',
  line: '#1E3553',
};
const WINDOW_MS = 1450;
const SWEET_SPOT_MS = 890;
const BOWLER_RUN_UP_MS = 760;
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const currentTimestamp = () => Date.now();
const isUserBatting = (match: Pick<Match, 'innings' | 'userBatFirst'>) => match.innings === 1 ? match.userBatFirst : !match.userBatFirst;
const battingTeamForMatch = (match: Pick<Match, 'innings' | 'userBatFirst' | 'team' | 'opponent'>) => isUserBatting(match) ? match.team : match.opponent;
const bowlingTeamForMatch = (match: Pick<Match, 'innings' | 'userBatFirst' | 'team' | 'opponent'>) => isUserBatting(match) ? match.opponent : match.team;
const activeStrikerForMatch = (match: Pick<Match, 'innings' | 'userBatFirst'>) => isUserBatting(match) ? 'Aarav Mehta' : 'Kai Morgan';
const FORMAT_OPTIONS = [
  { overs: 5, title: 'QUICK BLITZ', pace: 'FAST PACED', note: '4–6 min sprint · explosive boundary play', venue: 'Sunset Shoreline', pitch: 'Dry sand · high, true bounce' },
  { overs: 10, title: 'COASTAL BLAST', pace: 'FAN FAVORITE', note: 'Balanced boundary chase · spin in the breeze', venue: 'Palm Cove', pitch: 'Firm sand · standard bounce' },
  { overs: 20, title: 'T20 BEACH CUP', pace: 'COMPETITIVE', note: 'Strategic field changes · sea-wind swing', venue: 'Ocean Cliff', pitch: 'Sharp swing · lively bounce' },
  { overs: 30, title: 'CLASSIC CHALLENGE', pace: 'ENDURANCE', note: 'Rotate the strike · build a long partnership', venue: 'Lagoon Bay', pitch: 'Moist sand · variable bounce' },
  { overs: 50, title: 'GRAND ODI SERIES', pace: 'PRO MARATHON', note: 'Long-form coastal cricket · shifting tide', venue: 'Pacific Head', pitch: 'Heavy sand · dynamic tide' },
] as const;
const TEAMS = ['India', 'Australia', 'Sri Lanka', 'New Zealand', 'England'];
const VENUES = ['Palm Cove', 'Coral Bay', 'Sunset Shore'];
const LINEUP_HOME = [
  ['Aarav Mehta', 'BAT', 88], ['Dev Sharma', 'BAT', 83], ['Kabir Rao', 'AR', 81], ['Ishaan Nair', 'WK', 79], ['Rohan Iyer', 'BAT', 77], ['Arjun Das', 'AR', 76],
  ['Neel Kapoor', 'BOWL', 86], ['Vihaan Sen', 'BOWL', 82], ['Nikhil Bose', 'BOWL', 80], ['Tara Nair', 'BOWL', 74], ['Mira Patel', 'AR', 78],
] as const;
const LINEUP_AWAY = [
  ['Kai Morgan', 'BAT', 87], ['Lucas Vale', 'WK', 82], ['Noah Bennett', 'BAT', 80], ['Riley Hart', 'BAT', 79], ['Sam Ellis', 'AR', 78], ['Owen Brooks', 'AR', 77],
  ['Ethan Shaw', 'BOWL', 85], ['Flynn Ward', 'BOWL', 83], ['Max Cooper', 'BOWL', 81], ['Hayden Ross', 'BOWL', 76], ['Leo King', 'AR', 74],
] as const;
const FIELD_ROSTER = [
  ['A. MEHTA', 88, 'SQUARE LEG'], ['D. SHARMA', 83, 'MID OFF'], ['K. RAO', 81, 'COVER'],
  ['I. NAIR', 79, 'SLIP'], ['R. IYER', 77, 'LONG ON'], ['N. KAPOOR', 86, 'DEEP MIDWICKET'],
] as const;
const SHOTS = [
  { id: 'defend', label: 'Defend', icon: '🛡', risk: 0.02 },
  { id: 'drive', label: 'Drive', icon: '↗', risk: 0.08 },
  { id: 'pull', label: 'Pull', icon: '↔', risk: 0.1 },
  { id: 'loft', label: 'Loft', icon: '✦', risk: 0.2 },
] as const;
type ShotId = (typeof SHOTS)[number]['id'];
type Screen = 'home' | 'tournament' | 'format' | 'toss' | 'lineup' | 'match' | 'field' | 'lab' | 'squad' | 'settings';
type Status = 'live' | 'break' | 'complete';
type Delivery = {
  startedAt: number;
  runUpStartedAt: number;
  line: string;
  length: string;
  pace: number;
  targetX?: number;
  targetZ?: number;
  swing?: 'NONE' | 'IN' | 'AWAY';
  variation?: SwingDirection;
};
type StrokeStyle = 'LOFT' | 'PUSH' | 'STROKE';
type Footwork = 'BACK FOOT' | 'LEAVE' | 'SPECIAL' | 'FRONT FOOT';
type SwingDirection = 'STRAIGHT' | 'IN SWING' | 'OUT SWING' | 'REVERSE SWING' | 'SLOWER' | 'OFF CUTTER' | 'LEG CUTTER';
type PitchTarget = { x: number; depth: number };
type StickPosition = { x: number; y: number };
const BOWLING_VARIATIONS: SwingDirection[] = ['STRAIGHT', 'IN SWING', 'OUT SWING', 'REVERSE SWING', 'SLOWER', 'OFF CUTTER', 'LEG CUTTER'];
const flightSwingFor = (variation: SwingDirection): 'NONE' | 'IN' | 'AWAY' => {
  if (variation === 'IN SWING' || variation === 'LEG CUTTER') return 'IN';
  if (variation === 'OUT SWING' || variation === 'REVERSE SWING' || variation === 'OFF CUTTER') return 'AWAY';
  return 'NONE';
};
type Match = {
  status: Status;
  innings: 1 | 2;
  oversLimit: number;
  legalBalls: number;
  score: number;
  wickets: number;
  firstScore: number | null;
  firstTopScorer: string | null;
  firstTopScorerRuns: number;
  topScorer: string | null;
  topScorerRuns: number;
  target: number | null;
  team: string;
  opponent: string;
  userBatFirst: boolean;
  venue: string;
  delivery: Delivery | null;
  recent: string[];
  winner: string | null;
  difficulty: string;
};

function FieldArt({ compact = false }: { compact?: boolean }) {
  return (
    <Svg viewBox="0 0 360 220" width="100%" height={compact ? 152 : 212}>
      <Ellipse cx="182" cy="200" rx="170" ry="106" fill="#8F7A4E" opacity="0.38" />
      <Ellipse cx="180" cy="184" rx="166" ry="104" fill="#C8AB6C" />
      <Ellipse cx="180" cy="171" rx="139" ry="82" fill="#6D9D62" />
      <Ellipse cx="180" cy="165" rx="121" ry="69" fill="#82AD6A" />
      <Ellipse cx="180" cy="159" rx="18" ry="40" fill="#CBB27A" />
      <Rect x="171" y="126" width="18" height="67" rx="3" fill="#D9C28B" />
      <Line x1="172" y1="136" x2="188" y2="136" stroke="#F7E8B7" strokeWidth="1.5" />
      <Line x1="172" y1="184" x2="188" y2="184" stroke="#F7E8B7" strokeWidth="1.5" />
      <Path d="M70 166 C106 121 252 113 292 167" fill="none" stroke="#E4D29F" strokeWidth="1.5" strokeDasharray="4 5" opacity="0.9" />
      <Path d="M25 175 C64 87 119 63 180 62 C242 63 301 88 335 175" fill="none" stroke="#F0D58D" strokeWidth="2" opacity="0.82" />
      <Polygon points="178,36 184,39 182,58 177,56" fill="#73563A" />
      <Path d="M179 40 Q166 27 157 34 Q165 21 178 33 Q181 18 193 20 Q185 29 182 38 Q196 30 203 37 Q191 35 182 43" fill="#3A6048" />
      <Polygon points="305,72 310,75 308,92 303,90" fill="#73563A" />
      <Path d="M306 76 Q296 65 288 71 Q295 59 305 70 Q308 57 318 58 Q311 66 309 74 Q320 67 326 73 Q317 72 309 79" fill="#3A6048" />
      <Circle cx="111" cy="122" r="5.5" fill="#F8F2DF" />
      <Circle cx="248" cy="130" r="5.5" fill="#F8F2DF" />
      <Circle cx="82" cy="168" r="5.5" fill="#F8F2DF" />
      <Circle cx="279" cy="175" r="5.5" fill="#F8F2DF" />
      <Circle cx="181" cy="97" r="5.5" fill="#F8F2DF" />
      <Circle cx="146" cy="179" r="5.5" fill="#F8F2DF" />
      <Circle cx="213" cy="177" r="5.5" fill="#F8F2DF" />
      <Circle cx="180" cy="151" r="4" fill="#FF8066" />
      <Circle cx="180" cy="197" r="3.5" fill="#F8F2DF" />
      <Line x1="174" y1="198" x2="186" y2="198" stroke="#F8F2DF" strokeWidth="2" />
      <Line x1="176" y1="194" x2="176" y2="201" stroke="#F8F2DF" strokeWidth="1.5" />
      <Line x1="180" y1="194" x2="180" y2="201" stroke="#F8F2DF" strokeWidth="1.5" />
      <Line x1="184" y1="194" x2="184" y2="201" stroke="#F8F2DF" strokeWidth="1.5" />
    </Svg>
  );
}

function MenuArenaArt() {
  return (
    <Svg viewBox="0 0 420 230" width="100%" height="100%">
      <Defs>
        <LinearGradient id="menuSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#102944" />
          <Stop offset="0.58" stopColor="#5D5360" />
          <Stop offset="1" stopColor="#F07A3C" />
        </LinearGradient>
        <LinearGradient id="menuTurf" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#537C55" />
          <Stop offset="1" stopColor="#173B36" />
        </LinearGradient>
      </Defs>
      <Rect width="420" height="230" fill="url(#menuSky)" />
      <Circle cx="320" cy="70" r="38" fill="#FF9A4F" opacity="0.9" />
      <Path d="M0 105 Q90 90 164 106 T318 101 T420 108 V145 H0Z" fill="#213A49" />
      <Path d="M0 116 L47 71 L84 111 L135 57 L176 113 L230 66 L276 112 L334 51 L381 111 L420 78 V150 H0Z" fill="#152A3B" opacity="0.92" />
      <Path d="M0 126 H420 M0 139 H420" stroke="#00F0FF" strokeWidth="2" opacity="0.62" />
      <Path d="M0 146 Q210 126 420 146 V230 H0Z" fill="url(#menuTurf)" />
      <Ellipse cx="225" cy="206" rx="156" ry="23" fill="#D7B274" opacity="0.34" />
      <Path d="M150 230 Q214 170 283 230" fill="#D7B274" />
      <Path d="M174 230 Q215 191 259 230" fill="#F0D69D" opacity="0.64" />
      <Path d="M170 166 Q215 150 264 166" fill="none" stroke="#E8D6A7" strokeWidth="2" opacity="0.8" />
      <Path d="M58 145 V103 M58 103 L42 77 M58 103 L76 76 M58 104 L31 95 M58 104 L84 93" stroke="#18382E" strokeWidth="5" strokeLinecap="round" />
      <Path d="M94 144 V113 M94 113 L81 92 M94 113 L109 89 M94 113 L72 106 M94 113 L116 101" stroke="#234430" strokeWidth="4" strokeLinecap="round" />
      <Circle cx="302" cy="147" r="10" fill="#111B2C" />
      <Path d="M291 160 Q303 151 314 161 L320 191 L285 191Z" fill="#00A6D6" />
      <Path d="M291 165 L276 184 M314 164 L331 179" stroke="#E7B88A" strokeWidth="7" strokeLinecap="round" />
      <Path d="M294 190 L289 216 M313 190 L322 215" stroke="#101B2B" strokeWidth="9" strokeLinecap="round" />
      <Path d="M329 154 L344 130 L349 132 L337 160" stroke="#E1C28D" strokeWidth="5" strokeLinecap="round" />
      <Circle cx="160" cy="176" r="3" fill="#FF7A00" />
      <Path d="M164 176 Q181 164 196 171" fill="none" stroke="#FF7A00" strokeWidth="2" opacity="0.8" />
      <Path d="M0 176 Q60 160 118 176 M350 178 Q386 162 420 176" stroke="#9DD3A1" strokeWidth="1" opacity="0.38" />
    </Svg>
  );
}

function StatBlock({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text numberOfLines={1} style={styles.statDetail}>{detail}</Text>
    </View>
  );
}

function ModeCard({ number, title, detail, accent, tag, onPress }: { number: string; title: string; detail: string; accent: string; tag: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.modeCard}>
      <View style={styles.modeCardHead}><Text style={[styles.modeCardNumber, { color: accent }]}>{number}</Text><Text style={styles.modeCardArrow}>↗</Text></View>
      <Text style={styles.modeCardTitle}>{title}</Text>
      <Text style={styles.modeCardDetail}>{detail}</Text>
      <View style={[styles.modeCardRule, { backgroundColor: accent }]} />
      <Text numberOfLines={1} style={[styles.modeCardTag, { color: accent }]}>{tag}</Text>
    </Pressable>
  );
}

function QuickBarItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.quickBarItem}>
      <Text style={styles.quickBarIcon}>{icon}</Text>
      <Text numberOfLines={1} style={styles.quickBarLabel}>{label}</Text>
    </Pressable>
  );
}

const FIELD_MAP_POINTS: Record<FieldSet, [number, number][]> = {
  'ATTACKING 1': [[15, 26], [22, 14], [42, 12], [51, 25], [45, 48], [18, 46]],
  'ATTACKING 2': [[10, 33], [25, 14], [38, 16], [55, 31], [44, 52], [15, 47]],
  DEFENSIVE: [[8, 31], [20, 10], [43, 9], [57, 30], [43, 55], [18, 54]],
};

function MiniMap({ fieldSet = 'ATTACKING 1' }: { fieldSet?: FieldSet }) {
  return (
    <Svg width={58} height={58} viewBox="0 0 64 64">
      <Circle cx="32" cy="32" r="29" fill="rgba(45,91,62,0.88)" stroke="rgba(226,240,210,0.7)" strokeWidth="1.5" />
      <Circle cx="32" cy="32" r="19" fill="none" stroke="rgba(225,237,209,0.32)" strokeWidth="1" />
      <Rect x="28" y="19" width="8" height="26" rx="2" fill="#C6A875" stroke="#E7D8AF" strokeWidth="1" />
      <Line x1="25" y1="22" x2="39" y2="22" stroke="#FFF7DD" strokeWidth="1" />
      <Line x1="25" y1="42" x2="39" y2="42" stroke="#FFF7DD" strokeWidth="1" />
      {FIELD_MAP_POINTS[fieldSet].map(([cx, cy], index) => (
        <Circle key={index} cx={cx} cy={cy} r="1.8" fill="#39E1C8" />
      ))}
      <Circle cx="32" cy="32" r="2.2" fill="#FFE082" />
    </Svg>
  );
}

function FieldPlanMap({ fieldSet }: { fieldSet: FieldSet }) {
  return (
    <Svg viewBox="0 0 300 300" width="100%" height="100%">
      <Circle cx="150" cy="150" r="137" fill="#204C3A" stroke="#D7B274" strokeWidth="3" />
      <Circle cx="150" cy="150" r="111" fill="none" stroke="#9BC17C" strokeWidth="1.5" strokeDasharray="4 5" />
      <Circle cx="150" cy="150" r="74" fill="none" stroke="#8BB576" strokeWidth="1" />
      <Rect x="137" y="99" width="26" height="102" rx="5" fill="#C6A875" stroke="#E7D8AF" strokeWidth="2" />
      <Line x1="130" y1="108" x2="170" y2="108" stroke="#FFF7DD" strokeWidth="2" />
      <Line x1="130" y1="192" x2="170" y2="192" stroke="#FFF7DD" strokeWidth="2" />
      {FIELD_MAP_POINTS[fieldSet].map(([px, py], index) => {
        const x = px * 3;
        const y = py * 3;
        return <Circle key={index} cx={x} cy={y} r="8" fill="#00F0FF" stroke="#061426" strokeWidth="2" />;
      })}
      <Circle cx="150" cy="150" r="5" fill="#FF7A00" />
      <SvgText x="150" y="23" textAnchor="middle" fill="#E4ECDD" fontSize="8" fontWeight="bold">BOUNDARY</SvgText>
    </Svg>
  );
}

function fmtOvers(balls: number) {
  return Math.floor(balls / 6) + '.' + (balls % 6);
}

function pick<T,>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function flipCoin(): 'HEADS' | 'TAILS' {
  return Math.random() < 0.5 ? 'HEADS' : 'TAILS';
}

function nextRuns(quality: number, shot: ShotId) {
  const risk = SHOTS.find((item) => item.id === shot)?.risk ?? 0.08;
  const adjusted = Math.max(0, Math.min(1, quality + (shot === 'defend' ? 0.08 : shot === 'loft' ? 0.02 : 0)));
  const wicketChance = risk + (adjusted < 0.22 ? 0.19 : adjusted < 0.42 ? 0.08 : 0);
  if (Math.random() < wicketChance) return { runs: 0, wicket: true };
  const roll = Math.random();
  if (adjusted > 0.82) {
    if (roll < (shot === 'loft' ? 0.43 : 0.29)) return { runs: 6, wicket: false };
    if (roll < 0.77) return { runs: 4, wicket: false };
    if (roll < 0.91) return { runs: 2, wicket: false };
    return { runs: 1, wicket: false };
  }
  if (adjusted > 0.58) {
    if (roll < 0.18) return { runs: 4, wicket: false };
    if (roll < 0.47) return { runs: 2, wicket: false };
    if (roll < 0.79) return { runs: 1, wicket: false };
    return { runs: 0, wicket: false };
  }
  if (adjusted > 0.28) {
    if (roll < 0.08) return { runs: 4, wicket: false };
    if (roll < 0.24) return { runs: 2, wicket: false };
    if (roll < 0.51) return { runs: 1, wicket: false };
  }
  return { runs: 0, wicket: false };
}

function applyFieldingAssist(outcome: { runs: number; wicket: boolean }, enabled: boolean) {
  if (!enabled || outcome.wicket) return outcome;
  if (outcome.runs === 6 && Math.random() < 0.28) return { ...outcome, runs: 4 };
  if (outcome.runs === 4 && Math.random() < 0.18) return { ...outcome, runs: 2 };
  return outcome;
}

export default function App() {
  const { width: viewportWidth } = useWindowDimensions();
  const wideHome = viewportWidth >= 760;
  const [screen, setScreenState] = useState<Screen>('home');
  const [orientationReady, setOrientationReady] = useState(true);
  const [tossCall, setTossCall] = useState<'HEADS' | 'TAILS' | null>(null);
  const [tossOutcome, setTossOutcome] = useState<'HEADS' | 'TAILS' | null>(null);
  const [tossWon, setTossWon] = useState<boolean | null>(null);
  const [opponentDecision, setOpponentDecision] = useState<'BAT' | 'BOWL' | null>(null);
  const [lineupTeam, setLineupTeam] = useState(TEAMS[0]);
  const [overs, setOvers] = useState(10);
  const [teamIndex, setTeamIndex] = useState(0);
  const [opponentIndex, setOpponentIndex] = useState(1);
  const [venueIndex, setVenueIndex] = useState(0);
  const [difficulty, setDifficulty] = useState('PRO');
  const [shotAssist, setShotAssist] = useState(true);
  const [fieldingAssist, setFieldingAssist] = useState(true);
  const [commentary, setCommentary] = useState(true);
  const [fieldSet, setFieldSet] = useState<FieldSet>('ATTACKING 1');
  const [match, setMatch] = useState<Match | null>(null);
  const [matchAction, setMatchAction] = useState<MatchAction | null>(null);
  const [labAction, setLabAction] = useState<MatchAction | null>(null);
  const [now, setNow] = useState(0);
  const [banner, setBanner] = useState('');
  const [homeNotice, setHomeNotice] = useState('');
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>('STROKE');
  const [footwork, setFootwork] = useState<Footwork>('FRONT FOOT');
  const [pitchTarget, setPitchTarget] = useState<PitchTarget>({ x: 0, depth: 0.5 });
  const [swingDirection, setSwingDirection] = useState<SwingDirection | null>(null);
  const [pace, setPace] = useState(128);
  const [bowlPhaseStartedAt, setBowlPhaseStartedAt] = useState<number | null>(null);
  const [paceTrackWidth, setPaceTrackWidth] = useState(120);
  const [batterStick, setBatterStick] = useState<StickPosition>({ x: 0, y: 0 });
  const resolutionLock = useRef(false);

  const setScreen = (next: Screen) => {
    setScreenState(next);
    const nextIsLandscape = next === 'toss' || next === 'lineup' || next === 'match' || next === 'field' || next === 'lab';
    const currentIsLandscape = screen === 'toss' || screen === 'lineup' || screen === 'match' || screen === 'field' || screen === 'lab';
    if (nextIsLandscape && !currentIsLandscape) {
      setOrientationReady(false);
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
        .then(() => new Promise<void>((resolve) => setTimeout(resolve, 180)))
        .catch((error: unknown) => console.warn('Could not switch to landscape:', error))
        .finally(() => setOrientationReady(true));
    } else if (!nextIsLandscape && currentIsLandscape) {
      setOrientationReady(true);
      void ScreenOrientation.unlockAsync().catch(() => undefined);
    }
  };

  const elapsed = match?.delivery ? Math.max(0, Math.min(WINDOW_MS, now - match.delivery.startedAt)) : 0;
  const timingPosition = match?.delivery ? Math.min(100, (elapsed / WINDOW_MS) * 100) : 0;
  const timingQuality = match?.delivery
    ? Math.max(0, 1 - Math.abs(elapsed - SWEET_SPOT_MS) / 850)
    : 0;
  const bowlPhaseProgress = bowlPhaseStartedAt
    ? Math.min(100, Math.max(0, ((now - bowlPhaseStartedAt) / WINDOW_MS) * 100))
    : 0;
  const required = match?.target ? Math.max(0, match.target - (match.score ?? 0)) : null;
  const remainingBalls = match ? Math.max(0, match.oversLimit * 6 - match.legalBalls) : 0;
  const requiredRate = required !== null && remainingBalls > 0 ? ((required / remainingBalls) * 6).toFixed(1) : '—';
  const isCurrentlyBatting = match ? isUserBatting(match) : false;
  const deliveryInFlight = Boolean(match?.delivery && now >= match.delivery.startedAt);
  const secondInningsLed = Boolean(match && match.topScorerRuns > match.firstTopScorerRuns);
  const manOfMatchName = match ? (secondInningsLed ? match.topScorer : match.firstTopScorer) ?? 'MATCH DAY STAR' : 'MATCH DAY STAR';
  const manOfMatchRuns = match ? Math.max(match.topScorerRuns, match.firstTopScorerRuns) : 0;

  const settle = useCallback((runs: number, wicket: boolean, label: string, legalBall = true) => {
    setMatch((previous) => {
      if (!previous || previous.status !== 'live' || !previous.delivery) return previous;
      const score = previous.score + runs;
      const wickets = previous.wickets + (wicket ? 1 : 0);
      const legalBalls = previous.legalBalls + (legalBall ? 1 : 0);
      const topScorerRuns = previous.topScorerRuns + runs;
      const topScorer = runs > 0 && topScorerRuns >= previous.topScorerRuns ? activeStrikerForMatch(previous) : previous.topScorer;
      const recent = [...previous.recent, legalBall ? wicket ? 'W' : String(runs) : 'NB'].slice(-6);
      const inningsDone = wickets >= 10 || legalBalls >= previous.oversLimit * 6;
      if (legalBall && previous.innings === 1 && inningsDone) {
        return {
          ...previous,
          score,
          wickets,
          legalBalls,
          recent,
          delivery: null,
          status: 'break',
          firstScore: score,
          firstTopScorer: topScorer,
          firstTopScorerRuns: topScorerRuns,
          topScorer,
          topScorerRuns,
          target: score + 1,
        };
      }
      if (legalBall && previous.innings === 2 && (wickets >= 10 || legalBalls >= previous.oversLimit * 6 || score >= (previous.target ?? Infinity))) {
        const won = score >= (previous.target ?? Infinity);
        const tied = score === (previous.target ?? 1) - 1;
        return {
          ...previous,
          score,
          wickets,
          legalBalls,
          recent,
          delivery: null,
          status: 'complete',
          winner: tied ? 'MATCH TIED' : won ? battingTeamForMatch(previous) : bowlingTeamForMatch(previous),
          topScorer,
          topScorerRuns,
        };
      }
      return { ...previous, score, wickets, legalBalls, recent, topScorer, topScorerRuns, delivery: null };
    });
    resolutionLock.current = false;
    setBanner(commentary ? label : '');
    setTimeout(() => setBanner(''), 1450);
  }, [commentary]);

  const recordNoBall = useCallback(() => {
    if (resolutionLock.current) return;
    resolutionLock.current = true;
    setMatch((previous) => {
      if (!previous || previous.status !== 'live' || isUserBatting(previous) || previous.delivery) return previous;
      const score = previous.score + 1;
      const recent = [...previous.recent, 'NB'].slice(-6);
      if (score >= (previous.target ?? Infinity)) {
        return { ...previous, score, recent, status: 'complete', winner: battingTeamForMatch(previous), delivery: null };
      }
      return { ...previous, score, recent };
    });
    setMatchAction(null);
    setBowlPhaseStartedAt(null);
    setBanner(commentary ? 'NO BALL · 1 RUN' : '');
    setTimeout(() => setBanner(''), 1450);
  }, [commentary]);

  const resolveBowlingDelivery = useCallback(() => {
    const delivery = match?.delivery;
    if (!match || isUserBatting(match) || !delivery) return;
    const aimQuality = clamp(1 - Math.abs(delivery.targetX ?? 0) * 0.35 - Math.abs((delivery.targetZ ?? -2.7) + 2.7) * 0.11);
    const swingBonus = delivery.swing && delivery.swing !== 'NONE' ? 0.035 : 0;
    const paceBonus = Math.max(0, (delivery.pace - 110) / 1000);
    const wicket = Math.random() < 0.045 + aimQuality * 0.1 + swingBonus + paceBonus;
    const roll = Math.random();
    const runs = wicket ? 0 : aimQuality > 0.72
      ? roll < 0.12 ? 4 : roll < 0.22 ? 2 : roll < 0.55 ? 1 : 0
      : roll < 0.22 ? 4 : roll < 0.39 ? 2 : roll < 0.73 ? 1 : 0;
    const shot: ShotId = runs === 4 ? 'drive' : 'defend';
    const label = wicket ? 'WICKET' : runs === 4 ? 'FOUR' : runs === 0 ? 'DOT BALL' : `${runs} RUN${runs === 1 ? '' : 'S'}`;
    setMatchAction({ shot, runs, wicket, startedAt: Date.now() });
    settle(runs, wicket, label);
  }, [match, settle]);

  useEffect(() => {
    if (!match?.delivery || match.status !== 'live') return;
    const delivery = match.delivery;
    const timer = setInterval(() => {
      const timestamp = Date.now();
      const sinceRelease = timestamp - delivery.startedAt;
      if (sinceRelease >= WINDOW_MS) {
        if (!resolutionLock.current) {
          resolutionLock.current = true;
          if (!isCurrentlyBatting) resolveBowlingDelivery();
          else settle(0, false, 'DOT BALL');
        }
      } else {
        setNow(timestamp);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [match?.delivery, match?.status, match?.innings, isCurrentlyBatting, resolveBowlingDelivery, settle]);

  useEffect(() => {
    if (!bowlPhaseStartedAt || screen !== 'match' || match?.status !== 'live' || isCurrentlyBatting || match.delivery) return;
    const timer = setInterval(() => {
      const timestamp = Date.now();
      setNow(timestamp);
      if (timestamp - bowlPhaseStartedAt >= WINDOW_MS && !resolutionLock.current) {
        recordNoBall();
      }
    }, 40);
    return () => clearInterval(timer);
  }, [bowlPhaseStartedAt, screen, match?.status, match?.innings, match?.delivery, isCurrentlyBatting, recordNoBall]);

  useEffect(() => {
    if (!matchAction) return;
    const timer = setTimeout(() => setMatchAction(null), 1500);
    return () => clearTimeout(timer);
  }, [matchAction]);

  useEffect(() => {
    if (!labAction) return;
    const timer = setTimeout(() => setLabAction(null), 1500);
    return () => clearTimeout(timer);
  }, [labAction]);

  useEffect(() => {
    if (!homeNotice) return;
    const timer = setTimeout(() => setHomeNotice(''), 2400);
    return () => clearTimeout(timer);
  }, [homeNotice]);

  const startMatch = (oversOverride?: number) => {
    const matchOvers = oversOverride ?? overs;
    if (oversOverride !== undefined) setOvers(oversOverride);
    setBanner('');
    setHomeNotice('');
    setMatchAction(null);
    resolutionLock.current = false;
    setBowlPhaseStartedAt(null);
    setSwingDirection(null);
    setPitchTarget({ x: 0, depth: 0.5 });
    setTossCall(null);
    setTossOutcome(null);
    setTossWon(null);
    setOpponentDecision(null);
    setLineupTeam(TEAMS[teamIndex]);
    setMatch({
      status: 'live',
      innings: 1,
      oversLimit: matchOvers,
      legalBalls: 0,
      score: 0,
      wickets: 0,
      firstScore: null,
      firstTopScorer: null,
      firstTopScorerRuns: 0,
      topScorer: null,
      topScorerRuns: 0,
      target: null,
      team: TEAMS[teamIndex],
      opponent: TEAMS[opponentIndex],
      userBatFirst: true,
      venue: VENUES[venueIndex],
      delivery: null,
      recent: [],
      winner: null,
      difficulty,
    });
    setScreen('toss');
  };

  const fireLabShot = (shot: ShotId) => {
    const runs = shot === 'loft' ? 6 : shot === 'drive' || shot === 'pull' ? 4 : 0;
    setLabAction({ shot, runs, wicket: false, startedAt: currentTimestamp() });
  };

  const callToss = (call: 'HEADS' | 'TAILS') => {
    if (tossOutcome) return;
    const outcome = flipCoin();
    const won = call === outcome;
    setTossCall(call);
    setTossOutcome(outcome);
    setTossWon(won);
    if (!won) {
      const decision = pick(['BAT', 'BOWL'] as const);
      setOpponentDecision(decision);
      setMatch((previous) => previous ? { ...previous, userBatFirst: decision === 'BOWL' } : previous);
    }
  };

  const chooseTossDecision = (decision: 'BAT' | 'BOWL') => {
    if (tossWon !== true) return;
    setMatch((previous) => previous ? { ...previous, userBatFirst: decision === 'BAT' } : previous);
    setScreen('lineup');
  };

  const continueAfterToss = () => {
    if (tossWon === false) setScreen('lineup');
  };

  const bowlNext = () => {
    if (!match || match.status !== 'live' || match.delivery) return;
    setMatchAction(null);
    resolutionLock.current = false;
    setBanner('');
    setNow(Date.now());
    setMatch((previous) => {
      if (!previous || previous.status !== 'live' || previous.delivery) return previous;
      return {
        ...previous,
        delivery: {
          startedAt: Date.now() + BOWLER_RUN_UP_MS,
          runUpStartedAt: Date.now(),
          line: pick(['OFF STUMP', 'MIDDLE', 'LEG STUMP']),
          length: pick(['YORKER', 'GOOD LENGTH', 'SHORT']),
          pace: 118 + Math.floor(Math.random() * 29),
        },
      };
    });
  };

  const playShot = (shot: ShotId, leaveAlone = false) => {
    if (!match?.delivery || now < match.delivery.startedAt || resolutionLock.current) return;
    resolutionLock.current = true;
    const difficultyBonus = difficulty === 'CASUAL' ? 0.16 : difficulty === 'MASTER AI' ? -0.08 : 0;
    const quality = Math.max(0, Math.min(1, timingQuality + (shotAssist ? 0.1 : 0) + difficultyBonus));
    const outcome = leaveAlone ? { runs: 0, wicket: false } : applyFieldingAssist(nextRuns(quality, shot), fieldingAssist);
    const label = leaveAlone
      ? 'LEFT ALONE'
      : outcome.wicket
      ? 'WICKET'
      : outcome.runs === 6
        ? 'SIX! OVER THE ROPE'
        : outcome.runs === 4
          ? 'FOUR! BEAUTIFULLY PLACED'
          : outcome.runs === 0
            ? 'DOT BALL'
            : outcome.runs + (outcome.runs === 1 ? ' RUN' : ' RUNS');
    setMatchAction({ shot, runs: outcome.runs, wicket: outcome.wicket, startedAt: now });
    settle(outcome.runs, outcome.wicket, label);
  };

  const playSelectedShot = () => {
    const shot: ShotId = footwork === 'LEAVE'
      ? 'defend'
      : footwork === 'BACK FOOT'
        ? 'pull'
        : footwork === 'SPECIAL' || strokeStyle === 'LOFT'
          ? 'loft'
          : strokeStyle === 'PUSH'
            ? 'defend'
            : 'drive';
    playShot(shot, footwork === 'LEAVE');
  };

  const startBowlingPhase = (direction: SwingDirection) => {
    if (match?.delivery || bowlPhaseStartedAt) return;
    const startedAt = currentTimestamp();
    setSwingDirection(direction);
    setBowlPhaseStartedAt(startedAt);
    setNow(startedAt);
    resolutionLock.current = false;
  };

  const updatePitchTarget = (event: GestureResponderEvent) => {
    const x = event.nativeEvent.locationX / 102 * 2 - 1;
    const y = event.nativeEvent.locationY / 102 * 2 - 1;
    const radius = Math.hypot(x, y);
    const scale = radius > 0.78 ? 0.78 / radius : 1;
    setPitchTarget({ x: Math.max(-0.78, Math.min(0.78, x * scale)), depth: Math.max(0.04, Math.min(0.96, (y * scale + 1) / 2)) });
  };

  const updatePace = (event: GestureResponderEvent) => {
    const position = event.nativeEvent.locationX / paceTrackWidth;
    setPace(Math.round(95 + clamp(position) * 50));
  };

  const updateBatterStick = (event: GestureResponderEvent) => {
    const dx = event.nativeEvent.locationX - 38;
    const dy = event.nativeEvent.locationY - 38;
    const radius = Math.hypot(dx, dy);
    const scale = radius > 25 ? 25 / radius : 1;
    setBatterStick({ x: (dx * scale) / 25, y: (dy * scale) / 25 });
  };

  const releaseBowl = () => {
    if (!match || match.status !== 'live' || isUserBatting(match) || match.delivery || !swingDirection || !bowlPhaseStartedAt) return;
    const releaseTime = currentTimestamp();
    const releaseProgress = Math.min(100, ((releaseTime - bowlPhaseStartedAt) / WINDOW_MS) * 100);
    if (releaseProgress >= 88) {
      recordNoBall();
      return;
    }
    const line = pitchTarget.x < -0.26 ? 'OFF STUMP' : pitchTarget.x > 0.26 ? 'LEG STUMP' : 'MIDDLE';
    const length = pitchTarget.depth < 0.3 ? 'YORKER' : pitchTarget.depth > 0.7 ? 'SHORT' : 'GOOD LENGTH';
    const startedAt = releaseTime;
    resolutionLock.current = false;
    setBowlPhaseStartedAt(null);
    setNow(startedAt);
    setMatch((previous) => {
      if (!previous || previous.status !== 'live' || isUserBatting(previous) || previous.delivery) return previous;
      return {
        ...previous,
        delivery: {
          startedAt,
          runUpStartedAt: bowlPhaseStartedAt,
          line,
          length,
          pace,
          targetX: pitchTarget.x * 0.62,
          targetZ: -4.8 + pitchTarget.depth * 4.5,
          swing: flightSwingFor(swingDirection),
          variation: swingDirection,
        },
      };
    });
  };

  const endInnings = () => {
    if (!match || match.status !== 'live') return;
    resolutionLock.current = true;
    setMatch((previous) => {
      if (!previous || previous.status !== 'live') return previous;
      if (previous.innings === 1) {
        return { ...previous, status: 'break', firstScore: previous.score, firstTopScorer: previous.topScorer, firstTopScorerRuns: previous.topScorerRuns, target: previous.score + 1, delivery: null };
      }
      return {
        ...previous,
        status: 'complete',
        delivery: null,
        winner: previous.score >= (previous.target ?? Infinity)
          ? battingTeamForMatch(previous)
          : previous.score === (previous.target ?? 1) - 1
            ? 'MATCH TIED'
            : bowlingTeamForMatch(previous),
      };
    });
    setBanner(match.innings === 1 ? 'INNINGS BREAK' : 'MATCH COMPLETE');
  };

  const startChase = () => {
    if (!match) return;
    setMatchAction(null);
    setBowlPhaseStartedAt(null);
    setSwingDirection(null);
    setPitchTarget({ x: 0, depth: 0.5 });
    resolutionLock.current = false;
    setBanner('');
    setMatch((previous) =>
      previous
        ? {
            ...previous,
            status: 'live',
            innings: 2,
            score: 0,
            wickets: 0,
            legalBalls: 0,
            topScorer: null,
            topScorerRuns: 0,
            delivery: null,
            recent: [],
            winner: null,
          }
        : previous,
    );
  };

  const newMatch = () => {
    setMatch(null);
    setMatchAction(null);
    setBanner('');
    setScreen('home');
  };

  const teamFlags = useMemo(() => ['IND', 'AUS', 'SL', 'NZ', 'ENG'], []);
  const shiftIndex = (index: number, delta: number) => (index + delta + TEAMS.length) % TEAMS.length;

  return (
    <SafeAreaProvider>
    <SafeAreaView edges={screen === 'match' || screen === 'toss' || screen === 'lineup' || screen === 'field' || screen === 'lab' ? ['left', 'right'] : ['top', 'bottom']} style={styles.safe}>
      <StatusBar style="light" hidden={screen === 'match' || screen === 'toss' || screen === 'lineup' || screen === 'field' || screen === 'lab'} />
      {screen === 'home' && (
        <ScrollView contentContainerStyle={styles.arenaPage} showsVerticalScrollIndicator={false}>
          <View style={styles.arenaHeader}>
            <View style={styles.arenaBrandMark}><Text style={styles.arenaBrandMarkText}>BC</Text></View>
            <View style={styles.arenaBrandCopy}>
              <Text style={styles.arenaBrandName}>BEACH CRICKET <Text style={styles.arenaBrand3D}>3D</Text></Text>
              <Text style={styles.arenaBrandRank}>LVL 14  ·  BEACH SKIPPER</Text>
            </View>
            <View style={styles.currencyPill}><Text style={styles.currencyShell}>◉</Text><Text style={styles.currencyValue}>24,500</Text></View>
            <View style={styles.currencyPill}><Text style={styles.currencyGem}>◇</Text><Text style={styles.currencyValue}>380</Text></View>
            <Pressable accessibilityLabel="Open settings" onPress={() => setScreen('settings')} style={styles.arenaSettings}><Text style={styles.arenaSettingsText}>⚙</Text></Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.arenaNav}>
            <Pressable onPress={() => setScreen('home')} style={[styles.arenaNavItem, styles.arenaNavActive]}><Text style={[styles.arenaNavText, styles.arenaNavTextActive]}>ARENA</Text></Pressable>
            <Pressable onPress={() => setScreen('tournament')} style={styles.arenaNavItem}><Text style={styles.arenaNavText}>TOURNAMENTS</Text></Pressable>
            <Pressable onPress={() => setScreen('squad')} style={styles.arenaNavItem}><Text style={styles.arenaNavText}>LOCKER</Text></Pressable>
            <Pressable onPress={() => setHomeNotice('TIKI VIP PASS · COMING SOON')} style={styles.arenaNavItem}><Text style={styles.arenaNavText}>PASS</Text></Pressable>
            <Pressable onPress={() => setHomeNotice('BEACH CLUBS · COMING SOON')} style={styles.arenaNavItem}><Text style={styles.arenaNavText}>CLUBS</Text></Pressable>
          </ScrollView>

          <View style={styles.arenaWeather}>
            <Text style={styles.weatherLive}>● LIVE CONDITIONS</Text>
            <Text style={styles.weatherDetail}>SEA BREEZE 14 KT SW</Text>
            <Text style={styles.weatherDivider}>·</Text>
            <Text style={styles.weatherDetail}>SUNSET PITCH</Text>
            <Text style={styles.weatherTemperature}>31°</Text>
          </View>

          <View style={[styles.arenaColumns, wideHome && styles.arenaColumnsWide]}>
            <View style={[styles.playerDossier, wideHome && styles.playerDossierWide]}>
              <View style={styles.dossierHead}>
                <View style={styles.dossierAvatar}><Text style={styles.dossierAvatarText}>14</Text></View>
                <View style={styles.dossierNameBlock}><Text style={styles.dossierName}>ROHAN SHARMA</Text><Text style={styles.dossierRole}>THE DUNE SLOGGER  ·  POWER HITTER</Text></View>
                <Text style={styles.verifiedMark}>✓</Text>
              </View>
              <View style={styles.dossierStats}>
                <StatBlock label="WIN RATE" value="68%" detail="42 WON / 62 MAT" />
                <StatBlock label="HIGH SCORE" value="118*" detail="VS MIAMI WAVES" />
                <StatBlock label="STRIKE RATE" value="214.2" detail="CAREER" />
              </View>
              <View style={styles.calibrationHead}><Text style={styles.calibrationTitle}>TIMING CALIBRATION</Text><Text style={styles.calibrationValue}>PERFECT 88%</Text></View>
              <View style={styles.calibrationTrack}><View style={styles.calibrationEarly} /><View style={styles.calibrationSweet} /><View style={styles.calibrationLate} /><View style={styles.calibrationNeedle} /></View>
              <View style={styles.calibrationLabels}><Text style={styles.calibrationHint}>EARLY LOFT</Text><Text style={styles.calibrationHint}>SWEET SPOT</Text><Text style={styles.calibrationHint}>LATE EDGE</Text></View>
              <View style={styles.gearRow}><Text style={styles.gearChip}>✦ SUNBURST V  +18 PWR</Text><Text style={styles.gearChip}>◉ CORK SAND  +12 SWG</Text></View>
            </View>

            <View style={[styles.arenaHeroCard, wideHome && styles.arenaHeroCardWide]}>
              <View style={styles.arenaHeroVisual}>
                <MenuArenaArt />
                <View style={styles.heroTag}><Text style={styles.heroTagText}>OCEANIA STADIUM  ·  SUNSET PITCH</Text></View>
                <View style={styles.heroWeatherTag}><Text style={styles.heroWeatherText}>✦  2X COINS ACTIVE</Text></View>
              </View>
              <View style={styles.arenaHeroInfo}>
                <View style={styles.arenaHeroCopy}>
                  <Text style={styles.arenaHeroEyebrow}>SEASON 04  ·  SUNSET BLITZ</Text>
                  <Text style={styles.arenaHeroTitle}>BEACH SLOGGER</Text>
                  <Text style={styles.arenaHeroDescription}>Sand pitch physics tuned. Take on coastal skippers in a fast 3-over burst.</Text>
                </View>
                <View style={styles.arenaHeroActionRow}>
                  <Pressable onPress={() => startMatch(3)} style={styles.playNowButton}><Text style={styles.playNowText}>PLAY NOW</Text><Text style={styles.playNowArrow}>↗</Text></Pressable>
                  <View style={styles.bountyBlock}><Text style={styles.bountyLabel}>BOUNTY</Text><Text style={styles.bountyValue}>1,200 ◉</Text></View>
                </View>
                <Text style={styles.energyNote}>50 ENERGY  ·  INSTANT MATCHMAKING READY</Text>
              </View>
            </View>
          </View>

          <View style={styles.vipStrip}>
            <View style={styles.vipIcon}><Text style={styles.vipIconText}>✦</Text></View>
            <View style={styles.vipCopy}><Text style={styles.vipTitle}>TIKI VIP PASS  <Text style={styles.vipTier}>TIER 22 / 50</Text></Text><Text style={styles.vipDescription}>Your next coastal reward is ready to claim.</Text></View>
            <Pressable onPress={() => setHomeNotice('TIKI VIP PASS · COMING SOON')} style={styles.vipClaim}><Text style={styles.vipClaimText}>CLAIM</Text></Pressable>
          </View>

          <View style={styles.modeSectionHead}><View><Text style={styles.modeEyebrow}>PICK YOUR NEXT PLAY</Text><Text style={styles.modeTitle}>GAME MODES</Text></View><Pressable onPress={() => setScreen('format')}><Text style={styles.modeSeeAll}>VIEW ALL  →</Text></Pressable></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeRail}>
            <ModeCard number="03" title="QUICK MATCH" detail="3-over blitz against beach bowlers" accent={C.coral} tag="4.8K ONLINE" onPress={() => startMatch(3)} />
            <ModeCard number="50" title="FORMAT TOUR" detail="5 to 50 overs · Coastal Series" accent={C.mint} tag="8 TROPHIES" onPress={() => setScreen('format')} />
            <ModeCard number="01" title="SUPER OVER" detail="Defend or chase 24 with 2 wickets" accent="#F4D06F" tag="DEATH OVERS" onPress={() => startMatch(1)} />
            <ModeCard number="LAB" title="SHOT LAB" detail="Calibrate drives, pulls and timing" accent="#73A9FF" tag="PERFECT YOUR TIMING" onPress={() => { setLabAction(null); setScreen('lab'); }} />
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickBar}>
            <QuickBarItem icon="♜" label="TROPHIES" onPress={() => setScreen('squad')} />
            <QuickBarItem icon="⚒" label="GEAR LOCKER" onPress={() => setScreen('squad')} />
            <QuickBarItem icon="◉" label="DAILY SHELLS" onPress={() => setHomeNotice('DAILY SHELL REWARDS · COMING SOON')} />
            <QuickBarItem icon="✦" label="MILESTONES" onPress={() => setHomeNotice('MILESTONES · COMING SOON')} />
            <QuickBarItem icon="◎" label="LIVE LOBBY" onPress={() => setHomeNotice('MULTIPLAYER LOBBY · COMING SOON')} />
          </ScrollView>
          {homeNotice !== '' && <View style={styles.homeToast}><Text style={styles.homeToastText}>{homeNotice}</Text></View>}
        </ScrollView>
      )}

      {screen === 'tournament' && (
        <ScrollView contentContainerStyle={styles.tournamentPage} showsVerticalScrollIndicator={false}>
          <Header onSettings={() => setScreen('settings')} showBack onBack={() => setScreen('home')} eyebrow="TOURNAMENT ARENA" />
          <View style={styles.tournamentHero}>
            <View style={styles.tournamentHeroTop}><Text style={styles.tournamentEyebrow}>INTERNATIONAL 20-20S CUP  ·  MATCHDAY 03</Text><Text style={styles.tournamentTimer}>04D  ·  11H LEFT</Text></View>
            <Text style={styles.tournamentTitle}>OCEANIA SHORELINE CLASH</Text>
            <Text style={styles.tournamentSub}>OCEANIA STADIUM  ·  DUSK  ·  2X COINS & RP ACTIVE</Text>
            <View style={styles.tournamentMatchup}>
              <View style={styles.tournamentTeam}><Text style={[styles.tournamentTeamRank, { color: C.mint }]}>RANK #01  ·  XI READY</Text><Text style={styles.tournamentTeamName}>{TEAMS[teamIndex].toUpperCase()}</Text></View>
              <View style={styles.tournamentVs}><Text style={styles.tournamentVsText}>VS</Text></View>
              <View style={[styles.tournamentTeam, styles.tournamentTeamRight]}><Text style={[styles.tournamentTeamRank, { color: C.coral }]}>RANK #02  ·  RIVAL TOUR</Text><Text style={styles.tournamentTeamName}>{TEAMS[opponentIndex].toUpperCase()}</Text></View>
            </View>
            <View style={styles.tournamentTarget}><Text style={styles.tournamentTargetText}>DEMO FIXTURE  ·  QUICK BLITZ  ·  2 OVERS PER SIDE</Text></View>
            <Pressable onPress={() => startMatch(2)} style={styles.tournamentPlay}><Text style={styles.tournamentPlayText}>PLAY MATCH</Text><Text style={styles.tournamentPlayArrow}>↗</Text></Pressable>
          </View>
          <View style={styles.tournamentModeRow}>
            <Pressable onPress={() => startMatch(2)} style={styles.tournamentModeCard}><Text style={styles.tournamentModeMeta}>PVP FAST  ·  02 OVERS</Text><Text style={styles.tournamentModeTitle}>QUICK MATCH</Text><Text style={styles.tournamentModeDetail}>A fast coastal match with instant toss and chase.</Text></Pressable>
            <Pressable onPress={() => setScreen('format')} style={styles.tournamentModeCard}><Text style={styles.tournamentModeMeta}>CUP TOUR  ·  50</Text><Text style={styles.tournamentModeTitle}>TOURNAMENT SERIES</Text><Text style={styles.tournamentModeDetail}>Choose 5, 10, 20, 30 or 50 overs.</Text></Pressable>
          </View>
          <View style={styles.tournamentActions}>
            <Pressable onPress={() => setScreen('squad')} style={styles.tournamentAction}><Text style={styles.tournamentActionIcon}>♙</Text><Text style={styles.tournamentActionTitle}>PLAYING XI SQUAD</Text><Text style={styles.tournamentActionDetail}>11 / 11 SET</Text></Pressable>
            <Pressable onPress={() => setScreen('format')} style={styles.tournamentAction}><Text style={styles.tournamentActionIcon}>◈</Text><Text style={styles.tournamentActionTitle}>PITCH REPORT & TOSS</Text><Text style={styles.tournamentActionDetail}>DRY TRACK · VIEW CONDITIONS</Text></Pressable>
            <Pressable onPress={() => setHomeNotice('DAILY BOUNTIES ARE A LOCAL PREVIEW FEATURE')} style={styles.tournamentAction}><Text style={styles.tournamentActionIcon}>✦</Text><Text style={styles.tournamentActionTitle}>DAILY SHELL BOUNTIES</Text><Text style={styles.tournamentActionDetail}>CLAIM PANEL PREVIEW</Text></Pressable>
          </View>
          {homeNotice !== '' && <View style={styles.tournamentNotice}><Text style={styles.tournamentNoticeText}>{homeNotice}</Text></View>}
          <Text style={styles.tournamentServer}>OCEANIC SERVER  ·  LOCAL MATCH PREVIEW</Text>
        </ScrollView>
      )}

      {screen === 'format' && (
        <ScrollView contentContainerStyle={styles.formatPage} showsVerticalScrollIndicator={false}>
          <Header onSettings={() => setScreen('settings')} showBack onBack={() => setScreen('home')} eyebrow="MATCH SETUP" />
          <View style={styles.formatIntro}>
            <Text style={styles.formatEyebrow}>TWO-INNINGS SERIES SETUP  ·  SIM ENGINE ACTIVE</Text>
            <Text style={styles.formatTitle}>SELECT MATCH FORMAT</Text>
            <Text style={styles.formatSubtitle}>Choose innings length and coastal conditions before the coin toss.</Text>
            <View style={styles.formatStatsRow}><Text style={styles.formatStat}>CURRENT STREAK  <Text style={styles.formatStatValue}>8 WINS</Text></Text><Text style={styles.formatStat}>BEACH RANK  <Text style={styles.formatStatValue}>#42 GLOBAL</Text></Text><Text style={styles.formatStat}>PITCH WIND  <Text style={styles.formatStatValue}>14 KN SW</Text></Text></View>
          </View>
          <View style={styles.formatTeamCard}>
            <Text style={styles.formatSectionLabel}>SELECT YOUR SIDES</Text>
            <View style={styles.teamRow}>
              <TeamPicker short={teamFlags[teamIndex]} name={TEAMS[teamIndex]} color={C.mint} onPress={() => setTeamIndex((i) => { const next = shiftIndex(i, 1); return next === opponentIndex ? shiftIndex(next, 1) : next; })} />
              <View style={styles.vsCircle}><Text style={styles.vsText}>VS</Text></View>
              <TeamPicker short={teamFlags[opponentIndex]} name={TEAMS[opponentIndex]} color={C.coral} onPress={() => setOpponentIndex((i) => { const next = shiftIndex(i, 1); return next === teamIndex ? shiftIndex(next, 1) : next; })} />
            </View>
          </View>
          <View style={styles.formatSectionHead}><Text style={styles.formatSectionLabel}>OVERS PER INNINGS</Text><Text style={styles.formatSectionMeta}>TWO INNINGS CHASE</Text></View>
          <View style={styles.formatGrid}>
            {FORMAT_OPTIONS.map((format) => {
              const option = format.overs;
              return (
                <Pressable key={option} onPress={() => setOvers(option)} style={[styles.formatOption, overs === option && styles.formatOptionActive]}>
                  <View style={styles.formatOptionTop}><Text style={[styles.formatOptionPace, overs === option && styles.formatOptionLabelActive]}>{format.pace}</Text><Text style={[styles.formatOptionNumber, overs === option && styles.formatOptionNumberActive]}>{String(option).padStart(2, '0')} <Text style={styles.formatOptionOvers}>OVERS</Text></Text></View>
                  <Text style={[styles.formatOptionLabel, overs === option && styles.formatOptionLabelActive]}>{format.title}</Text>
                  <Text style={styles.formatOptionDescription}>{format.note}</Text>
                  <View style={styles.formatOptionBottom}><Text style={styles.formatOptionMeta}>{format.venue.toUpperCase()}</Text><Text style={styles.formatOptionMeta}>{format.pitch}</Text><Text style={[styles.formatCheck, overs === option && styles.formatCheckActive]}>{overs === option ? 'SELECTED' : 'SELECT'}</Text></View>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.telemetryCard}>
            <View style={styles.telemetryHead}><Text style={styles.telemetryTitle}>PITCH & BALL TELEMETRY</Text><Text style={styles.telemetryLive}>● LIVE</Text></View>
            <View style={styles.telemetryBody}>
              <View style={styles.telemetryMap}><FieldArt compact /></View>
              <View style={styles.telemetryStats}><Text style={styles.telemetryVenue}>{VENUES[venueIndex].toUpperCase()}  ·  SUNSET</Text><Text style={styles.telemetryStat}>SAND FRICTION  <Text style={styles.telemetryValue}>0.42 μ</Text></Text><Text style={styles.telemetryStat}>SEA GUSTS  <Text style={styles.telemetryValue}>8–12 KT</Text></Text><Text style={styles.telemetryStat}>PITCH  <Text style={styles.telemetryValue}>HEAVY TIDE</Text></Text></View>
            </View>
            <View style={styles.deliveryArsenal}><Text style={styles.formatSectionLabel}>DELIVERY ARSENAL</Text><View style={styles.arsenalChips}><Text style={styles.arsenalChip}>FAST OUT</Text><Text style={styles.arsenalChip}>OFF BREAK</Text><Text style={styles.arsenalChip}>IN-SWING</Text><Text style={styles.arsenalChip}>YORKER</Text><Text style={styles.arsenalChip}>BOUNCER</Text><Text style={styles.arsenalChip}>SLOWER</Text></View></View>
          </View>
          <View style={styles.formatPrefs}>
            <Pressable onPress={() => setDifficulty((d) => d === 'CASUAL' ? 'PRO' : d === 'PRO' ? 'MASTER AI' : 'CASUAL')} style={styles.formatPreference}><Text style={styles.formatSectionLabel}>DIFFICULTY & TIMING</Text><Text style={styles.formatPreferenceValue}>{difficulty}  ⌄</Text><Text style={styles.formatPreferenceHint}>{difficulty === 'CASUAL' ? 'WIDE CONTACT WINDOW' : difficulty === 'MASTER AI' ? 'MASTER AI · TIGHT TIMING' : 'PRO · ±45 MS CONTACT WINDOW'}</Text></Pressable>
            <Pressable onPress={() => setVenueIndex((i) => (i + 1) % VENUES.length)} style={styles.formatPreference}><Text style={styles.formatSectionLabel}>VENUE</Text><Text style={styles.formatPreferenceValue}>{VENUES[venueIndex].toUpperCase()}  ⌄</Text></Pressable>
          </View>
          <View style={styles.tossPreview}><Text style={styles.tossPreviewIcon}>◉</Text><View style={styles.tossPreviewCopy}><Text style={styles.tossPreviewTitle}>PRE-MATCH COIN TOSS</Text><Text style={styles.tossPreviewText}>Call heads or tails, then choose to bat or bowl.</Text></View></View>
          <Pressable style={styles.formatStartButton} onPress={() => startMatch()}><Text style={styles.formatStartText}>START MATCH  ·  {overs} OVERS</Text><Text style={styles.formatStartArrow}>↗</Text></Pressable>
          <Text style={styles.formatFootnote}>MATCH FLOW: TOSS  →  LINEUPS  →  TWO INNINGS</Text>
        </ScrollView>
      )}

      {screen === 'toss' && match && orientationReady && (
        <View style={styles.presentationScreen}>
          <BeachMatch3D deliveryProgress={0} deliveryActive={false} deliveryLine="MIDDLE" battingTeam={match.team} bowlingTeam={match.opponent} action={null} fullScreen />
          <View pointerEvents="box-none" style={styles.presentationOverlay}>
            <View style={styles.presentationTop}>
              <View><Text style={styles.presentationKicker}>TIDELINE CHAMPIONSHIP</Text><Text style={styles.presentationTitle}>THE TOSS</Text></View>
              <Pressable onPress={newMatch} style={styles.presentationBack}><Text style={styles.presentationBackText}>EXIT</Text></Pressable>
            </View>
            <View style={styles.tossTeamsRow}>
              <View style={styles.tossTeamBlock}><View style={[styles.tossTeamMark, { borderColor: C.mint }]}><Text style={[styles.tossTeamMarkText, { color: C.mint }]}>{teamFlags[teamIndex]}</Text></View><Text style={styles.tossTeamName}>{match.team.toUpperCase()}</Text></View>
              <View style={styles.tossCoinBlock}>
                <View style={[styles.coinDisc, tossOutcome && styles.coinDiscActive]}><Text style={styles.coinDiscFace}>{tossOutcome === 'HEADS' ? 'H' : tossOutcome === 'TAILS' ? 'T' : '✦'}</Text></View>
                <Text style={styles.tossOutcomeText}>{!tossOutcome ? 'MAKE YOUR CALL' : tossWon ? 'YOU WON THE TOSS' : 'OPPONENT WON THE TOSS'}</Text>
                {tossOutcome && <Text style={styles.tossOutcomeSub}>IT LANDED {tossOutcome}  ·  YOU CALLED {tossCall}</Text>}
                {!tossOutcome ? (
                  <View style={styles.tossChoiceRow}>
                    {(['HEADS', 'TAILS'] as const).map((side) => <Pressable key={side} onPress={() => callToss(side)} style={styles.tossChoiceButton}><Text style={styles.tossChoiceText}>{side}</Text></Pressable>)}
                  </View>
                ) : tossWon ? (
                  <View style={styles.tossChoiceRow}>
                    <Pressable onPress={() => chooseTossDecision('BAT')} style={styles.tossChoiceButton}><Text style={styles.tossChoiceText}>BAT FIRST</Text></Pressable>
                    <Pressable onPress={() => chooseTossDecision('BOWL')} style={styles.tossChoiceButton}><Text style={styles.tossChoiceText}>BOWL FIRST</Text></Pressable>
                  </View>
                ) : (
                  <View style={styles.tossChoiceRow}><Text style={styles.opponentTossText}>{match.opponent.toUpperCase()} CHOSE TO {opponentDecision}</Text><Pressable onPress={continueAfterToss} style={styles.tossChoiceButton}><Text style={styles.tossChoiceText}>VIEW LINEUPS  →</Text></Pressable></View>
                )}
              </View>
              <View style={styles.tossTeamBlock}><View style={[styles.tossTeamMark, { borderColor: C.coral }]}><Text style={[styles.tossTeamMarkText, { color: C.coral }]}>{teamFlags[opponentIndex]}</Text></View><Text style={styles.tossTeamName}>{match.opponent.toUpperCase()}</Text></View>
            </View>
          </View>
        </View>
      )}

      {screen === 'lineup' && match && orientationReady && (
        <View style={styles.presentationScreen}>
          <BeachMatch3D deliveryProgress={0} deliveryActive={false} deliveryLine="MIDDLE" battingTeam={battingTeamForMatch(match)} bowlingTeam={bowlingTeamForMatch(match)} action={null} fullScreen />
          <View pointerEvents="box-none" style={styles.presentationOverlay}>
            <View style={styles.presentationTop}>
              <View><Text style={styles.presentationKicker}>MATCH DAY · {match.venue.toUpperCase()}</Text><Text style={styles.presentationTitle}>YOUR XI</Text></View>
              <Pressable onPress={() => setScreen('toss')} style={styles.presentationBack}><Text style={styles.presentationBackText}>BACK TO TOSS</Text></Pressable>
            </View>
            <View style={styles.lineupChooser}>
              {[match.team, match.opponent].map((team) => (
                <Pressable key={team} onPress={() => setLineupTeam(team)} style={[styles.lineupTeamTab, lineupTeam === team && styles.lineupTeamTabActive]}>
                  <Text style={[styles.lineupTeamTabText, lineupTeam === team && styles.lineupTeamTabTextActive]}>{team.toUpperCase()} XI</Text>
                </Pressable>
              ))}
              <Text style={styles.lineupTossResult}>{match.userBatFirst ? `${match.team.toUpperCase()} BAT FIRST` : `${match.opponent.toUpperCase()} BAT FIRST`}</Text>
            </View>
            <View style={styles.lineupGrid}>
              {(lineupTeam === match.team ? LINEUP_HOME : LINEUP_AWAY).map(([name, role, rating], index) => (
                <View key={name} style={styles.playerCard}>
                  <View style={styles.playerCardTop}><Text style={styles.playerRating}>{rating}</Text><Text style={styles.playerIndex}>{String(index + 1).padStart(2, '0')}</Text></View>
                  <View style={[styles.playerPortrait, { backgroundColor: index % 2 ? '#21433D' : '#33474B' }]}><Text style={styles.playerInitial}>{name.charAt(0)}</Text></View>
                  <Text numberOfLines={1} style={styles.playerName}>{name.toUpperCase()}</Text>
                  <Text style={styles.playerRole}>{role}</Text>
                </View>
              ))}
            </View>
            <View style={styles.lineupFooter}>
              <Text style={styles.lineupFooterText}>11 PLAYERS  ·  FICTIONAL ROSTERS  ·  {match.oversLimit} OVER MATCH</Text>
              <Pressable onPress={() => setScreen('match')} style={styles.lineupStartButton}><Text style={styles.lineupStartText}>ENTER THE STADIUM  →</Text></Pressable>
            </View>
          </View>
        </View>
      )}

      {screen === 'match' && match?.status === 'live' && orientationReady && (
        <View style={styles.gameScreen}>
          <BeachMatch3D
            deliveryProgress={match.delivery ? timingPosition / 100 : 0}
            deliveryActive={Boolean(match.delivery && now >= match.delivery.startedAt)}
            bowlingRunUpProgress={match.delivery
              ? clamp((now - match.delivery.runUpStartedAt) / BOWLER_RUN_UP_MS)
              : bowlPhaseStartedAt && !isUserBatting(match)
                ? clamp((now - bowlPhaseStartedAt) / BOWLER_RUN_UP_MS)
                : 0}
            deliveryLine={match.delivery?.line ?? 'MIDDLE'}
            deliveryTargetX={match.delivery?.targetX}
            deliveryTargetZ={match.delivery?.targetZ}
            batterMovementX={isUserBatting(match) ? batterStick.x : 0}
            batterMovementY={isUserBatting(match) ? batterStick.y : 0}
            swing={match.delivery?.swing}
            showPitchTarget={!isUserBatting(match) && !match.delivery}
            pitchTargetX={pitchTarget.x * 0.62}
            pitchTargetZ={-4.8 + pitchTarget.depth * 4.5}
            battingTeam={battingTeamForMatch(match)}
            bowlingTeam={bowlingTeamForMatch(match)}
            fieldSet={fieldSet}
            action={matchAction}
            fullScreen
          />
          <View pointerEvents="box-none" style={styles.gameOverlay}>
            <View style={styles.gameTopBar}>
              <Pressable onPress={() => setScreen('home')} style={styles.gameIconButton}><Text style={styles.gameBackText}>‹</Text></Pressable>
              <Pressable accessibilityLabel="Open field setup" onPress={() => setScreen('field')} style={styles.miniMapCard}>
                <Text style={styles.miniMapLabel}>FIELD · {fieldSet}</Text>
                <MiniMap fieldSet={fieldSet} />
              </Pressable>
              <View style={styles.gameMetaBlock}>
                <View style={styles.gameLive}><View style={styles.gameLiveDot} /><Text style={styles.gameLiveText}>LIVE · {battingTeamForMatch(match).toUpperCase()} BATTING</Text></View>
                <Text style={styles.gameMetaText}>{match.venue.toUpperCase()}  ·  {match.oversLimit} OVERS{match.target ? `  ·  TARGET ${match.target}` : ''}</Text>
              </View>
              <Pressable onPress={endInnings} style={styles.endGameButton}><Text style={styles.endGameText}>END</Text></Pressable>
            </View>

            {banner ? <View pointerEvents="none" style={styles.gameBanner}><Text style={styles.gameBannerText}>{banner}</Text></View> : null}

            <View pointerEvents="box-none" style={styles.gameControlsRow}>
              {isUserBatting(match) ? (
                <View style={styles.controlPanel}>
                  <Text style={styles.controlEyebrow}>LEFT · TIMING</Text>
                  <Text style={styles.controlTitle}>{!match.delivery ? 'READY TO BAT' : deliveryInFlight ? 'WATCH THE BALL' : 'BOWLER RUN-UP'}</Text>
                  <Text style={styles.controlHint}>{!match.delivery ? 'Tap to start the next delivery' : deliveryInFlight ? `${match.delivery.length} · ${match.delivery.line} · ${match.delivery.pace} KM/H` : 'Get ready · ball follows the run-up'}</Text>
                  <Pressable disabled={Boolean(match.delivery && !deliveryInFlight)} onPress={match.delivery ? playSelectedShot : bowlNext} style={[styles.timingPad, deliveryInFlight && styles.timingPadActive, Boolean(match.delivery && !deliveryInFlight) && styles.controlDisabled]}>
                    <View style={styles.timingTrackCompact}>
                      <View style={styles.timingEarlyCompact} /><View style={styles.timingSweetCompact} /><View style={styles.timingLateCompact} />
                      {deliveryInFlight && <View style={[styles.timingBallCompact, { left: (timingPosition + '%') as DimensionValue }]} />}
                    </View>
                    <View style={styles.timingLabels}><Text style={styles.timingLegendText}>EARLY</Text><Text style={styles.timingLegendSweet}>PERFECT</Text><Text style={styles.timingLegendText}>LATE</Text></View>
                    <Text style={styles.timingPadAction}>{!match.delivery ? 'NEXT BALL  →' : deliveryInFlight ? 'TAP TO HIT' : 'BOWLER RUN-UP'}</Text>
                  </Pressable>
                  <View style={styles.movementControlRow}>
                    <View
                      style={styles.movementPad}
                      onStartShouldSetResponder={() => true}
                      onMoveShouldSetResponder={() => true}
                      onResponderGrant={updateBatterStick}
                      onResponderMove={updateBatterStick}
                      onResponderRelease={() => setBatterStick({ x: 0, y: 0 })}
                      onResponderTerminate={() => setBatterStick({ x: 0, y: 0 })}
                    >
                      <Text pointerEvents="none" style={[styles.movementArrow, styles.movementArrowUp]}>▲</Text>
                      <Text pointerEvents="none" style={[styles.movementArrow, styles.movementArrowRight]}>▶</Text>
                      <Text pointerEvents="none" style={[styles.movementArrow, styles.movementArrowDown]}>▼</Text>
                      <Text pointerEvents="none" style={[styles.movementArrow, styles.movementArrowLeft]}>◀</Text>
                      <View pointerEvents="none" style={[styles.movementKnob, { transform: [{ translateX: batterStick.x * 25 }, { translateY: batterStick.y * 25 }] }]} />
                    </View>
                    <View style={styles.movementCopy}>
                      <Text style={styles.movementTitle}>MOVE BATSMAN</Text>
                      <Text style={styles.movementHint}>DRAG TO ADJUST POSITION</Text>
                    </View>
                  </View>
                  <Text style={styles.tinyControlHint}>{!match.delivery ? 'Your batting innings' : deliveryInFlight ? 'Tap as the ball reaches the sweet spot' : 'The ball appears after the run-up'}</Text>
                </View>
              ) : (
                <View style={styles.controlPanel}>
                  <Text style={styles.controlEyebrow}>LEFT · PITCH AIM</Text>
                  <Text style={styles.controlTitle}>PLACE THE BALL</Text>
                  <Text style={styles.controlHint}>Drag the marker to set line and length</Text>
                  <View
                    style={styles.pitchAimPad}
                    onStartShouldSetResponder={() => true}
                    onMoveShouldSetResponder={() => true}
                    onResponderGrant={updatePitchTarget}
                    onResponderMove={updatePitchTarget}
                  >
                    <View pointerEvents="none" style={styles.pitchMapPitch} />
                    <View pointerEvents="none" style={[styles.pitchAimMarker, {
                      left: `${((pitchTarget.x + 1) / 2) * 100}%` as DimensionValue,
                      top: `${pitchTarget.depth * 100}%` as DimensionValue,
                    }]} />
                    <Text pointerEvents="none" style={styles.pitchMapTop}>BOWLER</Text>
                    <Text pointerEvents="none" style={styles.pitchMapBottom}>BATTER</Text>
                  </View>
                  <Text style={styles.tinyControlHint}>{pitchTarget.x < -0.26 ? 'OFF SIDE' : pitchTarget.x > 0.26 ? 'LEG SIDE' : 'MIDDLE'} · {pitchTarget.depth < 0.3 ? 'YORKER' : pitchTarget.depth > 0.7 ? 'SHORT' : 'GOOD LENGTH'}</Text>
                </View>
              )}

              {isUserBatting(match) ? (
                <View style={styles.controlPanel}>
                  <Text style={styles.controlEyebrow}>RIGHT · SHOT SELECTION</Text>
                  <Text style={styles.controlTitle}>CHOOSE YOUR SHOT</Text>
                  <View style={styles.choiceRow}>
                    {(['LOFT', 'PUSH', 'STROKE'] as StrokeStyle[]).map((item) => (
                      <Pressable key={item} onPress={() => setStrokeStyle(item)} style={[styles.choiceChip, strokeStyle === item && styles.choiceChipActive]}>
                        <Text style={[styles.choiceText, strokeStyle === item && styles.choiceTextActive]}>{item}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.footworkGrid}>
                    {(['BACK FOOT', 'LEAVE', 'SPECIAL', 'FRONT FOOT'] as Footwork[]).map((item) => (
                      <Pressable key={item} onPress={() => setFootwork(item)} style={[styles.footworkChip, footwork === item && styles.footworkChipActive]}>
                        <Text style={[styles.footworkText, footwork === item && styles.choiceTextActive]}>{item}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.tinyControlHint}>{footwork} · {strokeStyle} {match.delivery ? '· TAP LEFT TO PLAY' : ''}</Text>
                </View>
              ) : (
                <View style={styles.controlPanel}>
                  <Text style={styles.controlEyebrow}>RIGHT · BOWLING</Text>
                  <Text style={styles.controlTitle}>SWING · SPEED · RELEASE</Text>
                  <Text style={styles.controlHint}>Choose swing to start the phase meter</Text>
                  <View style={styles.bowlingVariationGrid}>
                    {BOWLING_VARIATIONS.map((item) => (
                      <Pressable key={item} disabled={Boolean(match.delivery || bowlPhaseStartedAt)} onPress={() => startBowlingPhase(item)} style={[styles.bowlingVariationChip, swingDirection === item && styles.choiceChipActive, Boolean(match.delivery || bowlPhaseStartedAt) && styles.controlDisabled]}>
                        <Text style={[styles.bowlingVariationText, swingDirection === item && styles.choiceTextActive]}>{item}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.speedLabel}>PACE  <Text style={styles.speedValue}>{pace} KM/H</Text></Text>
                  <View
                    style={styles.speedTrack}
                    onLayout={(event: LayoutChangeEvent) => setPaceTrackWidth(Math.max(1, event.nativeEvent.layout.width))}
                    onStartShouldSetResponder={() => true}
                    onMoveShouldSetResponder={() => true}
                    onResponderGrant={updatePace}
                    onResponderMove={updatePace}
                  >
                    <View style={[styles.speedFill, { width: `${((pace - 95) / 50) * 100}%` as DimensionValue }]} />
                    <View style={[styles.speedThumb, { left: `${((pace - 95) / 50) * 100}%` as DimensionValue }]} />
                  </View>
                  <View style={styles.phaseHeader}><Text style={styles.speedLabel}>RELEASE PHASE</Text><Text style={styles.phaseReadout}>{swingDirection && bowlPhaseStartedAt ? `${Math.min(100, Math.round(bowlPhaseProgress))}%` : 'READY'}</Text></View>
                  <View style={styles.phaseTrack}><View style={styles.phaseSafeZone} /><View style={styles.phaseRedZone} />{swingDirection && bowlPhaseStartedAt && <View style={[styles.phaseNeedle, { left: `${Math.min(100, bowlPhaseProgress)}%` as DimensionValue }]} />}</View>
                  <Pressable disabled={!swingDirection || !bowlPhaseStartedAt || Boolean(match.delivery)} onPress={releaseBowl} style={[styles.releaseButton, (!swingDirection || !bowlPhaseStartedAt || match.delivery) && styles.releaseButtonDisabled]}>
                    <Text style={styles.releaseButtonText}>{match.delivery ? 'BALL IN PLAY' : bowlPhaseStartedAt ? 'OK · RELEASE' : 'SELECT SWING TO BEGIN'}</Text>
                  </Pressable>
                  <Text style={styles.tinyControlHint}>Last red zone = NO BALL · {match.delivery ? 'Wait for the delivery' : 'Release before red'}</Text>
                </View>
              )}
            </View>

            <View pointerEvents="none" style={styles.scoreStrip}>
              <View style={styles.scoreSide}>
                <Text style={styles.scoreTeamLabel}>{battingTeamForMatch(match).toUpperCase()} · BAT</Text>
                <Text style={styles.scorePlayerText}>Aarav Mehta*   ·   Dev Sharma</Text>
              </View>
              <View style={styles.scoreCenter}>
                <Text style={styles.scoreCenterTop}>{battingTeamForMatch(match).toUpperCase()}   <Text style={styles.scoreCenterValue}>{match.score}-{match.wickets}</Text></Text>
                <Text style={styles.scoreCenterBottom}>{fmtOvers(match.legalBalls)} OV  ·  {match.oversLimit} OV{requiredRate !== '—' ? `  ·  REQ ${requiredRate}` : ''}</Text>
              </View>
              <View style={[styles.scoreSide, styles.scoreSideRight]}>
                <Text style={[styles.scoreTeamLabel, styles.scoreSideRightText]}>{bowlingTeamForMatch(match).toUpperCase()} · BOWL</Text>
                <Text style={[styles.scorePlayerText, styles.scoreSideRightText]}>{!isUserBatting(match) ? 'Rohan Iyer' : 'Kai Morgan'}  ·  {match.delivery ? `${match.delivery.pace} KM/H` : 'READY'}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {(screen === 'match' || screen === 'toss' || screen === 'lineup' || screen === 'field' || screen === 'lab') && !orientationReady && (
        <View style={styles.orientationSplash}><Text style={styles.orientationTitle}>PREPARING THE GROUND</Text><Text style={styles.orientationHint}>Turn your phone sideways to play</Text></View>
      )}

      {screen === 'match' && match && match.status !== 'live' && orientationReady && (
        <View style={styles.presentationScreen}>
          <BeachMatch3D deliveryProgress={0} deliveryActive={false} deliveryLine="MIDDLE" battingTeam={battingTeamForMatch(match)} bowlingTeam={bowlingTeamForMatch(match)} action={null} fullScreen />
          <View pointerEvents="box-none" style={[styles.presentationOverlay, styles.resultPresentationOverlay]}>
            <View style={styles.presentationTop}>
              <View><Text style={styles.presentationKicker}>{match.venue.toUpperCase()}  ·  {match.oversLimit} OVERS</Text><Text style={styles.presentationTitle}>{match.status === 'break' ? 'INNINGS BREAK' : 'MATCH RESULT'}</Text></View>
              <Pressable onPress={newMatch} style={styles.presentationBack}><Text style={styles.presentationBackText}>NEW MATCH</Text></Pressable>
            </View>
            <View style={styles.resultCenterWrap}>
              {match.status === 'break' ? (
                <View style={styles.resultShowcase}>
                  <Text style={styles.resultEyebrow}>FIRST INNINGS COMPLETE</Text>
                  <Text style={styles.resultWinner}>{battingTeamForMatch(match).toUpperCase()}</Text>
                  <Text style={styles.resultScoreLine}>{match.firstScore} RUNS</Text>
                  <View style={styles.resultRule} />
                  <Text style={styles.resultMessage}>{bowlingTeamForMatch(match).toUpperCase()} NEED {match.target} TO WIN</Text>
                  <Pressable onPress={startChase} style={styles.resultAction}><Text style={styles.resultActionText}>START THE CHASE  →</Text></Pressable>
                </View>
              ) : (
                <View style={styles.resultShowcase}>
                  <Text style={styles.resultEyebrow}>FULL TIME  ·  MATCH RESULT</Text>
                  <Text style={styles.resultWinner}>{match.winner === 'MATCH TIED' ? 'MATCH TIED' : `${match.winner?.toUpperCase()} WIN`}</Text>
                  <Text style={styles.resultScoreLine}>{match.userBatFirst ? match.team.toUpperCase() : match.opponent.toUpperCase()}  {match.firstScore}   —   {match.userBatFirst ? match.opponent.toUpperCase() : match.team.toUpperCase()}  {match.score}/{match.wickets}</Text>
                  <View style={styles.resultRule} />
                  <Text style={styles.resultMessage}>{match.winner === 'MATCH TIED' ? 'LEVEL AFTER THE FINAL BALL' : match.winner === battingTeamForMatch(match) ? `WON BY ${Math.max(1, 10 - match.wickets)} WICKETS` : `WON BY ${Math.max(1, (match.target ?? 1) - 1 - match.score)} RUNS`}</Text>
                  <View style={styles.matchAward}>
                    <Text style={styles.matchAwardEyebrow}>✦  PLAYER OF THE MATCH</Text>
                    <Text style={styles.matchAwardName}>{manOfMatchName.toUpperCase()}</Text>
                    <Text style={styles.matchAwardDetail}>{manOfMatchRuns} RUNS  ·  SIMULATED INNINGS LEADER</Text>
                  </View>
                  <Pressable onPress={newMatch} style={styles.resultAction}><Text style={styles.resultActionText}>PLAY AGAIN  →</Text></Pressable>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {screen === 'field' && match && orientationReady && (
        <View style={styles.fieldSetupScreen}>
          <View style={styles.fieldSetupHeader}>
            <Pressable onPress={() => setScreen('match')} style={styles.fieldBackButton}><Text style={styles.fieldBackText}>‹</Text></Pressable>
            <View style={styles.fieldHeaderCopy}><Text style={styles.fieldEyebrow}>MATCH TACTICS  ·  {bowlingTeamForMatch(match).toUpperCase()}</Text><Text style={styles.fieldTitle}>FIELD SETUP</Text></View>
            <Pressable onPress={() => setScreen('match')} style={styles.fieldSaveButton}><Text style={styles.fieldSaveText}>SAVE & EXIT</Text></Pressable>
          </View>
          <View style={styles.fieldSetupBody}>
            <View style={styles.fieldMapCard}>
              <View style={styles.fieldCardHeading}><Text style={styles.fieldSectionTitle}>GROUND PLAN</Text><Text style={styles.fieldPlanLabel}>{fieldSet}</Text></View>
              <View style={styles.fieldMapGraphic}><FieldPlanMap fieldSet={fieldSet} /></View>
              <Text style={styles.fieldHintLine}>TAP A FIELD PLAN TO APPLY IT TO THE LIVE MATCH</Text>
            </View>
            <View style={styles.fieldRosterCard}>
              <View style={styles.fieldRosterHeader}><Text style={styles.fieldRosterCol}>PLAYER</Text><Text style={styles.fieldRosterCol}>RATING</Text><Text style={styles.fieldRosterCol}>LOCATION</Text></View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {FIELD_ROSTER.map(([name, rating, location], index) => (
                  <View key={name} style={styles.fieldRosterRow}>
                    <Text style={styles.fieldRosterName}>{index + 1}. {name}</Text><Text style={styles.fieldRating}>{rating}</Text><Text numberOfLines={1} style={styles.fieldLocation}>{location}</Text>
                  </View>
                ))}
              </ScrollView>
              <Text style={styles.fieldRosterNote}>6 OUTFIELDERS · FICTIONAL ROSTER</Text>
            </View>
          </View>
          <View style={styles.fieldSetupFooter}>
            <View style={styles.fieldTacticsGroup}>
              {(['ATTACKING 1', 'ATTACKING 2', 'DEFENSIVE'] as FieldSet[]).map((item) => (
                <Pressable key={item} onPress={() => setFieldSet(item)} style={[styles.fieldTacticButton, fieldSet === item && styles.fieldTacticButtonActive]}>
                  <Text style={[styles.fieldTacticText, fieldSet === item && styles.fieldTacticTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => setFieldSet('ATTACKING 1')} style={styles.fieldResetButton}><Text style={styles.fieldResetText}>RESET DEFAULT</Text></Pressable>
          </View>
        </View>
      )}

      {screen === 'lab' && orientationReady && (
        <View style={styles.gameScreen}>
          <BeachMatch3D deliveryProgress={0} deliveryActive={false} deliveryLine="MIDDLE" battingTeam={TEAMS[teamIndex]} bowlingTeam={TEAMS[opponentIndex]} fieldSet={fieldSet} action={labAction} fullScreen />
          <View pointerEvents="box-none" style={styles.labOverlay}>
            <View style={styles.labHeader}>
              <Pressable onPress={() => setScreen('home')} style={styles.gameIconButton}><Text style={styles.gameBackText}>‹</Text></Pressable>
              <View style={styles.labTitleBlock}><Text style={styles.gameLiveText}>PRACTICE LAB  ·  INFINITE BALLS</Text><Text style={styles.gameMetaText}>SHOT TIMING & CONTACT CALIBRATION</Text></View>
              <Text style={styles.labCameraTag}>BOWLER END CAMERA</Text>
            </View>
            <View style={styles.labControlBar}>
              <View style={styles.labCalibration}>
                <View style={styles.calibrationHead}><Text style={styles.calibrationTitle}>CONTACT CALIBRATION</Text><Text style={styles.calibrationValue}>SWEET SPOT</Text></View>
                <View style={styles.calibrationTrack}><View style={styles.calibrationEarly} /><View style={styles.calibrationSweet} /><View style={styles.calibrationLate} /><View style={styles.calibrationNeedle} /></View>
                <View style={styles.calibrationLabels}><Text style={styles.calibrationHint}>EARLY</Text><Text style={styles.calibrationHint}>PERFECT</Text><Text style={styles.calibrationHint}>LATE</Text></View>
              </View>
              <View style={styles.labShotControls}>
                {SHOTS.map((shot) => (
                  <Pressable key={shot.id} onPress={() => fireLabShot(shot.id)} style={[styles.labShotButton, shot.id === 'loft' && styles.labShotButtonAccent]}>
                    <Text style={styles.labShotIcon}>{shot.icon}</Text><Text style={styles.labShotLabel}>{shot.label.toUpperCase()}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.labHint}>{labAction ? 'WATCH THE BALL PATH · TAP A SHOT TO RESET' : 'SELECT A SHOT TO PREVIEW THE BAT SWING AND BALL FLIGHT'}</Text>
            </View>
          </View>
        </View>
      )}

      {screen === 'squad' && (
        <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
          <Header onSettings={() => setScreen('settings')} showBack onBack={() => setScreen(match ? 'match' : 'home')} eyebrow="TEAM ROOM" />
          <View style={styles.screenIntro}><Text style={styles.kicker}>THE COASTAL XI</Text><Text style={styles.sectionTitle}>{match?.team ?? TEAMS[teamIndex]}</Text><Text style={styles.fieldHint}>Original prototype roster · player identities are fictional</Text></View>
          <View style={styles.rosterCard}>
            {[
              ['01', 'Aarav Mehta', 'BATTER', 'RHB · TIMING 88'],
              ['02', 'Dev Sharma', 'BATTER', 'LHB · POWER 82'],
              ['03', 'Kabir Rao', 'ALL-ROUNDER', 'RHB · MEDIUM PACE'],
              ['04', 'Ishaan Nair', 'WICKETKEEPER', 'RHB · GLOVE 86'],
              ['05', 'Rohan Iyer', 'FAST BOWLER', 'RIGHT ARM · PACE 89'],
              ['06', 'Arjun Das', 'SPIN BOWLER', 'LEG SPIN · CONTROL 84'],
              ['07', 'Neel Kapoor', 'ALL-ROUNDER', 'LHB · LEFT ARM'],
            ].map(([number, name, role, detail]) => (
              <View key={number} style={styles.rosterRow}>
                <Text style={styles.rosterNum}>{number}</Text>
                <View style={styles.avatar}><Text style={styles.avatarInitial}>{name.charAt(0)}</Text></View>
                <View style={styles.rosterNameBlock}><Text style={styles.rosterName}>{name}</Text><Text style={styles.rosterDetail}>{detail}</Text></View>
                <Text style={styles.rosterRole}>{role}</Text>
              </View>
            ))}
          </View>
          <View style={styles.infoNote}><Text style={styles.infoNoteIcon}>✦</Text><Text style={styles.infoNoteText}>This prototype uses fictional players and original UI. Licensed player likenesses, kits and team marks are not included.</Text></View>
          <View style={styles.bottomTabs}>
            <TabItem label="Home" icon="⌂" onPress={() => setScreen('home')} />
            <TabItem label="Match" icon="◉" onPress={() => setScreen(match ? 'match' : 'home')} />
            <TabItem label="Squad" icon="♙" active onPress={() => setScreen('squad')} />
            <TabItem label="Settings" icon="⚙" onPress={() => setScreen('settings')} />
          </View>
        </ScrollView>
      )}

      {screen === 'settings' && (
        <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
          <Header onSettings={() => setScreen(match ? 'match' : 'home')} showBack onBack={() => setScreen(match ? 'match' : 'home')} eyebrow="PREFERENCES" />
          <View style={styles.screenIntro}><Text style={styles.kicker}>MAKE IT YOURS</Text><Text style={styles.sectionTitle}>Game settings</Text><Text style={styles.fieldHint}>Tune how you play the prototype match.</Text></View>
          <View style={styles.settingsCard}>
            <SettingRow title="Shot timing assist" description="Widens the sweet spot slightly." value={shotAssist} onValueChange={setShotAssist} />
            <SettingRow title="Assisted fielding" description="AI fielders track and collect the ball." value={fieldingAssist} onValueChange={setFieldingAssist} />
            <SettingRow title="Match commentary" description="Show a short reaction after each ball." value={commentary} onValueChange={setCommentary} last />
          </View>
          <View style={styles.settingsSection}>
            <Text style={styles.fieldLabel}>MATCH DIFFICULTY</Text>
            <View style={styles.chipRow}>
              {['CASUAL', 'PRO', 'MASTER AI'].map((item) => <Pressable key={item} onPress={() => setDifficulty(item)} style={[styles.difficultyChip, item === difficulty && styles.overChipActive]}><Text style={[styles.difficultyText, item === difficulty && styles.overNumberActive]}>{item}</Text></Pressable>)}
            </View>
          </View>
          <View style={styles.infoNote}><Text style={styles.infoNoteIcon}>◈</Text><Text style={styles.infoNoteText}>Camera modes, audio mixing, graphics quality and control remapping are planned for later development.</Text></View>
          <View style={styles.bottomTabs}>
            <TabItem label="Home" icon="⌂" onPress={() => setScreen('home')} />
            <TabItem label="Match" icon="◉" onPress={() => setScreen(match ? 'match' : 'home')} />
            <TabItem label="Squad" icon="♙" onPress={() => setScreen('squad')} />
            <TabItem label="Settings" icon="⚙" active onPress={() => setScreen('settings')} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

function Header({ onSettings, showBack, onBack, eyebrow = 'MOBILE CRICKET' }: { onSettings: () => void; showBack?: boolean; onBack?: () => void; eyebrow?: string }) {
  return (
    <View style={styles.header}>
      {showBack ? <Pressable onPress={onBack} style={styles.backButton}><Text style={styles.backArrow}>‹</Text></Pressable> : <View style={styles.brandMark}><Text style={styles.brandIcon}>BC</Text></View>}
      <View style={styles.brandWords}><Text style={styles.brandName}>TIDELINE<Text style={styles.brandPeriod}>.</Text></Text><Text style={styles.brandEyebrow}>{eyebrow}</Text></View>
      <Pressable onPress={onSettings} style={styles.headerButton}><Text style={styles.headerButtonText}>⚙</Text></Pressable>
    </View>
  );
}

function TeamPicker({ short, name, color, onPress }: { short: string; name: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.teamPicker}>
      <View style={[styles.teamBadge, { borderColor: color }]}><Text style={[styles.teamBadgeText, { color }]}>{short}</Text></View>
      <Text style={styles.teamName}>{name}</Text><Text style={styles.teamPickerHint}>TAP TO CHANGE</Text>
    </Pressable>
  );
}

function TabItem({ label, icon, active, onPress }: { label: string; icon: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.tabItem}>
      <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{icon}</Text><Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      {active && <View style={styles.tabIndicator} />}
    </Pressable>
  );
}

function SettingRow({ title, description, value, onValueChange, last }: { title: string; description: string; value: boolean; onValueChange: (value: boolean) => void; last?: boolean }) {
  return (
    <View style={[styles.settingRow, last && styles.settingRowLast]}>
      <View style={styles.settingText}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingDescription}>{description}</Text></View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#42635D', true: '#729746' }} thumbColor={value ? C.mint : '#D4DED8'} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.ink },
  fieldSetupScreen: { flex: 1, paddingHorizontal: 14, paddingTop: 5, paddingBottom: 5, backgroundColor: '#102A27' },
  fieldSetupHeader: { minHeight: 49, flexDirection: 'row', alignItems: 'center', gap: 9 },
  fieldBackButton: { width: 38, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: C.cardLight, borderWidth: 1, borderColor: C.line },
  fieldBackText: { color: C.cream, fontSize: 25, lineHeight: 28, marginTop: -3 },
  fieldHeaderCopy: { flex: 1 },
  fieldEyebrow: { color: C.mint, fontSize: 6, fontWeight: '900', letterSpacing: 1 },
  fieldTitle: { color: C.cream, fontSize: 15, fontWeight: '900', letterSpacing: 1, marginTop: 2 },
  fieldSaveButton: { minHeight: 34, paddingHorizontal: 13, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: C.coral },
  fieldSaveText: { color: C.ink, fontSize: 7, fontWeight: '900', letterSpacing: 0.7 },
  fieldSetupBody: { flex: 1, flexDirection: 'row', gap: 9, minHeight: 0, paddingVertical: 5 },
  fieldMapCard: { width: '42%', minWidth: 210, alignItems: 'stretch', padding: 8, borderRadius: 11, borderWidth: 1, borderColor: C.line, backgroundColor: C.deep },
  fieldCardHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldSectionTitle: { color: C.cream, fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  fieldPlanLabel: { color: C.mint, fontSize: 6, fontWeight: '900' },
  fieldMapGraphic: { width: '100%', flex: 1, aspectRatio: 1, alignSelf: 'center', maxHeight: 338 },
  fieldHintLine: { color: C.muted, fontSize: 5, fontWeight: '800', textAlign: 'center', letterSpacing: 0.5, marginVertical: 3 },
  fieldRosterCard: { flex: 1, minWidth: 0, padding: 8, borderRadius: 11, borderWidth: 1, borderColor: C.line, backgroundColor: C.deep },
  fieldRosterHeader: { minHeight: 25, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 4, borderBottomWidth: 1, borderColor: C.line },
  fieldRosterCol: { flex: 1, color: C.muted, fontSize: 5, fontWeight: '900', letterSpacing: 0.7 },
  fieldRosterRow: { minHeight: 29, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 4, borderBottomWidth: 1, borderColor: '#18334A' },
  fieldRosterName: { flex: 1, color: C.cream, fontSize: 6, fontWeight: '800' },
  fieldRating: { width: 35, color: C.sand, fontSize: 6, fontWeight: '900', textAlign: 'center' },
  fieldLocation: { width: '37%', color: C.mint, fontSize: 5, fontWeight: '800' },
  fieldRosterNote: { color: C.muted, fontSize: 5, fontWeight: '800', textAlign: 'right', marginTop: 5 },
  fieldSetupFooter: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 3 },
  fieldTacticsGroup: { flexDirection: 'row', gap: 6, flex: 1 },
  fieldTacticButton: { minHeight: 30, minWidth: 88, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center', borderRadius: 7, borderWidth: 1, borderColor: C.line, backgroundColor: C.card },
  fieldTacticButtonActive: { borderColor: C.mint, backgroundColor: C.mint },
  fieldTacticText: { color: C.muted, fontSize: 6, fontWeight: '900' },
  fieldTacticTextActive: { color: C.ink },
  fieldResetButton: { minHeight: 30, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 7, borderWidth: 1, borderColor: C.coral },
  fieldResetText: { color: C.coral, fontSize: 6, fontWeight: '900' },
  labOverlay: { ...StyleSheet.absoluteFill, justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(4,15,21,0.12)' },
  labHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  labTitleBlock: { flex: 1 },
  labCameraTag: { color: C.mint, fontSize: 6, fontWeight: '900', letterSpacing: 0.6, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 7, backgroundColor: 'rgba(6,20,38,0.84)' },
  labControlBar: { alignSelf: 'flex-end', width: '70%', maxWidth: 560, padding: 10, borderRadius: 12, backgroundColor: 'rgba(6,20,38,0.9)', borderWidth: 1, borderColor: C.line },
  labCalibration: { marginBottom: 8 },
  labShotControls: { flexDirection: 'row', gap: 6 },
  labShotButton: { flex: 1, minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 8, backgroundColor: C.cardLight, borderWidth: 1, borderColor: C.line },
  labShotButtonAccent: { backgroundColor: C.coral, borderColor: C.coral },
  labShotIcon: { color: C.cream, fontSize: 12, fontWeight: '900' },
  labShotLabel: { color: C.cream, fontSize: 6, fontWeight: '900', letterSpacing: 0.45 },
  labHint: { color: C.muted, fontSize: 5, fontWeight: '800', letterSpacing: 0.55, textAlign: 'center', marginTop: 7 },
  arenaPage: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24, backgroundColor: C.ink },
  arenaHeader: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 8 },
  arenaBrandMark: { width: 39, height: 39, borderRadius: 13, backgroundColor: C.coral, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
  arenaBrandMarkText: { color: C.ink, fontSize: 13, fontWeight: '900', letterSpacing: -1 },
  arenaBrandCopy: { flex: 1, minWidth: 92 },
  arenaBrandName: { color: C.cream, fontSize: 12, fontWeight: '900', letterSpacing: 1.1 },
  arenaBrand3D: { color: C.mint },
  arenaBrandRank: { color: C.muted, fontSize: 7, fontWeight: '800', letterSpacing: 1, marginTop: 3 },
  currencyPill: { minHeight: 30, paddingHorizontal: 7, borderRadius: 10, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, flexDirection: 'row', alignItems: 'center', gap: 4 },
  currencyShell: { color: C.coral, fontSize: 12, fontWeight: '900' },
  currencyGem: { color: C.mint, fontSize: 14, fontWeight: '900' },
  currencyValue: { color: C.cream, fontSize: 8, fontWeight: '900' },
  arenaSettings: { width: 31, height: 31, borderRadius: 10, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card },
  arenaSettingsText: { color: C.cream, fontSize: 15 },
  arenaNav: { paddingVertical: 5, paddingHorizontal: 1, gap: 8 },
  arenaNavItem: { minHeight: 31, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  arenaNavActive: { backgroundColor: C.cardLight, borderBottomWidth: 2, borderBottomColor: C.mint },
  arenaNavText: { color: C.muted, fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  arenaNavTextActive: { color: C.mint },
  arenaWeather: { minHeight: 29, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 9, marginTop: 5, marginBottom: 11, borderRadius: 8, borderWidth: 1, borderColor: C.line, backgroundColor: C.deep },
  weatherLive: { color: C.mint, fontSize: 6, fontWeight: '900', letterSpacing: 0.7 },
  weatherDetail: { color: C.muted, fontSize: 6, fontWeight: '800', letterSpacing: 0.4 },
  weatherDivider: { color: C.coral, fontSize: 10, fontWeight: '900' },
  weatherTemperature: { color: C.cream, fontSize: 9, fontWeight: '900', marginLeft: 'auto' },
  arenaColumns: { flexDirection: 'column', gap: 11 },
  arenaColumnsWide: { flexDirection: 'row', alignItems: 'stretch' },
  playerDossier: { padding: 12, borderRadius: 14, backgroundColor: C.deep, borderWidth: 1, borderColor: C.line },
  playerDossierWide: { width: '43%' },
  dossierHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  dossierAvatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#263C4B', borderWidth: 1, borderColor: C.coral, alignItems: 'center', justifyContent: 'center' },
  dossierAvatarText: { color: C.coral, fontSize: 17, fontWeight: '900' },
  dossierNameBlock: { flex: 1 },
  dossierName: { color: C.cream, fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  dossierRole: { color: C.muted, fontSize: 6, fontWeight: '800', letterSpacing: 0.7, marginTop: 4 },
  verifiedMark: { color: C.mint, fontSize: 15, fontWeight: '900' },
  dossierStats: { flexDirection: 'row', marginTop: 11, paddingVertical: 9, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.line },
  statBlock: { flex: 1, minWidth: 0, paddingHorizontal: 6, borderRightWidth: 1, borderColor: C.line },
  statLabel: { color: C.muted, fontSize: 5.5, fontWeight: '900', letterSpacing: 0.7 },
  statValue: { color: C.cream, fontSize: 16, fontWeight: '900', marginTop: 3 },
  statDetail: { color: C.muted, fontSize: 5, fontWeight: '800', marginTop: 2 },
  calibrationHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 11 },
  calibrationTitle: { color: C.cream, fontSize: 7, fontWeight: '900', letterSpacing: 0.7 },
  calibrationValue: { color: C.mint, fontSize: 7, fontWeight: '900' },
  calibrationTrack: { height: 7, flexDirection: 'row', position: 'relative', marginTop: 6, borderRadius: 5 },
  calibrationEarly: { flex: 3, backgroundColor: '#D87461', borderTopLeftRadius: 5, borderBottomLeftRadius: 5 },
  calibrationSweet: { flex: 2, backgroundColor: C.mint },
  calibrationLate: { flex: 3, backgroundColor: '#E9A146', borderTopRightRadius: 5, borderBottomRightRadius: 5 },
  calibrationNeedle: { position: 'absolute', left: '55%', top: -3, width: 3, height: 13, borderRadius: 2, backgroundColor: C.white },
  calibrationLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  calibrationHint: { color: C.muted, fontSize: 5, fontWeight: '800', letterSpacing: 0.4 },
  gearRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 10 },
  gearChip: { color: C.sand, fontSize: 5, fontWeight: '900', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, backgroundColor: '#1B2D3C' },
  arenaHeroCard: { flex: 1, borderRadius: 14, overflow: 'hidden', backgroundColor: C.deep, borderWidth: 1, borderColor: C.line },
  arenaHeroCardWide: { minHeight: 286 },
  arenaHeroVisual: { height: 164, position: 'relative', overflow: 'hidden', backgroundColor: '#1D3342' },
  heroTag: { position: 'absolute', left: 9, bottom: 8, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 6, backgroundColor: 'rgba(6,20,38,0.84)' },
  heroTagText: { color: C.cream, fontSize: 6, fontWeight: '900', letterSpacing: 0.6 },
  heroWeatherTag: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 6, backgroundColor: 'rgba(6,20,38,0.84)' },
  heroWeatherText: { color: C.coral, fontSize: 6, fontWeight: '900' },
  arenaHeroInfo: { paddingHorizontal: 12, paddingVertical: 11 },
  arenaHeroCopy: { flex: 1 },
  arenaHeroEyebrow: { color: C.mint, fontSize: 6, fontWeight: '900', letterSpacing: 1 },
  arenaHeroTitle: { color: C.cream, fontSize: 21, fontWeight: '900', letterSpacing: 0.2, marginTop: 4 },
  arenaHeroDescription: { color: C.muted, fontSize: 8, lineHeight: 12, marginTop: 4 },
  arenaHeroActionRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 10 },
  playNowButton: { minHeight: 42, flex: 1, paddingHorizontal: 12, borderRadius: 10, backgroundColor: C.coral, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  playNowText: { color: C.ink, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  playNowArrow: { position: 'absolute', right: 11, color: C.ink, fontSize: 17, fontWeight: '900' },
  bountyBlock: { minWidth: 74, alignItems: 'center' },
  bountyLabel: { color: C.muted, fontSize: 5, fontWeight: '900', letterSpacing: 1 },
  bountyValue: { color: C.sand, fontSize: 8, fontWeight: '900', marginTop: 3 },
  energyNote: { color: C.muted, fontSize: 5, fontWeight: '900', letterSpacing: 0.8, marginTop: 8, textAlign: 'center' },
  vipStrip: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 9, marginTop: 11, borderRadius: 11, borderWidth: 1, borderColor: '#72503A', backgroundColor: '#2B2530' },
  vipIcon: { width: 29, height: 29, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#463628' },
  vipIconText: { color: C.sand, fontSize: 15 },
  vipCopy: { flex: 1 },
  vipTitle: { color: C.cream, fontSize: 7, fontWeight: '900', letterSpacing: 0.5 },
  vipTier: { color: C.sand },
  vipDescription: { color: C.muted, fontSize: 6, marginTop: 3 },
  vipClaim: { minHeight: 28, paddingHorizontal: 10, borderRadius: 7, backgroundColor: C.coral, alignItems: 'center', justifyContent: 'center' },
  vipClaimText: { color: C.ink, fontSize: 7, fontWeight: '900' },
  modeSectionHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 },
  modeEyebrow: { color: C.mint, fontSize: 6, fontWeight: '900', letterSpacing: 1.3 },
  modeTitle: { color: C.cream, fontSize: 15, fontWeight: '900', letterSpacing: 0.9, marginTop: 3 },
  modeSeeAll: { color: C.coral, fontSize: 7, fontWeight: '900', letterSpacing: 0.6 },
  modeRail: { gap: 8, paddingBottom: 2 },
  modeCard: { width: 166, minHeight: 116, padding: 10, borderRadius: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  modeCardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modeCardNumber: { fontSize: 14, fontWeight: '900', letterSpacing: 0.8 },
  modeCardArrow: { color: C.muted, fontSize: 14 },
  modeCardTitle: { color: C.cream, fontSize: 9, fontWeight: '900', letterSpacing: 0.5, marginTop: 4 },
  modeCardDetail: { color: C.muted, fontSize: 7, lineHeight: 10, minHeight: 22, marginTop: 4 },
  modeCardRule: { height: 2, width: 30, borderRadius: 2, marginTop: 6 },
  modeCardTag: { fontSize: 5, fontWeight: '900', letterSpacing: 0.8, marginTop: 5 },
  quickBar: { gap: 7, marginTop: 11, paddingBottom: 2 },
  quickBarItem: { width: 94, minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: C.line, backgroundColor: C.deep },
  quickBarIcon: { color: C.mint, fontSize: 14, fontWeight: '900' },
  quickBarLabel: { color: C.muted, fontSize: 5, fontWeight: '900', letterSpacing: 0.4, marginTop: 3 },
  homeToast: { position: 'absolute', alignSelf: 'center', bottom: 16, paddingHorizontal: 15, paddingVertical: 9, borderRadius: 20, backgroundColor: C.cardLight, borderWidth: 1, borderColor: C.mint },
  homeToastText: { color: C.mint, fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  tournamentPage: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 26, backgroundColor: C.ink },
  tournamentHero: { padding: 13, borderRadius: 15, backgroundColor: C.deep, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  tournamentHeroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tournamentEyebrow: { color: C.mint, fontSize: 6, fontWeight: '900', letterSpacing: 0.8 },
  tournamentTimer: { color: C.sand, fontSize: 5, fontWeight: '900', letterSpacing: 0.6 },
  tournamentTitle: { color: C.cream, fontSize: 20, fontWeight: '900', letterSpacing: 0.2, marginTop: 6 },
  tournamentSub: { color: C.muted, fontSize: 6, fontWeight: '800', letterSpacing: 0.6, marginTop: 4 },
  tournamentMatchup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: 10, borderRadius: 10, backgroundColor: '#0A1728', borderWidth: 1, borderColor: C.line },
  tournamentTeam: { flex: 1, minWidth: 0 },
  tournamentTeamRight: { alignItems: 'flex-end' },
  tournamentTeamRank: { fontSize: 5, fontWeight: '900', letterSpacing: 0.5 },
  tournamentTeamName: { color: C.cream, fontSize: 13, fontWeight: '900', marginTop: 5 },
  tournamentVs: { width: 29, height: 29, marginHorizontal: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 15, borderWidth: 1, borderColor: C.mint },
  tournamentVsText: { color: C.mint, fontSize: 8, fontWeight: '900' },
  tournamentTarget: { paddingVertical: 7, alignItems: 'center', marginTop: 9, borderRadius: 8, backgroundColor: '#15293B' },
  tournamentTargetText: { color: C.sand, fontSize: 6, fontWeight: '900', letterSpacing: 0.55 },
  tournamentPlay: { minHeight: 43, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 9, borderRadius: 9, backgroundColor: C.coral },
  tournamentPlayText: { color: C.ink, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  tournamentPlayArrow: { position: 'absolute', right: 12, color: C.ink, fontSize: 17, fontWeight: '900' },
  tournamentModeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  tournamentModeCard: { flex: 1, minHeight: 100, padding: 10, borderRadius: 11, backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  tournamentModeMeta: { color: C.mint, fontSize: 5, fontWeight: '900', letterSpacing: 0.6 },
  tournamentModeTitle: { color: C.cream, fontSize: 9, fontWeight: '900', marginTop: 7 },
  tournamentModeDetail: { color: C.muted, fontSize: 7, lineHeight: 10, marginTop: 5 },
  tournamentActions: { gap: 7, marginTop: 10 },
  tournamentAction: { minHeight: 45, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, borderRadius: 9, backgroundColor: C.deep, borderWidth: 1, borderColor: C.line },
  tournamentActionIcon: { color: C.coral, fontSize: 15, width: 23, textAlign: 'center' },
  tournamentActionTitle: { flex: 1, color: C.cream, fontSize: 7, fontWeight: '900', letterSpacing: 0.5 },
  tournamentActionDetail: { color: C.muted, fontSize: 5, fontWeight: '800' },
  tournamentNotice: { alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 8, marginTop: 10, borderRadius: 16, borderWidth: 1, borderColor: C.mint, backgroundColor: C.cardLight },
  tournamentNoticeText: { color: C.mint, fontSize: 7, fontWeight: '900' },
  tournamentServer: { color: C.muted, fontSize: 5, fontWeight: '800', letterSpacing: 0.9, textAlign: 'center', marginTop: 12 },
  formatPage: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 26, backgroundColor: C.ink },
  formatIntro: { marginTop: 8, marginBottom: 13 },
  formatEyebrow: { color: C.mint, fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  formatTitle: { color: C.cream, fontSize: 22, fontWeight: '900', letterSpacing: 0.3, marginTop: 5 },
  formatSubtitle: { color: C.muted, fontSize: 9, lineHeight: 14, marginTop: 5 },
  formatStatsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 5, marginTop: 11, padding: 8, borderRadius: 9, backgroundColor: C.deep, borderWidth: 1, borderColor: C.line },
  formatStat: { color: C.muted, fontSize: 5, fontWeight: '900', letterSpacing: 0.35 },
  formatStatValue: { color: C.sand },
  formatTeamCard: { padding: 12, borderRadius: 13, backgroundColor: C.deep, borderWidth: 1, borderColor: C.line, marginBottom: 13 },
  formatSectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 },
  formatSectionLabel: { color: C.cream, fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  formatSectionMeta: { color: C.muted, fontSize: 6, fontWeight: '800', letterSpacing: 0.5 },
  formatGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 7, marginBottom: 13 },
  formatOption: { width: '100%', minHeight: 94, padding: 10, borderRadius: 11, backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  formatOptionActive: { borderColor: C.mint, backgroundColor: '#102C3A' },
  formatOptionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  formatOptionPace: { color: C.muted, fontSize: 5, fontWeight: '900', letterSpacing: 0.8 },
  formatOptionNumber: { color: C.coral, fontSize: 14, fontWeight: '900' },
  formatOptionNumberActive: { color: C.mint },
  formatOptionOvers: { color: C.muted, fontSize: 6 },
  formatOptionCopy: { flex: 1 },
  formatOptionLabel: { color: C.cream, fontSize: 9, fontWeight: '900', letterSpacing: 0.6, marginTop: 2 },
  formatOptionLabelActive: { color: C.mint },
  formatOptionDescription: { color: C.muted, fontSize: 7, lineHeight: 10, marginTop: 3 },
  formatOptionBottom: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 4, marginTop: 7 },
  formatOptionMeta: { color: C.sand, fontSize: 5, fontWeight: '800' },
  formatCheck: { color: C.muted, fontSize: 5, fontWeight: '900', letterSpacing: 0.5 },
  formatCheckActive: { color: C.mint },
  telemetryCard: { padding: 11, borderRadius: 13, backgroundColor: C.deep, borderWidth: 1, borderColor: C.line },
  telemetryHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  telemetryTitle: { color: C.cream, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  telemetryLive: { color: C.mint, fontSize: 6, fontWeight: '900' },
  telemetryBody: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7 },
  telemetryMap: { width: '48%' },
  telemetryStats: { flex: 1, gap: 6 },
  telemetryVenue: { color: C.sand, fontSize: 6, fontWeight: '900', marginBottom: 2 },
  telemetryStat: { color: C.muted, fontSize: 6, fontWeight: '800' },
  telemetryValue: { color: C.cream, fontWeight: '900' },
  deliveryArsenal: { marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderColor: C.line },
  arsenalChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 },
  arsenalChip: { color: C.mint, fontSize: 5, fontWeight: '900', paddingHorizontal: 7, paddingVertical: 5, borderRadius: 6, backgroundColor: C.cardLight, borderWidth: 1, borderColor: C.line },
  formatPrefs: { flexDirection: 'row', gap: 8, marginTop: 10 },
  formatPreference: { flex: 1, minHeight: 53, padding: 9, borderRadius: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  formatPreferenceValue: { color: C.mint, fontSize: 8, fontWeight: '900', marginTop: 5 },
  formatPreferenceHint: { color: C.muted, fontSize: 5, marginTop: 3 },
  tossPreview: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 10, marginTop: 10, borderRadius: 10, backgroundColor: C.deep, borderWidth: 1, borderColor: C.line },
  tossPreviewIcon: { color: C.coral, fontSize: 17 },
  tossPreviewCopy: { flex: 1 },
  tossPreviewTitle: { color: C.cream, fontSize: 7, fontWeight: '900', letterSpacing: 0.7 },
  tossPreviewText: { color: C.muted, fontSize: 6, marginTop: 3 },
  formatStartButton: { minHeight: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, borderRadius: 10, backgroundColor: C.coral },
  formatStartText: { color: C.ink, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  formatStartArrow: { position: 'absolute', right: 14, color: C.ink, fontSize: 17, fontWeight: '900' },
  formatFootnote: { color: C.muted, fontSize: 5, fontWeight: '800', letterSpacing: 0.8, textAlign: 'center', marginTop: 9 },
  gameScreen: { flex: 1, backgroundColor: '#76B7B7', overflow: 'hidden' },
  orientationSplash: { flex: 1, backgroundColor: '#071E1C', alignItems: 'center', justifyContent: 'center' },
  orientationTitle: { color: C.mint, fontSize: 15, fontWeight: '900', letterSpacing: 2 },
  orientationHint: { color: C.cream, fontSize: 11, marginTop: 8 },
  presentationScreen: { flex: 1, backgroundColor: '#152D31', overflow: 'hidden' },
  presentationOverlay: { ...StyleSheet.absoluteFill, justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 9, backgroundColor: 'rgba(4,15,21,0.28)' },
  presentationTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  presentationKicker: { color: '#42D7C3', fontSize: 7, fontWeight: '900', letterSpacing: 1.6 },
  presentationTitle: { color: C.cream, fontSize: 16, fontWeight: '900', letterSpacing: 1.5, marginTop: 2 },
  presentationBack: { minHeight: 30, minWidth: 68, paddingHorizontal: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(5,22,28,0.88)', borderWidth: 1, borderColor: '#47636A' },
  presentationBackText: { color: '#E8F0E9', fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  tossTeamsRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  tossTeamBlock: { width: '22%', alignItems: 'center', justifyContent: 'center' },
  tossTeamMark: { width: 62, height: 62, borderWidth: 2, borderRadius: 19, transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,24,31,0.9)' },
  tossTeamMarkText: { fontSize: 13, fontWeight: '900', transform: [{ rotate: '-45deg' }] },
  tossTeamName: { color: C.cream, fontSize: 8, fontWeight: '900', letterSpacing: 1.2, marginTop: 12 },
  tossCoinBlock: { minWidth: 280, maxWidth: 410, alignItems: 'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 15, backgroundColor: 'rgba(7,22,29,0.9)', borderWidth: 1, borderColor: 'rgba(231,242,223,0.28)' },
  coinDisc: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#D39A3C', borderWidth: 4, borderColor: '#F0D689', shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 7, elevation: 4 },
  coinDiscActive: { backgroundColor: '#26B5AA', borderColor: '#8CE5CE' },
  coinDiscFace: { color: '#142E31', fontSize: 25, fontWeight: '900' },
  tossOutcomeText: { color: C.cream, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginTop: 7, textAlign: 'center' },
  tossOutcomeSub: { color: '#A9C1B7', fontSize: 6, fontWeight: '800', letterSpacing: 0.7, marginTop: 4 },
  tossChoiceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 9 },
  tossChoiceButton: { minHeight: 32, minWidth: 96, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#142D38', borderWidth: 1, borderColor: '#D06A26', alignItems: 'center', justifyContent: 'center' },
  tossChoiceText: { color: C.cream, fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  opponentTossText: { color: '#FFAE57', fontSize: 7, fontWeight: '900', letterSpacing: 0.7, textAlign: 'center' },
  lineupChooser: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3, marginBottom: 8 },
  lineupTeamTab: { minHeight: 27, paddingHorizontal: 12, borderRadius: 7, justifyContent: 'center', backgroundColor: 'rgba(7,25,32,0.84)', borderWidth: 1, borderColor: '#4A646B' },
  lineupTeamTabActive: { backgroundColor: '#263E4A', borderColor: '#E8792A' },
  lineupTeamTabText: { color: '#A8B9B7', fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  lineupTeamTabTextActive: { color: '#48D9C6' },
  lineupTossResult: { flex: 1, color: '#FF9A45', fontSize: 7, fontWeight: '900', letterSpacing: 1, textAlign: 'right' },
  lineupGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', gap: 6 },
  playerCard: { width: '15.5%', minHeight: 86, padding: 5, borderRadius: 8, backgroundColor: 'rgba(8,25,33,0.94)', borderWidth: 1, borderColor: '#3D5962', alignItems: 'center', justifyContent: 'center' },
  playerCardTop: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  playerRating: { color: '#FFE28A', fontSize: 8, fontWeight: '900' },
  playerIndex: { color: '#88A1A5', fontSize: 5, fontWeight: '800' },
  playerPortrait: { width: 29, height: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 3, borderWidth: 1, borderColor: '#627D7D' },
  playerInitial: { color: '#F5EEDC', fontSize: 13, fontWeight: '900' },
  playerName: { width: '100%', color: '#F1F2E6', fontSize: 5, fontWeight: '900', letterSpacing: 0.2, textAlign: 'center', marginTop: 4 },
  playerRole: { color: '#4BD8C5', fontSize: 5, fontWeight: '900', letterSpacing: 0.8, marginTop: 2 },
  lineupFooter: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 },
  lineupFooterText: { color: '#DAE7E0', fontSize: 6, fontWeight: '800', letterSpacing: 1 },
  lineupStartButton: { minHeight: 31, paddingHorizontal: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#C56526', borderWidth: 1, borderColor: '#FFB64C' },
  lineupStartText: { color: '#FFF4D8', fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  resultPresentationOverlay: { backgroundColor: 'rgba(3,15,23,0.47)' },
  resultCenterWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  resultShowcase: { width: '72%', maxWidth: 620, minHeight: 185, paddingHorizontal: 22, paddingVertical: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: 'rgba(17,39,51,0.95)', borderWidth: 1, borderColor: '#D46B24', borderTopWidth: 3 },
  resultEyebrow: { color: '#43D8C5', fontSize: 8, fontWeight: '900', letterSpacing: 1.8 },
  resultWinner: { color: C.cream, fontSize: 20, fontWeight: '900', letterSpacing: 1.2, marginTop: 8, textAlign: 'center' },
  resultScoreLine: { color: '#C7DDE1', fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginTop: 8, textAlign: 'center' },
  resultRule: { width: '78%', height: 1, backgroundColor: 'rgba(128,164,173,0.42)', marginVertical: 12 },
  resultMessage: { color: '#75B8E3', fontSize: 9, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
  matchAward: { width: '82%', alignItems: 'center', marginTop: 12, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9, borderWidth: 1, borderColor: 'rgba(0,240,255,0.3)', backgroundColor: 'rgba(4,19,29,0.7)' },
  matchAwardEyebrow: { color: C.sand, fontSize: 6, fontWeight: '900', letterSpacing: 1 },
  matchAwardName: { color: C.mint, fontSize: 12, fontWeight: '900', letterSpacing: 0.8, marginTop: 4 },
  matchAwardDetail: { color: C.muted, fontSize: 5, fontWeight: '800', letterSpacing: 0.5, marginTop: 3 },
  resultAction: { minHeight: 36, minWidth: 180, paddingHorizontal: 16, marginTop: 13, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#C56526', borderWidth: 1, borderColor: '#FFB64C' },
  resultActionText: { color: '#FFF4D8', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  gameOverlay: { ...StyleSheet.absoluteFill, justifyContent: 'space-between', paddingHorizontal: 11, paddingTop: 7, paddingBottom: 5 },
  gameTopBar: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, minHeight: 63 },
  gameIconButton: { width: 38, height: 42, borderRadius: 13, backgroundColor: 'rgba(7,30,28,0.86)', borderWidth: 1, borderColor: 'rgba(245,238,220,0.22)', alignItems: 'center', justifyContent: 'center' },
  gameBackText: { color: C.cream, fontSize: 30, lineHeight: 32, marginTop: -4 },
  miniMapCard: { width: 72, height: 71, padding: 4, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: 'rgba(7,30,28,0.72)', borderWidth: 1, borderColor: 'rgba(245,238,220,0.18)' },
  miniMapLabel: { color: '#D1E8D2', fontSize: 5, fontWeight: '900', letterSpacing: 0.5, marginBottom: 1 },
  gameMetaBlock: { flex: 1, minWidth: 0, paddingTop: 4 },
  gameMetaText: { color: '#E5F0DC', fontSize: 7, fontWeight: '800', letterSpacing: 1, marginTop: 5 },
  gameLive: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  gameLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.coral },
  gameLiveText: { color: '#FFD7CE', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  endGameButton: { height: 36, paddingHorizontal: 12, borderRadius: 10, backgroundColor: 'rgba(7,30,28,0.86)', borderWidth: 1, borderColor: 'rgba(245,238,220,0.22)', alignItems: 'center', justifyContent: 'center' },
  endGameText: { color: C.coral, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  gameBanner: { alignSelf: 'center', marginTop: 12, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: 'rgba(7,30,28,0.9)', borderWidth: 1, borderColor: C.mint },
  gameBannerText: { color: C.mint, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  gameControlsRow: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, paddingBottom: 5 },
  controlPanel: { width: '27%', minWidth: 130, maxWidth: 244, maxHeight: '92%', minHeight: 0, padding: 8, borderRadius: 13, backgroundColor: 'rgba(7,30,28,0.83)', borderWidth: 1, borderColor: 'rgba(245,238,220,0.22)' },
  controlEyebrow: { color: C.mint, fontSize: 7, fontWeight: '900', letterSpacing: 1.05 },
  controlTitle: { color: C.cream, fontSize: 10, fontWeight: '900', marginTop: 4 },
  controlHint: { color: C.muted, fontSize: 7, lineHeight: 9, marginTop: 3, minHeight: 15 },
  timingPad: { minHeight: 74, marginTop: 5, borderRadius: 10, backgroundColor: 'rgba(31,65,58,0.92)', borderWidth: 1, borderColor: C.line, padding: 8, justifyContent: 'center' },
  timingPadActive: { borderColor: C.mint, backgroundColor: 'rgba(36,75,61,0.97)' },
  timingTrackCompact: { height: 14, borderRadius: 8, overflow: 'visible', flexDirection: 'row', backgroundColor: '#1C403A', position: 'relative' },
  timingLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  timingLegendText: { color: '#D5E5D7', fontSize: 5, fontWeight: '900', letterSpacing: 0.6 },
  timingLegendSweet: { color: C.mint, fontSize: 5, fontWeight: '900', letterSpacing: 0.6 },
  timingEarlyCompact: { flex: 4, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, backgroundColor: '#D97461' },
  timingSweetCompact: { flex: 2, backgroundColor: '#BDEB74' },
  timingLateCompact: { flex: 4, borderTopRightRadius: 8, borderBottomRightRadius: 8, backgroundColor: '#DFAF5D' },
  timingBallCompact: { position: 'absolute', top: -4, width: 6, height: 22, borderRadius: 4, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.ink, marginLeft: -3 },
  timingPadAction: { color: C.cream, textAlign: 'center', fontSize: 9, fontWeight: '900', letterSpacing: 0.6, marginTop: 10 },
  tinyControlHint: { color: C.muted, fontSize: 6, lineHeight: 8, marginTop: 4, textAlign: 'center', fontWeight: '700' },
  movementControlRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 5 },
  movementPad: { width: 76, height: 76, borderRadius: 38, borderWidth: 2, borderColor: 'rgba(233,240,217,0.68)', backgroundColor: 'rgba(43,83,61,0.8)', alignItems: 'center', justifyContent: 'center' },
  movementKnob: { width: 25, height: 25, borderRadius: 13, backgroundColor: 'rgba(223,236,198,0.5)', borderWidth: 1, borderColor: 'rgba(246,244,223,0.78)' },
  movementArrow: { position: 'absolute', color: 'rgba(237,243,221,0.78)', fontSize: 9, fontWeight: '900' },
  movementArrowUp: { top: 3 },
  movementArrowRight: { right: 4 },
  movementArrowDown: { bottom: 3 },
  movementArrowLeft: { left: 4 },
  movementCopy: { flex: 1 },
  movementTitle: { color: C.cream, fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  movementHint: { color: '#91A99B', fontSize: 6, fontWeight: '800', letterSpacing: 0.45, marginTop: 4 },
  pitchAimPad: { width: 102, height: 102, alignSelf: 'center', marginTop: 3, borderRadius: 51, backgroundColor: '#376B52', borderWidth: 2, borderColor: '#88B973', overflow: 'hidden' },
  pitchMapPitch: { position: 'absolute', width: 28, height: 68, left: 35, top: 15, borderRadius: 7, backgroundColor: '#C5A879', borderWidth: 1, borderColor: '#E7D2A6' },
  pitchAimMarker: { position: 'absolute', width: 18, height: 18, marginLeft: -9, marginTop: -9, borderRadius: 9, backgroundColor: C.coral, borderWidth: 3, borderColor: '#FFF4DC', shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 3, elevation: 3 },
  pitchMapTop: { position: 'absolute', top: 3, width: '100%', textAlign: 'center', color: '#EAF3DC', fontSize: 5, fontWeight: '900', letterSpacing: 1 },
  pitchMapBottom: { position: 'absolute', bottom: 2, width: '100%', textAlign: 'center', color: '#EAF3DC', fontSize: 5, fontWeight: '900', letterSpacing: 1 },
  choiceRow: { flexDirection: 'row', gap: 4, marginTop: 5 },
  bowlingVariationGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 4, marginTop: 6 },
  bowlingVariationChip: { width: '31%', minHeight: 28, borderRadius: 8, borderWidth: 1, borderColor: C.line, backgroundColor: '#173B36', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  bowlingVariationText: { color: C.cream, fontSize: 6.5, fontWeight: '900', textAlign: 'center', lineHeight: 8 },
  choiceChip: { flex: 1, minHeight: 27, borderRadius: 7, borderWidth: 1, borderColor: '#41675D', backgroundColor: '#173F38', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  choiceChipActive: { backgroundColor: C.mint, borderColor: C.mint },
  choiceChipQuiet: { borderColor: '#709078' },
  controlDisabled: { opacity: 0.58 },
  choiceText: { color: '#D5E5D7', fontSize: 7, fontWeight: '900', letterSpacing: 0.3 },
  choiceTextActive: { color: C.ink },
  footworkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 },
  footworkChip: { width: '48%', minHeight: 27, borderRadius: 7, borderWidth: 1, borderColor: '#41675D', backgroundColor: '#173F38', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  footworkChipActive: { borderColor: '#A9D86B', backgroundColor: '#335633' },
  footworkText: { color: '#D5E5D7', fontSize: 7, fontWeight: '900', letterSpacing: 0.1 },
  speedLabel: { color: C.muted, fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  speedValue: { color: C.cream, fontSize: 9 },
  speedTrack: { height: 9, marginTop: 4, marginBottom: 5, borderRadius: 6, backgroundColor: '#314E46', position: 'relative', justifyContent: 'center' },
  speedFill: { position: 'absolute', left: 0, height: 5, borderRadius: 3, backgroundColor: C.mint },
  speedThumb: { position: 'absolute', width: 15, height: 15, marginLeft: -7, borderRadius: 8, backgroundColor: C.cream, borderWidth: 2, borderColor: C.mint },
  phaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  phaseReadout: { color: C.mint, fontSize: 8, fontWeight: '900' },
  phaseTrack: { height: 9, marginTop: 4, borderRadius: 6, overflow: 'hidden', backgroundColor: '#4A8061', flexDirection: 'row', position: 'relative' },
  phaseSafeZone: { width: '88%', backgroundColor: '#8BBC5E' },
  phaseRedZone: { flex: 1, backgroundColor: '#E94C43' },
  phaseNeedle: { position: 'absolute', top: -1, width: 4, height: 13, marginLeft: -2, borderRadius: 3, backgroundColor: '#FFF9E8', borderWidth: 1, borderColor: C.ink },
  releaseButton: { minHeight: 31, marginTop: 6, borderRadius: 8, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  releaseButtonDisabled: { backgroundColor: '#577061' },
  releaseButtonText: { color: C.ink, fontSize: 8, fontWeight: '900', letterSpacing: 0.3, textAlign: 'center' },
  scoreStrip: { height: 47, flexDirection: 'row', alignItems: 'stretch', backgroundColor: 'rgba(4,18,23,0.94)', borderTopWidth: 1, borderColor: 'rgba(191,220,209,0.22)', marginHorizontal: -11 },
  scoreSide: { flex: 1, justifyContent: 'center', paddingHorizontal: 10, minWidth: 0 },
  scoreSideRight: { alignItems: 'flex-end' },
  scoreSideRightText: { textAlign: 'right' },
  scoreTeamLabel: { color: '#47DBC9', fontSize: 6, fontWeight: '900', letterSpacing: 0.75 },
  scorePlayerText: { color: '#E9F0E7', fontSize: 7, fontWeight: '800', marginTop: 3 },
  scoreCenter: { width: '29%', minWidth: 150, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(22,46,58,0.96)', borderLeftWidth: 2, borderRightWidth: 2, borderColor: '#E27A28' },
  scoreCenterTop: { color: C.cream, fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  scoreCenterValue: { color: '#54E3CF' },
  scoreCenterBottom: { color: '#A8C8DA', fontSize: 6, fontWeight: '800', letterSpacing: 0.5, marginTop: 3 },
  page: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 22, backgroundColor: C.ink },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  brandMark: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-4deg' }] },
  brandIcon: { color: C.ink, fontSize: 13, fontWeight: '900', letterSpacing: -0.7 },
  brandWords: { marginLeft: 10, flex: 1 },
  brandName: { color: C.cream, fontSize: 15, letterSpacing: 2.1, fontWeight: '900' },
  brandPeriod: { color: C.mint },
  brandEyebrow: { color: C.muted, fontSize: 8, letterSpacing: 1.7, marginTop: 3, fontWeight: '700' },
  headerButton: { width: 38, height: 38, borderWidth: 1, borderColor: C.line, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  headerButtonText: { color: C.cream, fontSize: 16 },
  backButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  backArrow: { color: C.cream, fontSize: 27, lineHeight: 29, marginTop: -3 },
  hero: { backgroundColor: C.deep, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: C.line, overflow: 'hidden', marginBottom: 24 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  kicker: { color: C.mint, fontSize: 9, fontWeight: '800', letterSpacing: 2.3 },
  heroTitle: { color: C.cream, fontSize: 34, fontWeight: '900', letterSpacing: -1.5, lineHeight: 35, marginTop: 7 },
  heroSub: { color: C.muted, fontSize: 12, marginTop: 7, letterSpacing: 0.2 },
  heroBadge: { height: 56, width: 56, borderRadius: 19, backgroundColor: '#203F36', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#355749', transform: [{ rotate: '6deg' }] },
  badgeBall: { color: C.coral, fontSize: 12 },
  badgeText: { color: C.cream, fontSize: 8, lineHeight: 10, fontWeight: '900', letterSpacing: 1.3, textAlign: 'center', marginTop: 2 },
  homeField: { marginHorizontal: -9, marginTop: -3, marginBottom: -13 },
  venueLabel: { flexDirection: 'row', alignItems: 'center', paddingTop: 6 },
  venueIcon: { color: C.mint, fontSize: 16, fontWeight: '700', marginRight: 6 },
  venueText: { color: C.cream, fontSize: 9, letterSpacing: 1.3, fontWeight: '900' },
  venueBeach: { color: C.muted, fontSize: 8, letterSpacing: 1, fontWeight: '700' },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 },
  fieldLabel: { color: C.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.4 },
  fieldHint: { color: '#78948A', fontSize: 9, letterSpacing: 0.7, fontWeight: '600' },
  sectionRight: { color: C.mint, fontSize: 8, fontWeight: '900', letterSpacing: 1.4 },
  setupCard: { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.line, padding: 15 },
  teamRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  teamPicker: { flex: 1, alignItems: 'center', paddingVertical: 3 },
  teamBadge: { width: 48, height: 48, borderRadius: 17, backgroundColor: '#0B2825', borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  teamBadgeText: { fontSize: 13, fontWeight: '900', letterSpacing: 0.4 },
  teamName: { color: C.cream, fontSize: 12, fontWeight: '800', marginTop: 7 },
  teamPickerHint: { color: '#759087', fontSize: 7, letterSpacing: 1, marginTop: 3, fontWeight: '700' },
  vsCircle: { width: 28, height: 28, borderRadius: 10, backgroundColor: '#0A2421', alignItems: 'center', justifyContent: 'center', marginHorizontal: 4, transform: [{ rotate: '45deg' }] },
  vsText: { color: '#C0D2C3', fontSize: 8, fontWeight: '900', transform: [{ rotate: '-45deg' }] },
  chipRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 7, marginTop: 10 },
  overChip: { flex: 1, height: 47, borderWidth: 1, borderColor: C.line, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D2A27' },
  overChipActive: { backgroundColor: C.mint, borderColor: C.mint },
  overNumber: { color: C.cream, fontSize: 14, fontWeight: '900' },
  overNumberActive: { color: C.ink },
  overCaption: { color: '#82A097', fontSize: 7, fontWeight: '800', marginTop: 1, letterSpacing: 1.2 },
  overCaptionActive: { color: '#34502D' },
  setupBottom: { flexDirection: 'row', gap: 10, marginTop: 17, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.line },
  smallSelect: { flex: 1, backgroundColor: '#0D2A27', borderRadius: 12, padding: 10 },
  selectValue: { color: C.cream, fontSize: 11, fontWeight: '800', marginTop: 6 },
  chevron: { color: C.mint, fontSize: 13 },
  primaryButton: { height: 54, borderRadius: 16, backgroundColor: C.mint, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 13 },
  primaryButtonText: { color: C.ink, fontSize: 11, fontWeight: '900', letterSpacing: 1.8 },
  primaryArrow: { position: 'absolute', right: 18, color: C.ink, fontSize: 19, fontWeight: '800' },
  homeFootnote: { color: '#6E8A80', fontSize: 7, fontWeight: '700', letterSpacing: 1.15, textAlign: 'center', marginTop: 13, marginBottom: 18 },
  bottomTabs: { height: 63, backgroundColor: '#102B28', borderRadius: 18, borderWidth: 1, borderColor: C.line, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 9 },
  tabItem: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  tabIcon: { color: '#719088', fontSize: 17, lineHeight: 20 },
  tabIconActive: { color: C.mint },
  tabLabel: { color: '#78948B', fontSize: 8, marginTop: 4, fontWeight: '700', letterSpacing: 0.35 },
  tabLabelActive: { color: C.cream },
  tabIndicator: { position: 'absolute', top: -1, height: 2, width: 19, backgroundColor: C.mint, borderRadius: 2 },
  matchTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  matchMeta: { color: C.muted, fontSize: 8, fontWeight: '800', letterSpacing: 1.5 },
  livePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#214A3D', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 },
  livePillQuiet: { backgroundColor: '#29453F' },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.mint, marginRight: 5 },
  liveLabel: { color: C.mint, fontSize: 7, fontWeight: '900', letterSpacing: 1.1 },
  scoreCard: { backgroundColor: C.cream, borderRadius: 19, padding: 16, marginBottom: 11 },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  inningsLabel: { color: '#637363', fontSize: 8, fontWeight: '900', letterSpacing: 1.3 },
  scoreValue: { color: '#142922', fontSize: 43, fontWeight: '900', letterSpacing: -2, lineHeight: 50, marginTop: 1 },
  scoreWickets: { color: '#597061', fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  overBlock: { alignItems: 'flex-end', paddingBottom: 4 },
  overLabel: { color: '#637363', fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  overValue: { color: '#142922', fontSize: 21, fontWeight: '900', marginTop: 3 },
  overLimit: { color: '#788778', fontSize: 12, fontWeight: '700' },
  scoreDivider: { height: 1, backgroundColor: '#D8D4C5', marginVertical: 10 },
  scoreBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  scoreStat: { flex: 1 },
  scoreStatLabel: { color: '#758175', fontSize: 7, fontWeight: '900', letterSpacing: 1.2 },
  scoreStatValue: { color: '#20342B', fontSize: 11, fontWeight: '900', marginTop: 4 },
  fieldCard: { backgroundColor: C.deep, borderRadius: 18, padding: 13, borderWidth: 1, borderColor: C.line, marginBottom: 10, overflow: 'hidden' },
  fieldHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sunIcon: { height: 27, width: 27, backgroundColor: '#28483A', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sunText: { color: '#F3D885', fontSize: 18, lineHeight: 21 },
  liveField: { marginHorizontal: -5, marginVertical: -4 },
  fieldFoot: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 3, marginTop: -2 },
  fieldFootText: { color: '#9BB5A2', fontSize: 7, fontWeight: '800', letterSpacing: 1 },
  overCard: { backgroundColor: C.card, borderRadius: 16, padding: 13, borderWidth: 1, borderColor: C.line, marginBottom: 10 },
  overCardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ballCount: { color: '#82A097', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  ballHistory: { flexDirection: 'row', gap: 8, marginTop: 10 },
  ballChip: { width: 29, height: 29, borderRadius: 10, borderWidth: 1, borderColor: '#40625A', backgroundColor: '#0D2A27', alignItems: 'center', justifyContent: 'center' },
  ballChipBoundary: { backgroundColor: '#D2ED9C', borderColor: '#D2ED9C' },
  ballChipWicket: { backgroundColor: '#A44D42', borderColor: '#A44D42' },
  ballText: { color: '#C5D3C8', fontSize: 11, fontWeight: '900' },
  wicketText: { color: C.white },
  playCard: { backgroundColor: C.card, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: C.line, marginBottom: 10 },
  deliveryHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paceLabel: { color: C.mint, fontSize: 17, fontWeight: '900' },
  paceUnit: { color: '#86A49A', fontSize: 8, fontWeight: '700' },
  timingTrack: { height: 13, marginTop: 17, position: 'relative', flexDirection: 'row', borderRadius: 7, overflow: 'visible', backgroundColor: '#25453F' },
  timingEarly: { flex: 0.36, backgroundColor: '#415C4F', borderTopLeftRadius: 7, borderBottomLeftRadius: 7 },
  timingSweet: { flex: 0.29, backgroundColor: '#83A857' },
  timingLate: { flex: 0.35, backgroundColor: '#415C4F', borderTopRightRadius: 7, borderBottomRightRadius: 7 },
  timingBall: { position: 'absolute', top: -5, width: 22, height: 22, borderRadius: 11, backgroundColor: C.coral, borderWidth: 3, borderColor: C.cream, marginLeft: -11, shadowColor: C.coral, shadowOpacity: 0.45, shadowRadius: 8, elevation: 4 },
  trackLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  trackCaption: { color: '#78948B', fontSize: 7, fontWeight: '900', letterSpacing: 1.1 },
  trackSweet: { color: C.mint, fontSize: 7, fontWeight: '900', letterSpacing: 1.2 },
  shotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 13 },
  shotButton: { width: '48%', flexGrow: 1, minHeight: 51, borderRadius: 12, backgroundColor: '#173B36', borderWidth: 1, borderColor: '#31564F', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 9 },
  shotButtonReady: { backgroundColor: '#244A3D', borderColor: '#7B9A53' },
  shotButtonLoft: { borderColor: '#A57952' },
  shotIcon: { color: C.cream, fontSize: 16, fontWeight: '900', width: 18, textAlign: 'center' },
  shotIconLoft: { color: '#E6B86B' },
  shotLabel: { color: '#DBE7D8', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  deliveryButton: { minHeight: 46, backgroundColor: C.mint, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 12, flexDirection: 'row' },
  deliveryButtonDisabled: { backgroundColor: '#456444' },
  deliveryButtonText: { color: C.ink, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  deliveryArrow: { position: 'absolute', right: 14, color: C.ink, fontSize: 17, fontWeight: '900' },
  endLink: { alignSelf: 'center', marginTop: 11, padding: 4 },
  endLinkText: { color: '#89A49A', fontSize: 8, fontWeight: '800', letterSpacing: 1.2 },
  playBanner: { textAlign: 'center', color: C.mint, fontSize: 15, fontWeight: '900', letterSpacing: 1.2, paddingVertical: 24 },
  resultCard: { backgroundColor: C.card, borderRadius: 22, padding: 22, alignItems: 'center', borderWidth: 1, borderColor: C.line, marginTop: 26 },
  resultIcon: { fontSize: 42, marginBottom: 15 },
  resultTitle: { color: C.cream, fontSize: 27, fontWeight: '900', letterSpacing: -0.8, marginTop: 8 },
  resultScore: { color: C.muted, fontSize: 11, marginTop: 7 },
  breakCard: { backgroundColor: C.card, borderRadius: 22, padding: 17, borderWidth: 1, borderColor: C.line, marginTop: 12 },
  breakScore: { color: C.cream, fontSize: 19, fontWeight: '800', marginTop: 9 },
  breakScoreStrong: { color: C.mint, fontSize: 25, fontWeight: '900' },
  breakCopy: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  breakField: { marginTop: 2, marginBottom: 2 },
  screenIntro: { marginTop: 15, marginBottom: 17 },
  sectionTitle: { color: C.cream, fontSize: 28, fontWeight: '900', letterSpacing: -0.8, marginTop: 6, marginBottom: 4 },
  rosterCard: { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.line, paddingHorizontal: 12, paddingTop: 4 },
  rosterRow: { minHeight: 61, borderBottomWidth: 1, borderBottomColor: '#294A43', flexDirection: 'row', alignItems: 'center', gap: 9 },
  rosterNum: { color: '#78948B', fontSize: 9, fontWeight: '800', width: 20 },
  avatar: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#24473F', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: C.mint, fontSize: 14, fontWeight: '900' },
  rosterNameBlock: { flex: 1 },
  rosterName: { color: C.cream, fontSize: 11, fontWeight: '800' },
  rosterDetail: { color: '#8DA69C', fontSize: 7, letterSpacing: 0.5, marginTop: 4, fontWeight: '700' },
  rosterRole: { color: C.mint, fontSize: 7, fontWeight: '900', letterSpacing: 0.6 },
  infoNote: { backgroundColor: '#18342F', borderRadius: 14, padding: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 12 },
  infoNoteIcon: { color: C.mint, fontSize: 14, fontWeight: '900' },
  infoNoteText: { color: '#B1C4B8', fontSize: 10, lineHeight: 15, flex: 1 },
  settingsCard: { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.line, paddingHorizontal: 14 },
  settingRow: { minHeight: 67, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#2B4C45' },
  settingRowLast: { borderBottomWidth: 0 },
  settingText: { flex: 1, paddingRight: 10 },
  settingTitle: { color: C.cream, fontSize: 11, fontWeight: '800' },
  settingDescription: { color: '#8EA79D', fontSize: 9, marginTop: 4 },
  settingsSection: { marginTop: 21 },
  difficultyChip: { flex: 1, minHeight: 39, alignItems: 'center', justifyContent: 'center', borderRadius: 11, borderWidth: 1, borderColor: C.line, backgroundColor: C.card },
  difficultyText: { color: C.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
});
