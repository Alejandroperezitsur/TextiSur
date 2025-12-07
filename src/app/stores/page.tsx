
import { Suspense } from "react";
import { StoresClient } from "@/components/stores/StoresClient";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function StoresPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>}>
      <StoresClient />
    </Suspense>
  );
}