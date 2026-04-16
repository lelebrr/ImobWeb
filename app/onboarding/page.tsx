import { redirect } from "next/navigation";
import { Suspense } from "react";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div>Carregando...</div>}>
          <OnboardingWizard />
        </Suspense>
      </div>
    </main>
  );
}
