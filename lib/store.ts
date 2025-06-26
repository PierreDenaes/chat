import { create } from 'zustand';

// Types
export interface Meal {
  id: string;
  description: string;
  protein: number;
  photo?: string;
  timestamp: Date;
  estimatedBy: 'manual' | 'ai' | 'database';
  ingredients?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  dailyProteinGoal: number;
  joinDate?: string;
}

export interface DailyData {
  date: string; // YYYY-MM-DD format
  meals: Meal[];
  totalProtein: number;
  goalAchieved: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  age?: number;
  weight?: number;
  height?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  proteinGoal?: number;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: 'health' | 'fitness' | 'productivity' | 'mindfulness' | 'nutrition' | 'custom';
  frequency: 'daily' | 'weekly' | 'weekdays' | 'weekends';
  targetCount: number;
  icon: string;
  color: string;
  createdAt: Date;
  isActive: boolean;
  reminders: {
    enabled: boolean;
    times: string[]; // HH:MM format
  };
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  count: number;
  notes?: string;
  timestamp: Date;
}

export interface HabitStreak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}

export interface HabitStats {
  habitId: string;
  totalCompletions: number;
  completionRate: number; // percentage
  averageWeeklyCompletions: number;
  streak: HabitStreak;
}

// Store interface
interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isSigningUp: boolean;
  signupStep: number;
  signupData: Partial<SignupData>;
  
  // Current day data
  todaysMeals: Meal[];
  dailyProteinGoal: number;
  totalProteinToday: number;
  
  // Historical data
  historicalData: DailyData[];
  
  // Habit tracking
  habits: Habit[];
  habitLogs: HabitLog[];
  habitStats: Record<string, HabitStats>;
  isCreatingHabit: boolean;
  habitCreationStep: number;
  selectedHabit: Habit | null;
  
  // UI state  
  currentView: 'dashboard' | 'add-meal' | 'history' | 'profile' | 'signup' | 'onboarding' | 'habits' | 'habit-creation' | 'habit-onboarding' | 'camera' | 'scan' | 'search' | 'ai' | 'quick-add' | 'library';
  previousView?: string; // Track navigation history for better UX
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  startSignup: () => void;
  updateSignupData: (data: Partial<SignupData>) => void;
  nextSignupStep: () => void;
  prevSignupStep: () => void;
  completeSignup: () => void;
  socialLogin: (provider: 'google' | 'github' | 'linkedin') => void;
  addMeal: (meal: Omit<Meal, 'id' | 'timestamp'>) => void;
  deleteMeal: (mealId: string) => void;
  updateProteinGoal: (newGoal: number) => void;
  setCurrentView: (view: AppState['currentView']) => void;
  loadHistoricalData: () => void;
  
  // Habit actions
  startHabitCreation: () => void;
  createHabit: (habitData: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  deleteHabit: (habitId: string) => void;
  toggleHabitActive: (habitId: string) => void;
  logHabit: (habitId: string, completed: boolean, count?: number, notes?: string) => void;
  updateHabitLog: (logId: string, updates: Partial<HabitLog>) => void;
  calculateHabitStats: (habitId: string) => void;
  getHabitLogsForDate: (date: string) => HabitLog[];
  getHabitStreak: (habitId: string) => HabitStreak;
  shareHabitProgress: (habitId: string, platform: 'twitter' | 'facebook' | 'instagram') => void;
  setSelectedHabit: (habit: Habit | null) => void;
  nextHabitStep: () => void;
  prevHabitStep: () => void;
  
  // Mock AI function for protein estimation
  estimateProteinFromDescription: (description: string) => Promise<number>;
  estimateProteinFromPhoto: (photoData: string) => Promise<number>;
}

// Mock data for demonstration
const mockUsers = [
  { id: '1', email: 'demo@dynprot.com', name: 'Demo User', dailyProteinGoal: 120 },
];

const mockHistoricalData: DailyData[] = [
  {
    date: '2024-06-25',
    meals: [
      { id: '1', description: 'Greek yogurt with berries', protein: 20, timestamp: new Date('2024-06-25T08:00:00'), estimatedBy: 'ai' },
      { id: '2', description: 'Grilled chicken breast', protein: 35, timestamp: new Date('2024-06-25T12:30:00'), estimatedBy: 'ai' },
      { id: '3', description: 'Protein shake', protein: 25, timestamp: new Date('2024-06-25T16:00:00'), estimatedBy: 'manual' },
    ],
    totalProtein: 80,
    goalAchieved: false,
  },
  {
    date: '2024-06-24',
    meals: [
      { id: '4', description: 'Eggs Benedict', protein: 18, timestamp: new Date('2024-06-24T09:00:00'), estimatedBy: 'ai' },
      { id: '5', description: 'Salmon fillet with quinoa', protein: 42, timestamp: new Date('2024-06-24T13:00:00'), estimatedBy: 'ai' },
      { id: '6', description: 'Almonds snack', protein: 8, timestamp: new Date('2024-06-24T15:30:00'), estimatedBy: 'database' },
      { id: '7', description: 'Turkey and avocado wrap', protein: 28, timestamp: new Date('2024-06-24T19:00:00'), estimatedBy: 'ai' },
    ],
    totalProtein: 96,
    goalAchieved: false,
  },
];

// Mock habit data
const mockHabits: Habit[] = [
  {
    id: '1',
    name: 'Morning Workout',
    description: 'Complete a 30-minute morning workout',
    category: 'fitness',
    frequency: 'daily',
    targetCount: 1,
    icon: '💪',
    color: '#EF4444',
    createdAt: new Date('2024-06-20'),
    isActive: true,
    reminders: {
      enabled: true,
      times: ['07:00', '07:30']
    }
  },
  {
    id: '2',
    name: 'Drink Water',
    description: 'Drink 8 glasses of water throughout the day',
    category: 'health',
    frequency: 'daily',
    targetCount: 8,
    icon: '💧',
    color: '#3B82F6',
    createdAt: new Date('2024-06-18'),
    isActive: true,
    reminders: {
      enabled: true,
      times: ['09:00', '12:00', '15:00', '18:00']
    }
  },
  {
    id: '3',
    name: 'Read Books',
    description: 'Read for at least 30 minutes',
    category: 'productivity',
    frequency: 'daily',
    targetCount: 1,
    icon: '📚',
    color: '#8B5CF6',
    createdAt: new Date('2024-06-15'),
    isActive: true,
    reminders: {
      enabled: false,
      times: []
    }
  }
];

const mockHabitLogs: HabitLog[] = [
  {
    id: '1',
    habitId: '1',
    date: '2024-06-26',
    completed: true,
    count: 1,
    notes: 'Great morning workout!',
    timestamp: new Date('2024-06-26T07:30:00')
  },
  {
    id: '2',
    habitId: '2',
    date: '2024-06-26',
    completed: false,
    count: 6,
    notes: 'Need to drink more water',
    timestamp: new Date('2024-06-26T20:00:00')
  },
  {
    id: '3',
    habitId: '1',
    date: '2024-06-25',
    completed: true,
    count: 1,
    timestamp: new Date('2024-06-25T07:15:00')
  },
  {
    id: '4',
    habitId: '2',
    date: '2024-06-25',
    completed: true,
    count: 8,
    timestamp: new Date('2024-06-25T21:00:00')
  },
  {
    id: '5',
    habitId: '3',
    date: '2024-06-25',
    completed: true,
    count: 1,
    notes: 'Read "Atomic Habits" chapter 3',
    timestamp: new Date('2024-06-25T22:00:00')
  }
];

// Mock AI functions
const mockProteinDatabase: Record<string, number> = {
  'chicken breast': 31,
  'greek yogurt': 10,
  'eggs': 12,
  'salmon': 25,
  'protein shake': 25,
  'almonds': 21,
  'turkey': 29,
  'tuna': 30,
  'tofu': 8,
  'quinoa': 4.4,
  'milk': 3.4,
  'cheese': 25,
  'beans': 9,
  'lentils': 9,
  'peanut butter': 25,
};

const estimateProteinFromDescription = async (description: string): Promise<number> => {
  console.log('Estimating protein from description:', description);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple keyword matching (in real app, this would be AI/ML)
  const words = description.toLowerCase().split(' ');
  let estimatedProtein = 0;
  
  for (const word of words) {
    for (const [food, protein] of Object.entries(mockProteinDatabase)) {
      if (word.includes(food.split(' ')[0])) {
        estimatedProtein += protein;
        break;
      }
    }
  }
  
  // Fallback estimation
  if (estimatedProtein === 0) {
    estimatedProtein = Math.floor(Math.random() * 30) + 10; // Random 10-40g
  }
  
  console.log('Estimated protein:', estimatedProtein);
  return estimatedProtein;
};

const estimateProteinFromPhoto = async (photoData: string): Promise<number> => {
  console.log('Estimating protein from photo:', photoData);
  
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock AI estimation (in real app, this would analyze the photo)
  const estimatedProtein = Math.floor(Math.random() * 40) + 15; // Random 15-55g
  
  console.log('Photo estimated protein:', estimatedProtein);
  return estimatedProtein;
};

// Helper functions
const calculateStreak = (habitId: string, logs: HabitLog[]): HabitStreak => {
  const habitLogs = logs
    .filter(log => log.habitId === habitId && log.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (habitLogs.length === 0) {
    return { habitId, currentStreak: 0, longestStreak: 0 };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate = new Date();
  lastDate.setDate(lastDate.getDate() + 1); // Start from tomorrow

  for (const log of habitLogs) {
    const logDate = new Date(log.date);
    const diffDays = Math.floor((lastDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
      if (currentStreak === 0) currentStreak = tempStreak;
    } else if (diffDays > 1) {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
      currentStreak = 0;
    }

    lastDate = logDate;
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return {
    habitId,
    currentStreak,
    longestStreak,
    lastCompletedDate: habitLogs[0]?.date
  };
};

// Create the store
export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isSigningUp: false,
  signupStep: 1,
  signupData: {},
  todaysMeals: [],
  dailyProteinGoal: 120,
  totalProteinToday: 0,
  historicalData: mockHistoricalData,
  currentView: 'dashboard',
  previousView: undefined,
  isLoading: false,

  // Habit state
  habits: mockHabits,
  habitLogs: mockHabitLogs,
  habitStats: {},
  isCreatingHabit: false,
  habitCreationStep: 1,
  selectedHabit: null,
  
  // Actions
  login: async (email: string, password: string) => {
    console.log('Attempting login:', email);
    set({ isLoading: true });
    
    // Mock authentication
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email);
    if (user && password === 'demo123') {
      set({ 
        user, 
        isAuthenticated: true, 
        dailyProteinGoal: user.dailyProteinGoal,
        isLoading: false 
      });
      console.log('Login successful:', user);
      return true;
    }
    
    set({ isLoading: false });
    console.log('Login failed');
    return false;
  },
  
  logout: () => {
    console.log('Logging out');
    set({ 
      user: null, 
      isAuthenticated: false, 
      todaysMeals: [], 
      totalProteinToday: 0,
      currentView: 'dashboard',
      isSigningUp: false,
      signupStep: 1,
      signupData: {},
      habits: [],
      habitLogs: [],
      habitStats: {},
      selectedHabit: null
    });
  },

  startSignup: () => {
    console.log('Starting signup process');
    set({ 
      isSigningUp: true, 
      signupStep: 1, 
      signupData: {},
      currentView: 'signup' 
    });
  },

  updateSignupData: (data: Partial<SignupData>) => {
    console.log('Updating signup data:', data);
    set(state => ({
      signupData: { ...state.signupData, ...data }
    }));
  },

  nextSignupStep: () => {
    const { signupStep } = get();
    console.log('Moving to next signup step:', signupStep + 1);
    set({ signupStep: Math.min(signupStep + 1, 4) });
  },

  prevSignupStep: () => {
    const { signupStep } = get();
    console.log('Moving to previous signup step:', signupStep - 1);
    set({ signupStep: Math.max(signupStep - 1, 1) });
  },

  completeSignup: () => {
    const { signupData } = get();
    console.log('Completing signup:', signupData);
    
    // Mock user creation
    const user: User = {
      id: Date.now().toString(),
      email: signupData.email || '',
      name: signupData.name || '',
      dailyProteinGoal: signupData.proteinGoal || 120,
      joinDate: new Date().toISOString()
    };
    
    set({ 
      isAuthenticated: true, 
      user,
      dailyProteinGoal: user.dailyProteinGoal,
      currentView: 'onboarding',
      isSigningUp: false,
      signupStep: 1,
      signupData: {}
    });
    
    console.log('Signup completed successfully:', user);
  },

  socialLogin: (provider: 'google' | 'github' | 'linkedin') => {
    console.log('Social login attempt:', provider);
    // Mock social authentication
    const user: User = {
      id: Date.now().toString(),
      email: `user@${provider}.com`,
      name: `${provider} User`,
      dailyProteinGoal: 120,
      joinDate: new Date().toISOString()
    };
    
    set({ 
      isAuthenticated: true, 
      user,
      dailyProteinGoal: user.dailyProteinGoal,
      currentView: 'onboarding'
    });
    
    console.log('Social login successful:', user);
  },
  
  addMeal: (mealData) => {
    console.log('Adding meal:', mealData);
    const newMeal: Meal = {
      ...mealData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    const updatedMeals = [...get().todaysMeals, newMeal];
    const totalProtein = updatedMeals.reduce((sum, meal) => sum + meal.protein, 0);
    
    set({ 
      todaysMeals: updatedMeals, 
      totalProteinToday: totalProtein 
    });
    
    console.log('Meal added. Total protein today:', totalProtein);
  },
  
  deleteMeal: (mealId) => {
    console.log('Deleting meal:', mealId);
    const updatedMeals = get().todaysMeals.filter(meal => meal.id !== mealId);
    const totalProtein = updatedMeals.reduce((sum, meal) => sum + meal.protein, 0);
    
    set({ 
      todaysMeals: updatedMeals, 
      totalProteinToday: totalProtein 
    });
  },
  
  updateProteinGoal: (newGoal) => {
    console.log('Updating protein goal:', newGoal);
    set({ dailyProteinGoal: newGoal });
    
    // Update user data
    const user = get().user;
    if (user) {
      set({ user: { ...user, dailyProteinGoal: newGoal } });
    }
  },
  
  setCurrentView: (view) => {
    console.log('Setting current view:', view);
    const currentView = get().currentView;
    set({ 
      currentView: view,
      previousView: currentView 
    });
  },
  
  loadHistoricalData: () => {
    console.log('Loading historical data');
    // In a real app, this would fetch from an API
    set({ historicalData: mockHistoricalData });
  },

  // Habit actions
  startHabitCreation: () => {
    console.log('Starting habit creation');
    set({ 
      isCreatingHabit: true,
      habitCreationStep: 1,
      currentView: 'habit-creation'
    });
  },

  createHabit: (habitData) => {
    console.log('Creating habit:', habitData);
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    const updatedHabits = [...get().habits, newHabit];
    set({ 
      habits: updatedHabits,
      isCreatingHabit: false,
      habitCreationStep: 1,
      currentView: 'habits'
    });
    
    console.log('Habit created successfully:', newHabit);
  },

  updateHabit: (habitId, updates) => {
    console.log('Updating habit:', habitId, updates);
    const updatedHabits = get().habits.map(habit =>
      habit.id === habitId ? { ...habit, ...updates } : habit
    );
    set({ habits: updatedHabits });
  },

  deleteHabit: (habitId) => {
    console.log('Deleting habit:', habitId);
    const updatedHabits = get().habits.filter(habit => habit.id !== habitId);
    const updatedLogs = get().habitLogs.filter(log => log.habitId !== habitId);
    const updatedStats = { ...get().habitStats };
    delete updatedStats[habitId];
    
    set({ 
      habits: updatedHabits,
      habitLogs: updatedLogs,
      habitStats: updatedStats
    });
  },

  toggleHabitActive: (habitId) => {
    console.log('Toggling habit active status:', habitId);
    const updatedHabits = get().habits.map(habit =>
      habit.id === habitId ? { ...habit, isActive: !habit.isActive } : habit
    );
    set({ habits: updatedHabits });
  },

  logHabit: (habitId, completed, count = 1, notes) => {
    console.log('Logging habit:', { habitId, completed, count, notes });
    const today = new Date().toISOString().split('T')[0];
    
    // Check if there's already a log for today
    const existingLogIndex = get().habitLogs.findIndex(
      log => log.habitId === habitId && log.date === today
    );
    
    if (existingLogIndex >= 0) {
      // Update existing log
      const updatedLogs = [...get().habitLogs];
      updatedLogs[existingLogIndex] = {
        ...updatedLogs[existingLogIndex],
        completed,
        count: count || updatedLogs[existingLogIndex].count,
        notes: notes || updatedLogs[existingLogIndex].notes,
        timestamp: new Date()
      };
      set({ habitLogs: updatedLogs });
    } else {
      // Create new log
      const newLog: HabitLog = {
        id: Date.now().toString(),
        habitId,
        date: today,
        completed,
        count,
        notes,
        timestamp: new Date()
      };
      
      const updatedLogs = [...get().habitLogs, newLog];
      set({ habitLogs: updatedLogs });
    }
    
    // Recalculate stats
    get().calculateHabitStats(habitId);
  },

  updateHabitLog: (logId, updates) => {
    console.log('Updating habit log:', logId, updates);
    const updatedLogs = get().habitLogs.map(log =>
      log.id === logId ? { ...log, ...updates } : log
    );
    set({ habitLogs: updatedLogs });
  },

  calculateHabitStats: (habitId) => {
    console.log('Calculating habit stats for:', habitId);
    const { habitLogs } = get();
    const habit = get().habits.find(h => h.id === habitId);
    
    if (!habit) return;
    
    const logs = habitLogs.filter(log => log.habitId === habitId);
    const completedLogs = logs.filter(log => log.completed);
    
    const totalCompletions = completedLogs.reduce((sum, log) => sum + log.count, 0);
    const completionRate = logs.length > 0 ? (completedLogs.length / logs.length) * 100 : 0;
    
    // Calculate weekly average
    const weeklyLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    });
    const weeklyCompletions = weeklyLogs.filter(log => log.completed).length;
    
    const streak = calculateStreak(habitId, habitLogs);
    
    const stats: HabitStats = {
      habitId,
      totalCompletions,
      completionRate,
      averageWeeklyCompletions: weeklyCompletions,
      streak
    };
    
    const updatedStats = { ...get().habitStats, [habitId]: stats };
    set({ habitStats: updatedStats });
    
    console.log('Habit stats calculated:', stats);
  },

  getHabitLogsForDate: (date) => {
    return get().habitLogs.filter(log => log.date === date);
  },

  getHabitStreak: (habitId) => {
    return calculateStreak(habitId, get().habitLogs);
  },

  shareHabitProgress: (habitId, platform) => {
    console.log('Sharing habit progress:', { habitId, platform });
    const habit = get().habits.find(h => h.id === habitId);
    const stats = get().habitStats[habitId];
    
    if (!habit || !stats) return;
    
    const message = `🎯 Just completed my "${habit.name}" habit! Current streak: ${stats.streak.currentStreak} days 🔥 #HabitTracker #DynProt`;
    
    // Mock sharing functionality
    if (platform === 'twitter') {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else if (platform === 'facebook') {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
    
    console.log('Shared habit progress:', message);
  },

  setSelectedHabit: (habit) => {
    console.log('Setting selected habit:', habit);
    set({ selectedHabit: habit });
  },

  nextHabitStep: () => {
    const { habitCreationStep } = get();
    console.log('Moving to next habit creation step:', habitCreationStep + 1);
    set({ habitCreationStep: Math.min(habitCreationStep + 1, 3) });
  },

  prevHabitStep: () => {
    const { habitCreationStep } = get();
    console.log('Moving to previous habit creation step:', habitCreationStep - 1);
    set({ habitCreationStep: Math.max(habitCreationStep - 1, 1) });
  },
  
  estimateProteinFromDescription,
  estimateProteinFromPhoto,
}));