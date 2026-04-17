import { prisma } from "@/lib/prisma";
import { OnboardingProgress, UserType } from "@/types/onboarding";

/**
 * Service to manage user onboarding progress
 */
export const getOnboardingProgress = async (
  userId: string,
): Promise<OnboardingProgress | null> => {
  try {
    // Use any access in case the model name differs after Prisma generation
    const progress = await (prisma as any).onboardingProgress.findUnique({
      where: { userId },
    });

    if (!progress) return null;

    return {
      userId: progress.userId,
      agencyId: progress.agencyId,
      userType: progress.userType as UserType,
      completedItems: progress.completedItems as string[],
      currentStep: progress.currentStep,
      startedAt: progress.startedAt,
      completedAt: progress.completedAt,
      lastActivityAt: progress.lastActivityAt,
    };
  } catch (error: any) {
    // If the table doesn't exist yet, return null (will be created on first save)
    if (error.code === "P2025" || error.message?.includes("Failed to parse")) {
      return null;
    }
    console.error("Error fetching onboarding progress:", error);
    return null;
  }
};

export const saveOnboardingProgress = async (
  progress: OnboardingProgress,
): Promise<void> => {
  try {
    await (prisma as any).onboardingProgress.upsert({
      where: { userId: progress.userId },
      update: {
        agencyId: progress.agencyId,
        userType: progress.userType,
        completedItems: progress.completedItems,
        currentStep: progress.currentStep,
        completedAt: progress.completedAt,
        lastActivityAt: progress.lastActivityAt,
      },
      create: {
        userId: progress.userId,
        agencyId: progress.agencyId,
        userType: progress.userType,
        completedItems: progress.completedItems,
        currentStep: progress.currentStep,
        startedAt: progress.startedAt,
        completedAt: progress.completedAt,
        lastActivityAt: progress.lastActivityAt,
      },
    });
  } catch (error: any) {
    // Handle case where table might not exist yet
    if (error.code === "P2025" || error.message?.includes("Failed to parse")) {
      console.warn("OnboardingProgress table not yet created in database");
      // In a real app, we might trigger a migration or show a user-friendly message
      throw new Error("Database not ready for onboarding progress tracking");
    }
    console.error("Error saving onboarding progress:", error);
    throw error;
  }
};

export const completeOnboardingItem = async (
  userId: string,
  itemId: string,
): Promise<OnboardingProgress> => {
  try {
    const progress = await getOnboardingProgress(userId);

    if (!progress) {
      throw new Error("Onboarding progress not found");
    }

    // Avoid duplicate entries
    const completedItems = progress.completedItems.includes(itemId)
      ? progress.completedItems
      : [...progress.completedItems, itemId];

    const updatedProgress = {
      ...progress,
      completedItems,
      lastActivityAt: new Date(),
    };

    await saveOnboardingProgress(updatedProgress);
    return updatedProgress;
  } catch (error) {
    console.error("Error completing onboarding item:", error);
    throw error;
  }
};

export const resetOnboardingProgress = async (
  userId: string,
): Promise<void> => {
  try {
    await (prisma as any).onboardingProgress.delete({
      where: { userId },
    });
  } catch (error: any) {
    // Ignore if record doesn't exist
    if (error.code !== "P2025") {
      console.error("Error resetting onboarding progress:", error);
      throw error;
    }
  }
};

export default {
  getOnboardingProgress,
  saveOnboardingProgress,
  completeOnboardingItem,
  resetOnboardingProgress,
};
