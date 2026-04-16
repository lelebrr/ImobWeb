import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Redirect to dashboard page
  redirect("/dashboard/dashboard");
}
