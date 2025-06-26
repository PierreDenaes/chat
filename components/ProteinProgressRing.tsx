'use client';

import { motion } from 'framer-motion';

interface ProteinProgressRingProps {
  current: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

export function ProteinProgressRing({ 
  current, 
  goal, 
  size = 160, 
  strokeWidth = 12 
}: ProteinProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(current / goal, 1);
  const strokeDashoffset = circumference - (progress * circumference);
  
  const percentage = Math.round((current / goal) * 100);
  
  console.log('ProteinProgressRing render:', { current, goal, progress, percentage });

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg
        className="progress-ring"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#10B981"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ 
            duration: 1, 
            ease: "easeOut",
            delay: 0.2 
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="text-center"
        >
          <div className="text-2xl font-bold text-health-primary">
            {current}g
          </div>
          <div className="text-sm text-gray-500">
            of {goal}g
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {percentage}%
          </div>
        </motion.div>
      </div>
      
      {/* Goal achievement indicator */}
      {current >= goal && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.3 }}
          className="absolute -top-2 -right-2 w-8 h-8 bg-health-accent rounded-full flex items-center justify-center"
        >
          <span className="text-white text-sm">🎯</span>
        </motion.div>
      )}
    </div>
  );
}