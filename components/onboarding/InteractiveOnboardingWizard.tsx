"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  UserType,
  ChecklistItem,
  OnboardingProgress,
  CHECKLISTS,
} from "@/types/onboarding";
import {
  getOnboardingProgress,
  saveOnboardingProgress,
  completeOnboardingItem,
} from "@/lib/onboarding-service";

interface InteractiveOnboardingWizardProps {
  userId: string;
  agencyId: string;
  userType: UserType;
}

// Simple toast implementation
const useToast = () => {
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  return { showToast, toastMessage };
};

export default function InteractiveOnboardingWizard({
  userId,
  agencyId,
  userType,
}: InteractiveOnboardingWizardProps) {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const router = useRouter();
  const { showToast, toastMessage } = useToast();

  const checklist = CHECKLISTS[userType];
  const totalSteps = checklist.length;

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, [userId]);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    try {
      const savedProgress = await getOnboardingProgress(userId);
      if (savedProgress) {
        setProgress(savedProgress);
        setActiveStep(savedProgress.currentStep);
      } else {
        // Initialize new progress
        const initialProgress: OnboardingProgress = {
          userId,
          agencyId,
          userType,
          completedItems: [],
          currentStep: 0,
          startedAt: new Date(),
          lastActivityAt: new Date(),
        };
        setProgress(initialProgress);
        setActiveStep(0);
        await saveOnboardingProgress(initialProgress);
      }
    } catch (error) {
      console.error("Failed to load onboarding progress:", error);
      showToast(
        "Não foi possível carregar seu progresso de onboarding.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [userId, agencyId, userType, showToast]);

  const handleItemComplete = useCallback(
    async (itemId: string) => {
      if (!progress) return;

      try {
        const updatedProgress = await completeOnboardingItem(userId, itemId);
        setProgress(updatedProgress);

        showToast("Item concluído!", "success");

        // Auto-advance to next incomplete item
        const nextIncompleteIndex = checklist.findIndex(
          (item, index) =>
            !updatedProgress.completedItems.includes(item.id) &&
            index >= activeStep,
        );

        if (nextIncompleteIndex !== -1) {
          setActiveStep(nextIncompleteIndex);
        }

        // Check if onboarding is complete
        const requiredItemsCompleted = updatedProgress.completedItems.filter(
          (id) => checklist.some((item) => item.id === id && item.required),
        ).length;

        const allRequiredCompleted =
          requiredItemsCompleted >=
          checklist.filter((item) => item.required).length;

        if (allRequiredCompleted && !updatedProgress.completedAt) {
          // Auto-complete if all required items are done
          await saveOnboardingProgress({
            ...updatedProgress,
            completedAt: new Date(),
          });

          showToast(
            "Parabéns! Você completou todo o onboarding necessário!",
            "success",
          );
          // Redirect to dashboard after a brief delay
          setTimeout(() => {
            router.push("/(dashboard)");
          }, 1500);
        }
      } catch (error) {
        console.error("Failed to complete onboarding item:", error);
        showToast("Não foi possível concluir este item.", "error");
      }
    },
    [
      progress,
      checklist,
      activeStep,
      saveOnboardingProgress,
      showToast,
      router,
    ],
  );

  const handleItemSkip = useCallback(
    async (itemId: string) => {
      if (!progress) return;

      const item = checklist.find((i) => i.id === itemId);
      if (item && !item.required) {
        // Only allow skipping non-required items
        try {
          // Create updated progress with the item marked as completed
          const updatedProgress = {
            ...progress,
            completedItems: [...progress.completedItems, itemId],
            lastActivityAt: new Date(),
          };

          // Save the updated progress
          await saveOnboardingProgress(updatedProgress);
          setProgress(updatedProgress);

          showToast("Item marcado como concluído!", "success");

          // Auto-advance to next incomplete item
          const nextIncompleteIndex = checklist.findIndex(
            (item, index) =>
              !updatedProgress.completedItems.includes(item.id) &&
              index >= activeStep,
          );

          if (nextIncompleteIndex !== -1) {
            setActiveStep(nextIncompleteIndex);
          }
        } catch (error) {
          console.error("Failed to skip onboarding item:", error);
          showToast("Não foi possível pular este item.", "error");
        }
      } else {
        showToast(
          "Este item é obrigatório para completar seu onboarding.",
          "error",
        );
      }
    },
    [progress, checklist, activeStep, saveOnboardingProgress, showToast],
  );

  const handleNextStep = useCallback(() => {
    setActiveStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const handlePrevStep = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const isLastStep = activeStep === totalSteps - 1;
  const completionPercentage =
    (progress?.completedItems.filter((id) =>
      checklist.some((item) => item.id === id && item.required),
    ).length || 0) / checklist.filter((item) => item.required).length || 0;

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-center">Carregando seu onboarding...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* Header */}
      <div className="flex h-16 w-full items-center justify-between px-6 bg-card border-b">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Onboarding Personalizado</h1>
          <span className="text-xs text-muted-foreground">{userType}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>{completionPercentage * 100}% completo</span>
          <div className="w-6 h-6 rounded-full border border-muted-foreground">
            <div
              className={`h-full w-full bg-primary transition-all duration-300`}
              style={{ width: `${completionPercentage * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Toast Message */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center p-4 w-64 rounded-lg border 
          ${
            toastMessage.type === "error"
              ? "border-red-500 bg-red-50 text-red-700"
              : "border-primary bg-primary/50 text-primary-foreground"
          }`}
        >
          <div className="flex-shrink-0 flex h-5 w-5 items-center justify-center">
            {toastMessage.type === "error" ? (
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M7 7l10 10"
                />
              </svg>
            ) : (
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 5.04"
                />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h3 className="font-semibold">
              {toastMessage.type === "error" ? "Erro" : "Sucesso"}
            </h3>
            <p className="text-sm">{toastMessage.text}</p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex h-2 w-full bg-muted-foreground/20">
        {checklist.map((item, index) => (
          <div
            key={item.id}
            className={`flex-1 ${
              index < activeStep
                ? "bg-primary"
                : index === activeStep
                  ? "bg-primary/50"
                  : "bg-muted-foreground/10"
            } transition-all duration-300`}
          ></div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Current Step Content */}
        {checklist[activeStep] && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                {activeStep + 1}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {checklist[activeStep].title}
                </h2>
                <p className="text-muted-foreground">
                  {checklist[activeStep].description}
                </p>

                {/* Guide Link or Video */}
                {checklist[activeStep].guideLink ||
                  (checklist[activeStep].videoTutorialId && (
                    <div className="mt-4 space-y-2">
                      {checklist[activeStep].guideLink && (
                        <a
                          href={checklist[activeStep].guideLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                          Ver guia detalhado
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      )}
                      {checklist[activeStep].videoTutorialId && (
                        <button
                          onClick={() => {
                            // Implement video modal opening logic here
                            console.log(
                              `Opening video tutorial: ${checklist[activeStep].videoTutorialId}`,
                            );
                            // In a real implementation, this would open a video player modal
                          }}
                          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                          Assistir tutorial (
                          <span className="font-normal">30-90s</span>)
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 10l6 4-6 4V10zM12 4v12m8-8a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}

                {/* Action Buttons */}
                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => handleItemComplete(checklist[activeStep].id)}
                    disabled={progress.completedItems.includes(
                      checklist[activeStep].id,
                    )}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {progress.completedItems.includes(checklist[activeStep].id)
                      ? "Concluído"
                      : "Marcar como concluído"}
                  </button>

                  {!checklist[activeStep].required && (
                    <button
                      onClick={() => handleItemSkip(checklist[activeStep].id)}
                      className="px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-primary"
                    >
                      Pular este item
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {!checklist[activeStep] &&
          progress &&
          progress.completedItems.filter((id) =>
            checklist.some((item) => item.id === id && item.required),
          ).length >= checklist.filter((item) => item.required).length && (
            <div className="text-center py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 text-primary mb-4">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 5.04M12 20l2.222-4.889M12 20l-4.222-9.333"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold">Onboarding Concluído!</h2>
              <p className="text-muted-foreground mt-2">
                Você completou todas as etapas essenciais para começar a usar
                nossa plataforma com sucesso.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push("/(dashboard)")}
                  className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
                >
                  Ir para o Painel
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Navigation */}
      <div className="flex h-12 w-full items-center justify-between px-6 bg-card border-t">
        <div className="flex items-center gap-2 text-sm">
          <span>
            Passo {activeStep + 1} de {totalSteps}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!isLastStep && (
            <button
              onClick={handlePrevStep}
              disabled={activeStep === 0}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-primary disabled:opacity-50"
            >
              Anterior
            </button>
          )}
          {isLastStep &&
          progress &&
          progress.completedItems.filter((id) =>
            checklist.some((item) => item.id === id && item.required),
          ).length >= checklist.filter((item) => item.required).length ? (
            <button
              onClick={() => router.push("/(dashboard)")}
              className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
            >
              Concluir e ir para o Painel
            </button>
          ) : (
            <button
              onClick={handleNextStep}
              className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
            >
              {isLastStep ? "Concluir onboarding" : "Próximo passo"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
