'use client';

import { motion } from 'framer-motion';
import { Brain, ArrowLeft, Sparkles, Zap, Target, TrendingUp, Camera, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFoodLogging } from '@/hooks/useFoodLogging';
import type { FoodLoggingComponentProps } from '@/types/food-logging';

/**
 * AIView Component
 * Hub for AI-powered nutrition features and capabilities
 * Showcases available and upcoming AI features
 */
interface AIFeature {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  status: 'available' | 'coming-soon' | 'beta';
  action?: () => void;
  estimatedRelease?: string;
}

export function AIView({ onBack, className }: FoodLoggingComponentProps) {
  const { navigateBack } = useFoodLogging();

  const aiFeatures: AIFeature[] = [
    {
      id: 'meal-analysis',
      icon: Brain,
      title: 'Smart Meal Analysis',
      description: 'AI-powered photo recognition for instant nutritional breakdown',
      status: 'available',
      action: () => navigateBack()
    },
    {
      id: 'goal-optimization',
      icon: Target,
      title: 'Goal Optimization',
      description: 'Personalized recommendations based on your protein targets',
      status: 'coming-soon',
      estimatedRelease: 'Q3 2025'
    },
    {
      id: 'progress-insights',
      icon: TrendingUp,
      title: 'Progress Insights',
      description: 'Advanced analytics and trends powered by machine learning',
      status: 'coming-soon',
      estimatedRelease: 'Q4 2025'
    },
    {
      id: 'macro-prediction',
      icon: BarChart,
      title: 'Macro Prediction',
      description: 'Predict optimal meal timing and composition for your goals',
      status: 'beta',
      estimatedRelease: 'Limited Beta'
    }
  ];

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigateBack();
    }
  };

  const getStatusBadge = (status: AIFeature['status']) => {
    switch (status) {
      case 'available':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <Sparkles className="h-3 w-3 mr-1" />
            Live
          </Badge>
        );
      case 'beta':
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <Zap className="h-3 w-3 mr-1" />
            Beta
          </Badge>
        );
      case 'coming-soon':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <Zap className="h-3 w-3 mr-1" />
            Soon
          </Badge>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-20 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">AI Assistant</h1>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <motion.div
              className="absolute inset-0 w-20 h-20 border-2 border-purple-300 rounded-full mx-auto"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI-Powered Nutrition
          </h2>
          <p className="text-gray-600 max-w-sm mx-auto">
            Let artificial intelligence help you achieve your health goals with smart insights and recommendations
          </p>
        </motion.div>

        {/* AI Features */}
        <div className="space-y-4">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`p-4 bg-white/70 backdrop-blur-sm border-purple-200 transition-all ${
                  feature.action ? 'hover:border-purple-400 cursor-pointer' : ''
                }`}
                onClick={feature.action}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      {getStatusBadge(feature.status)}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{feature.description}</p>
                    
                    {feature.estimatedRelease && (
                      <p className="text-xs text-gray-500">
                        {feature.status === 'beta' ? 'Access: ' : 'Expected: '}{feature.estimatedRelease}
                      </p>
                    )}
                    
                    {feature.action && feature.status === 'available' && (
                      <div className="mt-3">
                        <Button size="sm" variant="outline" className="text-purple-600 border-purple-200 hover:border-purple-400">
                          Try Now
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3"
        >
          <Button 
            className="h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            onClick={() => navigateBack()}
          >
            <Camera className="h-5 w-5 mr-2" />
            Photo Analysis
          </Button>
          
          <Button 
            variant="outline"
            className="h-12 border-purple-200 hover:border-purple-400"
            onClick={() => navigateBack()}
          >
            <Brain className="h-5 w-5 mr-2" />
            Start Session
          </Button>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Privacy First</h4>
                <p className="text-sm text-gray-600">
                  All AI processing happens securely. Your photos are analyzed locally when possible and never stored without your consent.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}