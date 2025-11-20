
import { UserProfile, Friend } from "../types";

// Simulates a database delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEY = 'cosmic_coin_user';

// Mock Data for "Friends" you can add
const MOCK_DATABASE_USERS: Friend[] = [
  { id: 'bot-1', name: 'StarGazer', gamerTag: 'StarGazer#9999', status: 'playing' },
  { id: 'bot-2', name: 'Luna', gamerTag: 'Luna#1234', status: 'online' },
  { id: 'bot-3', name: 'CoinMaster', gamerTag: 'CoinMaster#7777', status: 'offline' },
  { id: 'bot-4', name: 'NebulaWalker', gamerTag: 'Nebula#4321', status: 'playing' },
];

export const authService = {
  // Check if user is already "logged in" via local storage
  getCurrentUser: (): UserProfile | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Simulate Google Login
  loginWithGoogle: async (): Promise<UserProfile> => {
    await delay(1500); // Fake network delay

    // Check if we already have a user
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      return JSON.parse(existing);
    }

    // Create a fresh "Google" user
    const newUser: UserProfile = {
      id: 'user-' + Date.now(),
      email: 'cosmic.traveler@gmail.com', // Simulated email
      name: '', // Empty triggers onboarding
      age: null,
      gamerTag: '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      friends: [],
      inventory: [],
      isNewUser: true,
      highScore: 0
    };

    return newUser;
  },

  // Complete Onboarding
  completeOnboarding: async (user: UserProfile, name: string, age: number): Promise<UserProfile> => {
    await delay(1000);
    
    // Generate Gamer Tag: Name + # + Random 4 digits
    const randomTag = Math.floor(1000 + Math.random() * 9000);
    const cleanName = name.replace(/\s/g, '');
    const gamerTag = `${cleanName}#${randomTag}`;

    const updatedUser: UserProfile = {
      ...user,
      name,
      age,
      gamerTag,
      isNewUser: false
    };

    // Save to storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  logout: async () => {
    await delay(500);
    localStorage.removeItem(STORAGE_KEY);
  },

  // Social Functions
  addFriend: async (currentUser: UserProfile, friendTag: string): Promise<{ success: boolean; user?: UserProfile; message: string }> => {
    await delay(800);

    if (friendTag === currentUser.gamerTag) {
      return { success: false, message: "You can't add yourself!" };
    }

    const alreadyFriend = currentUser.friends.find(f => f.gamerTag.toLowerCase() === friendTag.toLowerCase());
    if (alreadyFriend) {
      return { success: false, message: "Already in your friends list." };
    }

    // Find in "Mock Database"
    const target = MOCK_DATABASE_USERS.find(u => u.gamerTag.toLowerCase() === friendTag.toLowerCase());

    if (!target) {
      return { success: false, message: "User not found. Try 'Luna#1234'" };
    }

    const updatedUser = {
      ...currentUser,
      friends: [...currentUser.friends, target]
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    return { success: true, user: updatedUser, message: `Added ${target.name}!` };
  },

  removeFriend: async (currentUser: UserProfile, friendId: string): Promise<UserProfile> => {
    const updatedUser = {
      ...currentUser,
      friends: currentUser.friends.filter(f => f.id !== friendId)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }
};
