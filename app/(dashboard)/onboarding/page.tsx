"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InteractiveOnboardingWizard from "@/components/onboarding/InteractiveOnboardingWizard";
import { UserType } from "@/types/onboarding";

// In a real app, you would get this from your auth session (e.g., using next-auth)
// For this example, we'll use placeholder values and simulate fetching user data
export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    agencyId: string;
    userType: UserType;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate fetching user data from auth/session
  useEffect(() => {
    // In a real app, replace this with your auth session fetch
    // Example: const session = await getServerSession(authOptions);
    // Then setUser(session.user);

    // Simulating a logged-in user for demonstration
    const mockUser = {
      id: "user_123",
      agencyId: "agency_456",
      userType: UserType.AUTONOMOUS_AGENT, // This would come from the user's profile
      name: "João Silva",
    };

    setUser(mockUser);
    setLoading(false);
  }, []);

  // If user data is not available, show loading state
  if (loading || !user) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">
            Carregando seu onboarding...
          </h2>
          <p className="text-muted-foreground">
            Estamos preparando sua experiência personalizada.
          </p>
          <div className="mt-6 h-4 w-40 bg-muted-foreground/20 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-primary transition-all duration-2000"></div>
          </div>
        </div>
      </div>
    );
  }

  // Check if onboarding is already completed (in a real app, this would come from an API)
  // For this example, we'll check localStorage as a simple persistence mechanism
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem(
      `onboardingCompleted_${user.id}`,
    );
    if (onboardingCompleted === "true") {
      // Redirect to dashboard if onboarding is already completed
      router.push("/(dashboard)");
    }
  }, [user.id, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex h-16 w-full items-center justify-between px-6 bg-card border-b">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Bem-vindo, {user.name}!</h1>
          <span className="text-xs text-muted-foreground">
            {user.userType === UserType.AUTONOMOUS_AGENT
              ? "Corretor Autônomo"
              : user.userType === UserType.SMALL_AGENCY
                ? "Imobiliária Pequena"
                : "Rede de Franquias"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
              d="M8 7h8m-4 4v8m4-8v8"
            />
          </svg>
          {user.agencyId}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Onboarding Wizard */}
        <InteractiveOnboardingWizard
          userId={user.id}
          agencyId={user.agencyId}
          userType={user.userType}
        />
      </div>
    </div>
  );
}
