
import { Suspense } from "react";
import { MessagesClient } from "@/components/messages/MessagesClient";
import { Loader2 } from "lucide-react";

// export const dynamic = "force-dynamic"; // Message Page might be dynamic by nature if using searchParams in server, but here client handles it.

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <MessagesClient />
        </Suspense>
    );
}
