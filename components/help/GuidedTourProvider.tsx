"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// Simplified tour context for demonstration
// In a real app, you would use react-joyride or similar library

interface TourStep {
  target: string; // CSS selector or ref
  title: string;
  description: string;
  placement?: "top" | "right" | "bottom" | "left";
}

interface TourContextType {
  currentStep: number;
  isTourActive: boolean;
  startTour: (steps: TourStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
}

const TourContext = createContext<TourContextType | null>(null);

interface GuidedTourProviderProps {
  children: ReactNode;
}

export const GuidedTourProvider = ({ children }: GuidedTourProviderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourSteps, setTourSteps] = useState<TourStep[]>([]);

  const startTour = useCallback((steps: TourStep[]) => {
    setTourSteps(steps);
    setCurrentStep(0);
    setIsTourActive(true);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, tourSteps.length - 1));
  }, [tourSteps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const endTour = useCallback(() => {
    setIsTourActive(false);
    setCurrentStep(0);
    setTourSteps([]);
  }, []);

  // In a real implementation with react-joyride, we would initialize the tour here
  // For this example, we'll just log the current step
  useEffect(() => {
    if (isTourActive && tourSteps[currentStep]) {
      console.log(
        `Tour step ${currentStep + 1}/${tourSteps.length}:`,
        tourSteps[currentStep],
      );
      // In a real implementation, this would show the tooltip/highlight
    }
  }, [currentStep, isTourActive, tourSteps]);

  const contextValue = {
    currentStep,
    isTourActive,
    startTour,
    nextStep,
    prevStep,
    endTour,
  };

  return (
    <TourContext.Provider value={contextValue}>{children}</TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a GuidedTourProvider");
  }
  return context;
};
