"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Tooltip from "@radix-ui/react-tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
        new QueryClient({
            defaultOptions: {
            queries: {
                retry: 1,
                refetchOnWindowFocus: false,
                staleTime: 60_000,
            },
            },
        })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <Tooltip.Provider>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </Tooltip.Provider>
        </QueryClientProvider>
    );
}
