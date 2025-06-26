'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, ArrowLeft, Zap, Camera, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFoodLogging } from '@/hooks/useFoodLogging';
import type { FoodLoggingComponentProps, BarcodeSearchRequest } from '@/types/food-logging';

/**
 * ScanView Component
 * Handles barcode and QR code scanning for food items
 * Mobile-optimized with consistent design patterns
 */
export function ScanView({ onBack, className }: FoodLoggingComponentProps) {
  const { navigateBack } = useFoodLogging();
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  /**
   * Start barcode scanning process
   */
  const handleStartScan = async () => {
    console.log('Starting barcode scan');
    setIsScanning(true);
    setScanError(null);

    try {
      // Simulate barcode scanning (in real app, would use camera API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock barcode detection
      const mockBarcode = '012345678901';
      console.log('Barcode detected:', mockBarcode);
      
      // In real implementation, this would search the food database
      const searchRequest: BarcodeSearchRequest = {
        barcode: mockBarcode,
        source: 'upc'
      };
      
      // Simulate search result
      setScanError('Feature coming soon! Barcode scanning will be available in the next update.');
    } catch (error) {
      console.error('Barcode scan failed:', error);
      setScanError('Failed to scan barcode. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigateBack();
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-20 ${className || ''}`}>
      <div className="relative h-full">
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
          <h1 className="text-lg font-semibold text-gray-900">Scan Food</h1>
          <div className="w-8" />
        </div>

        <div className="p-4 space-y-6">
          {/* Error Alert */}
          {scanError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{scanError}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Scan Interface */}
          <div className="flex flex-col items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mb-8"
            >
              {/* Scan Area */}
              <Card className="relative w-64 h-64 border-2 border-dashed border-purple-300 rounded-2xl flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <motion.div
                  animate={isScanning ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 360]
                  } : {}}
                  transition={isScanning ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  } : {}}
                >
                  <ScanLine className="h-16 w-16 text-purple-500" />
                </motion.div>
                
                {/* Scanning Animation */}
                {isScanning && (
                  <motion.div
                    className="absolute inset-0 border-2 border-purple-500 rounded-2xl"
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Scan Lines */}
                {isScanning && (
                  <motion.div
                    className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                    animate={{
                      y: [-120, 120, -120]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                )}
              </Card>

              {/* Beta Badge */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Beta
              </div>
            </motion.div>

            <div className="text-center space-y-4 max-w-sm">
              <h2 className="text-xl font-semibold text-gray-900">
                {isScanning ? 'Scanning...' : 'Scan Barcode or QR Code'}
              </h2>
              <p className="text-gray-600">
                {isScanning 
                  ? 'Hold your device steady while scanning'
                  : 'Point your camera at a food barcode or QR code to instantly get nutritional information'
                }
              </p>
              
              <div className="space-y-3 pt-4">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  onClick={handleStartScan}
                  disabled={isScanning}
                >
                  <Camera className="h-5 w-5 mr-2" />
                  {isScanning ? 'Scanning...' : 'Start Scanning'}
                </Button>

                <Button 
                  variant="outline"
                  className="w-full border-purple-200 hover:border-purple-400"
                  onClick={() => navigateBack()}
                >
                  Use Camera Instead
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 bg-white/70 backdrop-blur-sm border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-3">Scanning Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  Ensure good lighting for best results
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  Hold your device steady during scanning
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  Position barcode within the scanning area
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  Try AI photo analysis for complex meals
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}