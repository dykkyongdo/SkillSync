"use client"; 

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type AuthState = {
    token: string | null; 
    email: string | null; 
    login: (token: string) => void; 
    logout: () => void;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [email, setEmail] = useState<string |null>(null);

    useEffect(() => {
        const t = localStorage.getItem("token");
        const e = localStorage.getItem("email");
        if (t) setToken(t);
        if (e) setEmail(e);
    }, []);

    const login = (t: string) => {
        setToken(t);
        localStorage.setItem("token", t);
        try {
            const payload = JSON.parse(atob(t.split(".")[1]));
            setEmail(payload.sub ?? null);
        } catch {}
    };

    const logout = useCallback(() => {
        setToken(null);
        setEmail(null);
        localStorage.removeItem("token");
        localStorage.removeItem("email");
    }, []);

    return <Ctx.Provider value={{ token, email, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
    const v = useContext(Ctx); 
    if (!v) throw new Error("useAuth must be used within AuthProvider");
    return v;
}