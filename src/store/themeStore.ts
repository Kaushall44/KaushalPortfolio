import { create } from "zustand";

// Utility function to get the initial theme
const getInitialTheme = () => {
  // Check local storage
  const savedTheme = localStorage.getItem("darkMode");
  if (savedTheme !== null) {
    const isDark = JSON.parse(savedTheme);
    // Apply data-theme synchronously to prevent FOUC
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
    return isDark;
  }

  return false;
};

interface ThemeState {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  darkMode: getInitialTheme(),
  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.darkMode;
      document.documentElement.setAttribute(
        "data-theme",
        newMode ? "dark" : "light"
      );
      localStorage.setItem("darkMode", JSON.stringify(newMode));
      return { darkMode: newMode };
    }),
}));
