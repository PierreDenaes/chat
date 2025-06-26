'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/store';
import { ProteinProgressRing } from './ProteinProgressRing';

interface GoalProgressCardProps {
  totalProteinToday: number;
  dailyProteinGoal: number;
}

export function GoalProgressCard({ totalProteinToday, dailyProteinGoal }: GoalProgressCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(dailyProteinGoal.toString());
  const [isValidating, setIsValidating] = useState(false);
  
  const { updateProteinGoal } = useAppStore();
  const { toast } = useToast();

  const progressPercentage = Math.round((totalProteinToday / dailyProteinGoal) * 100);
  const remainingProtein = Math.max(0, dailyProteinGoal - totalProteinToday);

  console.log('GoalProgressCard render:', { 
    totalProteinToday, 
    dailyProteinGoal, 
    progressPercentage,
    isEditing 
  });

  const handleEditStart = () => {
    console.log('Starting goal edit');
    setEditValue(dailyProteinGoal.toString());
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    console.log('Canceling goal edit');
    setEditValue(dailyProteinGoal.toString());
    setIsEditing(false);
  };

  const validateAndSave = async () => {
    console.log('Validating and saving goal:', editValue);
    setIsValidating(true);

    // Real-time validation
    const numValue = parseInt(editValue);
    
    if (isNaN(numValue) || numValue <= 0) {
      toast({
        title: "Invalid Goal",
        description: "Please enter a positive number for your protein goal.",
        variant: "destructive",
      });
      setIsValidating(false);
      return;
    }

    if (numValue > 500) {
      toast({
        title: "Goal Too High",
        description: "Daily protein goal should be realistic (max 500g).",
        variant: "destructive",
      });
      setIsValidating(false);
      return;
    }

    // Simulate processing delay for smooth UX
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      updateProteinGoal(numValue);
      setIsEditing(false);
      
      toast({
        title: "Goal Updated!",
        description: `Your daily protein goal is now ${numValue}g.`,
        variant: "default",
      });
      
      console.log('Goal updated successfully:', numValue);
    } catch (error) {
      console.error('Failed to update goal:', error);
      toast({
        title: "Update Failed",
        description: "Could not update your protein goal. Please try again.",
        variant: "destructive",
      });
    }

    setIsValidating(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateAndSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-pink-50/50 pointer-events-none" />
      
      <CardContent className="relative p-8">
        {/* Edit Goal Button */}
        <div className="absolute top-4 right-4">
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div
                key="edit-button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onClick={handleEditStart}
                  size="sm"
                  variant="ghost"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-full w-8 h-8 p-0"
                  aria-label="Edit goal"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="edit-controls"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <Button
                  onClick={validateAndSave}
                  disabled={isValidating}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 p-0"
                  aria-label="Save goal"
                >
                  {isValidating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={handleEditCancel}
                  disabled={isValidating}
                  size="sm"
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 p-0"
                  aria-label="Cancel edit"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Content Container - Perfect Centering */}
        <div className="flex flex-col items-center justify-center min-h-[280px]">
          
          {/* Progress Ring - Perfectly Centered */}
          <div className="flex items-center justify-center mb-6">
            <ProteinProgressRing 
              current={totalProteinToday} 
              goal={dailyProteinGoal} 
              size={180}
              strokeWidth={14}
            />
          </div>

          {/* Goal Edit Section */}
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-3"
              >
                <p className="text-sm text-gray-600 font-medium">Edit Daily Goal</p>
                <div className="flex items-center justify-center gap-2">
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-20 text-center text-lg font-bold border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                    min="1"
                    max="500"
                    autoFocus
                    disabled={isValidating}
                  />
                  <span className="text-lg font-bold text-gray-700">g</span>
                </div>
                <p className="text-xs text-gray-500">Press Enter to save, Esc to cancel</p>
              </motion.div>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="text-sm text-gray-600 mb-2">Daily Protein Goal</div>
                <motion.div 
                  className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                  onClick={handleEditStart}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {dailyProteinGoal}g
                </motion.div>
                <p className="text-xs text-gray-400 mt-1">Click to edit</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Stats - Symmetrically Arranged */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-8 mt-6 w-full max-w-sm"
          >
            <div className="text-center">
              <div className="text-purple-600 font-bold text-xl">
                {progressPercentage}%
              </div>
              <div className="text-gray-500 text-sm">Progress</div>
            </div>
            <div className="text-center">
              <div className="text-pink-600 font-bold text-xl">
                {remainingProtein}g
              </div>
              <div className="text-gray-500 text-sm">Remaining</div>
            </div>
          </motion.div>

          {/* Achievement Badge */}
          {totalProteinToday >= dailyProteinGoal && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring", bounce: 0.5 }}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-full flex items-center gap-2"
            >
              🎯 Goal Achieved!
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}