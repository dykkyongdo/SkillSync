"use client";

import { clearExpiredToken } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function TokenCleanup() {
    const { logout } = useAuth();

    const handleClearToken = () => {
        clearExpiredToken();
        logout();
        // Debug logging removed for production
    };

    return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">Token Cleanup Utility</h3>
            <p className="text-red-700 text-sm mb-3">
                If you&apos;re seeing JWT validation errors, click the button below to clear the expired token.
            </p>
            <button
                onClick={handleClearToken}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
                Clear Expired Token
            </button>
        </div>
    );
}
