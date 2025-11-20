
export enum CoinSide {
  HEADS = 'HEADS',
  TAILS = 'TAILS',
  EDGE = 'EDGE'
}

export enum AppState {
  IDLE = 'IDLE',
  FLIPPING = 'FLIPPING',
  RESULT = 'RESULT'
}

export enum AchievementRarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC'
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  reward: number; // Cash reward amount
  unlocked?: boolean; 
  secret?: boolean;
  condition?: (streak: number, result: CoinSide, history: CoinSide[], multiplier: number, totalFlips: number, previousMultiplier: number) => boolean;
}

export interface Friend {
  id: string;
  name: string;
  gamerTag: string;
  status: 'online' | 'offline' | 'playing';
  avatar?: string;
}

export interface Trophy {
  id: string;
  name: string;
  price: number;
  icon: string;
  color: string; // hex or gradient class
  glowColor: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number | null;
  gamerTag: string;
  avatar: string;
  highScore: number;
  isNewUser: boolean;
  friends: Friend[];
  inventory: string[]; // Array of Trophy IDs
  email?: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  gamerTag: string;
  score: number;
  isCurrentUser: boolean;
  avatar: string;
}

export interface ActiveBet {
  amount: number;
  targetStreak: number;
  startStreak: number;
  potentialPayout: number;
}
