
import { UserProfile, LeaderboardEntry } from "../types";

const STORAGE_KEY = 'cosmic_coin_player_v1';

// Mock Data for Leaderboard
const MOCK_LEADERBOARD_DATA = [
  { name: 'CosmicKing', tag: 'CosmicKing#1337', score: 128, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=King' },
  { name: 'StarWalker', tag: 'StarWalker#9021', score: 85, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Star' },
  { name: 'NebulaSurfer', tag: 'Nebula#4422', score: 64, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nebula' },
  { name: 'QuantumFlip', tag: 'Quantum#0001', score: 52, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Quantum' },
  { name: 'VoidGazer', tag: 'Void#8888', score: 41, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Void' },
  { name: 'LuckyCharm', tag: 'Lucky#7777', score: 33, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky' },
  { name: 'CoinMaster', tag: 'Master#5555', score: 25, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Master' },
  { name: 'EdgeSeeker', tag: 'Edge#1010', score: 18, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Edge' },
  { name: 'NewComer', tag: 'Newbie#1234', score: 12, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Newbie' },
];

export const playerService = {
  // Get local user
  getPlayer: (): UserProfile | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Create new profile
  createPlayer: (name: string, age: number): UserProfile => {
    const randomTag = Math.floor(1000 + Math.random() * 9000);
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
    const gamerTag = `${cleanName}#${randomTag}`;

    const newPlayer: UserProfile = {
      id: `player-${Date.now()}`,
      name,
      age,
      gamerTag,
      highScore: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${gamerTag}`,
      isNewUser: false,
      friends: [],
      inventory: []
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlayer));
    return newPlayer;
  },

  // Update High Score
  updateHighScore: (player: UserProfile, newScore: number): UserProfile => {
    if (newScore <= player.highScore) return player;

    const updatedPlayer = { ...player, highScore: newScore };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlayer));
    return updatedPlayer;
  },

  // Get Leaderboard (Mock + Local)
  getLeaderboard: (currentPlayer: UserProfile | null): LeaderboardEntry[] => {
    let allEntries = MOCK_LEADERBOARD_DATA.map((entry, index) => ({
      id: `bot-${index}`,
      rank: 0,
      name: entry.name,
      gamerTag: entry.tag,
      score: entry.score,
      isCurrentUser: false,
      avatar: entry.avatar
    }));

    if (currentPlayer) {
      // Check if current player is already represented (simulated) or just push them
      allEntries.push({
        id: currentPlayer.id,
        rank: 0,
        name: currentPlayer.name,
        gamerTag: currentPlayer.gamerTag,
        score: currentPlayer.highScore,
        isCurrentUser: true,
        avatar: currentPlayer.avatar
      });
    }

    // Sort by score desc
    allEntries.sort((a, b) => b.score - a.score);

    // Assign ranks
    return allEntries.slice(0, 50).map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }
};
