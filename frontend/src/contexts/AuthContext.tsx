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
    const [token, setToken] = useState<string | null>(null); 

    useEffect(() => {
        try {
            const t = localStorage.getItem("token");
            if (t) setToken(t);
        } catch {}
    }, []);

    const login = useCallback((jwt: string) => {
        try {
            localStorage.setItem("token", jwt);
            setToken(jwt);
        } catch (error) {
            console.error("Failed to save token:", error);
        }
    }, []);

    const logout = useCallback(() => {
        try {
            localStorage.removeItem("token");
            setToken(null);
        } catch (error) {
            console.error("Failed to remove token:", error);
        }
    }, []);

    const isAuthenticated = !!token;

    return <Ctx.Provider value={{ token, login, logout, isAuthenticated }}>{children}</Ctx.Provider>;
}

export function useAuth() {
    return useContext(Ctx);
}