import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div
      className="min-h-[50vh] flex items-center justify-center bg-white"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 text-forest font-semibold">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        <span>Loading page...</span>
      </div>
    </div>
  );
}
