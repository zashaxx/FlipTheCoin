
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
  unlocked?: boolean; // Optional in definition, managed in state
  secret?: boolean;
  condition?: (streak: number, result: CoinSide, history: CoinSide[], multiplier: number) => boolean;
}