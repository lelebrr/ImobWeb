/**
 * Skeleton Loader for the Language Switcher.
 * Matches the premium look of the button to prevent layout shift.
 */
export function LanguageSwitcherSkeleton() {
  return (
    <div className="flex items-center gap-2 px-3 h-9 w-[100px] rounded-md bg-white/5 animate-pulse border border-white/10">
      <div className="h-4 w-4 rounded-full bg-white/10" />
      <div className="h-3 w-8 rounded bg-white/10" />
      <div className="h-3 w-4 rounded bg-white/10 ml-auto" />
    </div>
  );
}
