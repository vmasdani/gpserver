import { createContext } from "react";

export const AppContext = createContext<{
  baseUrl: string | null;
  setBaseUrl: (_: string) => void;

  apiKey: string | null;
  setApiKey: (_: string) => void;
} | null>(null);
