"use client"; 

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

type AuthCtx = {
    token: string | null; 
    login: (jwt: string) => void; 
    logout: () => void;
};

const Ctx = createContext<AuthCtx>({ token: null, login: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null); 

    useEffect(() => {
        try {
            const t = localStorage.getItem("token");
            if (t) setToken(t);
        } catch {}
    }, []);

    function login(jwt: string) {
        localStorage.setItem("token", jwt);
        setToken(jwt);
    }

    function logout() {
        localStorage.removeItem("token");
        setToken(null);
    }

    return <Ctx.Provider value={{ token , login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
    return useContext(Ctx);
}