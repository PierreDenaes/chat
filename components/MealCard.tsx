'use client';

import { motion } from 'framer-motion';
import { Trash2, Camera, Type, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Meal } from '@/lib/store';

interface MealCardProps {
  meal: Meal;
  onDelete?: (mealId: string) => void;
}

export function MealCard({ meal, onDelete }: MealCardProps) {
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getEstimationIcon = (type: Meal['estimatedBy']) => {
    switch (type) {
      case 'ai':
        return <Camera className="w-3 h-3" />;
      case 'manual':
        return <Type className="w-3 h-3" />;
      case 'database':
        return <Database className="w-3 h-3" />;
    }
  };

  const getEstimationLabel = (type: Meal['estimatedBy']) => {
    switch (type) {
      case 'ai':
        return 'AI Estimated';
      case 'manual':
        return 'Manual Entry';
      case 'database':
        return 'Database';
    }
  };

  console.log('MealCard render:', meal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="meal-card"
    >
      <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Meal photo if available */}
              {meal.photo && (
                <div className="mb-3">
                  <img 
                    src={meal.photo} 
                    alt={meal.description}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              
              {/* Meal description */}
              <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                {meal.description}
              </h3>

              {/* AI-detected ingredients */}
              {meal.ingredients && meal.ingredients.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">AI detected ingredients:</p>
                  <div className="flex flex-wrap gap-1">
                    {meal.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="inline-block bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded-md border border-purple-100"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Protein amount */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-purple-600">
                  {meal.protein}g
                </span>
                <span className="text-sm text-gray-500">protein</span>
              </div>
              
              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{formatTime(meal.timestamp)}</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  {getEstimationIcon(meal.estimatedBy)}
                  {getEstimationLabel(meal.estimatedBy)}
                </Badge>
              </div>
            </div>
            
            {/* Delete button */}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(meal.id)}
                className="text-gray-400 hover:text-red-500 ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}