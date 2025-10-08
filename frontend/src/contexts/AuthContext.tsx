"use client"; 

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

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
    // Initialize with token from localStorage if available
    const [token, setToken] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            try {
                return localStorage.getItem("token");
            } catch {
                return null;
            }
        }
        return null;
    }); 

    useEffect(() => {
        try {
            console.log("AuthContext: Checking localStorage for token");
            const t = localStorage.getItem("token");
            console.log("AuthContext: Token found in localStorage:", t ? "YES" : "NO");
            if (t) {
                console.log("AuthContext: Setting token from localStorage");
                setToken(t);
                
                // Also set the cookie if it's not already set
                const existingCookie = document.cookie.split(';').find(c => c.trim().startsWith('auth_token='));
                if (!existingCookie) {
                    document.cookie = `auth_token=${t}; path=/; max-age=86400; SameSite=Lax`;
                    console.log("AuthContext: Set cookie from localStorage token");
                }
            }
        } catch (error) {
            console.error("AuthContext: Error reading from localStorage:", error);
        }
    }, []);

    const login = useCallback((jwt: string) => {
        try {
            console.log("AuthContext: login() called with token:", jwt ? (jwt.length > 20 ? jwt.substring(0, 20) + "..." : jwt) : "null");
            console.log("AuthContext: Current token state before update:", token ? (token.length > 20 ? token.substring(0, 20) + "..." : token) : "null");
            
            localStorage.setItem("token", jwt);
            console.log("AuthContext: Token stored in localStorage");
            
            // Also set a cookie for middleware access
            document.cookie = `auth_token=${jwt}; path=/; max-age=86400; SameSite=Lax`;
            console.log("AuthContext: Token stored in cookie");
            
            setToken(jwt);
            console.log("AuthContext: setToken() called");
            
            // Check if the state actually updated
            setTimeout(() => {
                console.log("AuthContext: Token state after setToken:", token ? (token.length > 20 ? token.substring(0, 20) + "..." : token) : "null");
            }, 50);
            
        } catch (error) {
            console.error("Failed to save token:", error);
        }
    }, [token]);

    const logout = useCallback(() => {
        try {
            localStorage.removeItem("token");
            // Also clear the cookie
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            setToken(null);
        } catch (error) {
            console.error("Failed to remove token:", error);
        }
    }, []);

    // Track token state changes
    useEffect(() => {
        console.log("AuthContext: Token state changed to:", token ? (token.length > 20 ? token.substring(0, 20) + "..." : token) : "null");
        console.log("AuthContext: isAuthenticated is now:", !!token);
    }, [token]);

    const isAuthenticated = !!token;

    console.log("AuthContext: Rendering with token:", token ? (token.length > 20 ? token.substring(0, 20) + "..." : token) : "null", "isAuthenticated:", isAuthenticated);

    return <Ctx.Provider value={{ token, login, logout, isAuthenticated }}>{children}</Ctx.Provider>;
}

export function useAuth() {
    return useContext(Ctx);
}