'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Type, Loader2, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import Webcam from 'react-webcam';

export function AddMealForm() {
  const { addMeal, setCurrentView, estimateProteinFromDescription, estimateProteinFromPhoto } = useAppStore();
  
  const [description, setDescription] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimatedProtein, setEstimatedProtein] = useState<number | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [inputMethod, setInputMethod] = useState<'text' | 'photo' | 'manual'>('text');
  
  const webcamRef = useRef<Webcam>(null);

  console.log('AddMealForm render:', { 
    description, 
    manualProtein, 
    estimatedProtein, 
    inputMethod 
  });

  const handleEstimateFromText = async () => {
    if (!description.trim()) {
      toast.error('Please enter a meal description first');
      return;
    }

    setIsEstimating(true);
    try {
      const protein = await estimateProteinFromDescription(description);
      setEstimatedProtein(protein);
      toast.success(`Estimated ${protein}g of protein!`);
    } catch (error) {
      console.error('Error estimating protein:', error);
      toast.error('Failed to estimate protein. Please try again.');
    }
    setIsEstimating(false);
  };

  const handleCapturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedPhoto(imageSrc);
      setShowCamera(false);
      console.log('Photo captured');
      
      // Auto-estimate protein from photo
      handleEstimateFromPhoto(imageSrc);
    }
  };

  const handleEstimateFromPhoto = async (photoData: string) => {
    setIsEstimating(true);
    try {
      const protein = await estimateProteinFromPhoto(photoData);
      setEstimatedProtein(protein);
      toast.success(`Estimated ${protein}g of protein from photo!`);
    } catch (error) {
      console.error('Error estimating protein from photo:', error);
      toast.error('Failed to estimate protein from photo. Please try again.');
    }
    setIsEstimating(false);
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error('Please enter a meal description');
      return;
    }

    let proteinAmount: number;
    let estimationType: 'manual' | 'ai' | 'database';

    if (inputMethod === 'manual' && manualProtein) {
      proteinAmount = parseFloat(manualProtein);
      estimationType = 'manual';
    } else if (estimatedProtein !== null) {
      proteinAmount = estimatedProtein;
      estimationType = inputMethod === 'photo' ? 'ai' : 'ai';
    } else {
      toast.error('Please estimate protein content or enter manually');
      return;
    }

    if (isNaN(proteinAmount) || proteinAmount <= 0) {
      toast.error('Please enter a valid protein amount');
      return;
    }

    const meal = {
      description: description.trim(),
      protein: proteinAmount,
      photo: capturedPhoto || undefined,
      estimatedBy: estimationType,
    };

    console.log('Submitting meal:', meal);
    addMeal(meal);
    
    toast.success('Meal added successfully!');
    setCurrentView('dashboard');
  };

  const resetForm = () => {
    setDescription('');
    setManualProtein('');
    setEstimatedProtein(null);
    setCapturedPhoto(null);
    setShowCamera(false);
    setInputMethod('text');
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
        <h1 className="text-2xl font-bold text-health-text">Add Meal</h1>
      </motion.div>

      {/* Input Method Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How would you like to log this meal?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={inputMethod === 'text' ? 'default' : 'outline'}
                onClick={() => setInputMethod('text')}
                className="flex flex-col gap-2 h-auto py-4"
              >
                <Type className="w-5 h-5" />
                <span className="text-xs">Description</span>
              </Button>
              <Button
                variant={inputMethod === 'photo' ? 'default' : 'outline'}
                onClick={() => setInputMethod('photo')}
                className="flex flex-col gap-2 h-auto py-4"
              >
                <Camera className="w-5 h-5" />
                <span className="text-xs">Photo</span>
              </Button>
              <Button
                variant={inputMethod === 'manual' ? 'default' : 'outline'}
                onClick={() => setInputMethod('manual')}
                className="flex flex-col gap-2 h-auto py-4"
              >
                <span className="text-lg font-bold">g</span>
                <span className="text-xs">Manual</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Camera Interface */}
      {inputMethod === 'photo' && showCamera && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full rounded-lg"
                />
                <div className="flex justify-center gap-4 mt-4">
                  <Button onClick={handleCapturePhoto} className="bg-health-primary">
                    <Camera className="w-4 h-4 mr-2" />
                    Capture
                  </Button>
                  <Button variant="outline" onClick={() => setShowCamera(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Captured Photo */}
      {capturedPhoto && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-4">
              <img 
                src={capturedPhoto} 
                alt="Captured meal" 
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCapturedPhoto(null);
                    setShowCamera(true);
                  }}
                >
                  Retake Photo
                </Button>
                <Button
                  onClick={() => setCapturedPhoto(null)}
                  variant="destructive"
                  size="sm"
                >
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Meal Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Meal Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">What did you eat?</Label>
              <Textarea
                id="description"
                placeholder="e.g., Grilled chicken breast with quinoa and vegetables"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Photo Capture Button */}
            {inputMethod === 'photo' && !capturedPhoto && (
              <Button
                onClick={() => setShowCamera(true)}
                variant="outline"
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            )}

            {/* Text-based Estimation */}
            {inputMethod === 'text' && (
              <Button
                onClick={handleEstimateFromText}
                disabled={!description.trim() || isEstimating}
                className="w-full bg-health-secondary hover:bg-blue-600"
              >
                {isEstimating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Estimating Protein...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Estimate Protein with AI
                  </>
                )}
              </Button>
            )}

            {/* Manual Protein Input */}
            {inputMethod === 'manual' && (
              <div>
                <Label htmlFor="manual-protein">Protein Amount (grams)</Label>
                <Input
                  id="manual-protein"
                  type="number"
                  placeholder="e.g., 25"
                  value={manualProtein}
                  onChange={(e) => setManualProtein(e.target.value)}
                  className="mt-2"
                  min="0"
                  max="200"
                  step="0.1"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Estimated Protein Display */}
      {estimatedProtein !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card className="border-health-primary">
            <CardContent className="p-4 text-center">
              <div className="mb-2">
                <Badge className="bg-health-light text-health-dark">
                  AI Estimated
                </Badge>
              </div>
              <div className="text-3xl font-bold text-health-primary mb-1">
                {estimatedProtein}g
              </div>
              <div className="text-sm text-gray-500">protein content</div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4"
      >
        <Button
          variant="outline"
          onClick={resetForm}
          className="flex-1"
        >
          Clear Form
        </Button>
        
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-health-primary hover:bg-health-dark"
          disabled={!description.trim() || (inputMethod === 'manual' ? !manualProtein : estimatedProtein === null)}
        >
          Add Meal
        </Button>
      </motion.div>
    </div>
  );
}