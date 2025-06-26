'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Target, Bell, LogOut, ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export function ProfileView() {
  const { user, logout, updateProteinGoal, setCurrentView } = useAppStore();
  const [newGoal, setNewGoal] = useState(user?.dailyProteinGoal?.toString() || '120');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  console.log('ProfileView render:', { user, newGoal });

  const handleSaveGoal = () => {
    const goalValue = parseFloat(newGoal);
    if (isNaN(goalValue) || goalValue <= 0 || goalValue > 500) {
      toast.error('Please enter a valid protein goal (1-500g)');
      return;
    }
    
    updateProteinGoal(goalValue);
    toast.success(`Daily protein goal updated to ${goalValue}g!`);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  // Mock notification permission request
  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast.success('Notifications enabled!');
      } else {
        setNotificationsEnabled(false);
        toast.error('Notifications permission denied');
      }
    } else {
      setNotificationsEnabled(enabled);
      toast.success(enabled ? 'Notifications enabled!' : 'Notifications disabled');
    }
  };

  return (
    <div className="container-mobile py-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentView('dashboard')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-health-text">Profile</h1>
      </motion.div>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-health-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-health-text mb-1">
              {user?.name}
            </h2>
            <p className="text-gray-500">{user?.email}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Protein Goal Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-health-primary" />
              Daily Protein Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="protein-goal">Target Protein (grams per day)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="protein-goal"
                  type="number"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="120"
                  min="1"
                  max="500"
                  className="flex-1"
                />
                <Button
                  onClick={handleSaveGoal}
                  className="bg-health-primary hover:bg-health-dark"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>💡 <span className="font-medium">Tip:</span> Most adults need 0.8-1.2g per kg of body weight.</p>
              <p>🏋️ <span className="font-medium">Active adults:</span> 1.2-2.0g per kg for muscle building.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-health-secondary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="meal-reminders" className="text-base font-medium">
                  Meal Reminders
                </Label>
                <p className="text-sm text-gray-500">
                  Get reminded to log your meals throughout the day
                </p>
              </div>
              <Switch
                id="meal-reminders"
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationToggle}
              />
            </div>
            
            <div className="text-sm text-gray-500">
              <p>📱 Notifications help you stay consistent with your protein goals!</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>About DynProtMobile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <p>
              🚀 <span className="font-medium">Version:</span> 1.0.0 (PWA)
            </p>
            <p>
              🤖 <span className="font-medium">AI Features:</span> Smart protein estimation from descriptions and photos
            </p>
            <p>
              📊 <span className="font-medium">Tracking:</span> Daily progress and historical data visualization
            </p>
            <p>
              🎯 <span className="font-medium">Goal:</span> Help you achieve optimal protein intake for your health goals
            </p>
            
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">
                This is a Progressive Web App that works offline and can be installed on your device.
                Future updates will include real AI integration and cloud sync.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </motion.div>
    </div>
  );
}