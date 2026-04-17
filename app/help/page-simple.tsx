"use client";

import HelpCenter from "@/components/help/HelpCenter";
import { GuidedTourProvider } from "@/components/help/GuidedTourProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HelpPage() {
  const router = useRouter();

  // Check if this is the user's first visit to show guided tour
  useEffect(() => {
    const hasSeenHelpTour = localStorage.getItem("hasSeenHelpTour");
    if (!hasSeenHelpTour) {
      // In a real implementation, we would start a guided tour of the help center
      // For now, we'll just mark it as seen
      localStorage.setItem("hasSeenHelpTour", "true");
      console.log(
        "Would start guided tour of help center for first-time users",
      );
    }
  }, []);

  return (
    <GuidedTourProvider>
      <div className="min-h-screen">
        <HelpCenter />
      </div>
    </GuidedTourProvider>
  );
}
