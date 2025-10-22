"use client"; 

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { isTokenExpired } from "@/lib/api";

type AuthCtx = {
    token: string | null; 
    login: (jwt: string) => void; 
    logout: () => void;
    isAuthenticated: boolean;
};

const Ctx = createContext<AuthCtx>({ 
    token: null, 
    login: () => {}, 
    logout: () => {},
    isAuthenticated: false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Initialize with null to avoid hydration mismatch
    const [token, setToken] = useState<string | null>(null);
    const [isHydrated, setIsHydrated] = useState(false); 

    useEffect(() => {
        // Mark as hydrated and load token from localStorage
        setIsHydrated(true);
        try {
            const t = localStorage.getItem("token");
            if (t) {
                // Check if token is expired
                const isExpired = isTokenExpired(t);
                
                if (isExpired) {
                    localStorage.removeItem("token");
                    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    setToken(null);
                } else {
                    setToken(t);
                    
                    // Also set the cookie if it's not already set
                    const existingCookie = document.cookie.split(';').find(c => c.trim().startsWith('auth_token='));
                    if (!existingCookie) {
                        document.cookie = `auth_token=${t}; path=/; max-age=604800; SameSite=Lax`;
                    }
                }
            }
        } catch (error) {
            // Silent fail - localStorage access is best effort
        }
        
        // Listen for token cleared events from api.ts
        const handleTokenCleared = () => {
            setToken(null);
        };
        
        window.addEventListener('token-cleared', handleTokenCleared);
        
        return () => {
            window.removeEventListener('token-cleared', handleTokenCleared);
        };
    }, []);

    const login = useCallback((jwt: string) => {
        try {
            localStorage.setItem("token", jwt);
            
            // Also set a cookie for middleware access
            document.cookie = `auth_token=${jwt}; path=/; max-age=604800; SameSite=Lax`;
            
            setToken(jwt);
        } catch (error) {
            // Silent fail - token saving is best effort
        }
    }, []);

    const logout = useCallback(() => {
        try {
            localStorage.removeItem("token");
            // Also clear the cookie
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            setToken(null);
        } catch (error) {
            // Silent fail - token removal is best effort
        }
    }, []);

    const isAuthenticated = isHydrated && !!token;

    return <Ctx.Provider value={{ token, login, logout, isAuthenticated }}>{children}</Ctx.Provider>;
}

export function useAuth() {
    return useContext(Ctx);
}