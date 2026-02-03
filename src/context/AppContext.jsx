import React, { createContext, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AppContext = createContext(null);

const TOKEN_KEY = "authToken";
const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const ID_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

export function AppProvider({ children }) {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  // Artify role names koje koristiš: Kupac / Umetnik / Admin
  const [isKupac, setIsKupac] = useState(false);
  const [isUmetnik, setIsUmetnik] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);

    setUser(null);
    setUserId(null);
    setIsKupac(false);
    setIsUmetnik(false);
    setIsAdmin(false);
  };

  const login = (tokenOrResponse) => {
    // podrži string token ili { token: "..." }
    const token =
      typeof tokenOrResponse === "string"
        ? tokenOrResponse
        : tokenOrResponse?.token;

    if (!token) return;

    localStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
  };

  useEffect(() => {
    setIsLoading(true);

    if (!authToken) {
      setUser(null);
      setUserId(null);
      setIsKupac(false);
      setIsUmetnik(false);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(authToken);
      setUser(decoded);

      const role = decoded?.[ROLE_CLAIM] ?? decoded?.role ?? null;
      setIsKupac(role === "Kupac");
      setIsUmetnik(role === "Umetnik");
      setIsAdmin(role === "Admin");

      const id = decoded?.[ID_CLAIM] ?? decoded?.id ?? decoded?.userId ?? null;
      setUserId(id);
    } catch (e) {
      // token loš -> očisti
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  const value = useMemo(
    () => ({
      authToken,
      user,
      userId,
      isKupac,
      isUmetnik,
      isAdmin,
      isLoading,
      login,
      logout,
    }),
    [authToken, user, userId, isKupac, isUmetnik, isAdmin, isLoading]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
