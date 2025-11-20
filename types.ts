
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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked?: boolean; 
  secret?: boolean;
  condition?: (streak: number, result: CoinSide, history: CoinSide[], multiplier: number) => boolean;
}

export interface Friend {
  id: string;
  name: string;
  gamerTag: string;
  status: 'online' | 'offline' | 'playing';
  avatar?: string;
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