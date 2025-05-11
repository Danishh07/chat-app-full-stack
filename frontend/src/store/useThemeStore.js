import { create } from "zustand";

// Only allow "light" or "dark"
const allowedThemes = ["light", "dark"];
const storedTheme = localStorage.getItem("chat-theme");
const defaultTheme = allowedThemes.includes(storedTheme) ? storedTheme : "light";

export const useThemeStore = create((set) => ({
  theme: defaultTheme,
  setTheme: (theme) => {
    if (allowedThemes.includes(theme)) {
      localStorage.setItem("chat-theme", theme);
      set({ theme });
    }
  },
}));