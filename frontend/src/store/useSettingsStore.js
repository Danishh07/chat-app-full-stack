import { create } from "zustand";

export const useSettingsStore = create((set) => ({
  soundEnabled: JSON.parse(localStorage.getItem("chat-sound-enabled")) ?? true,
  toggleSound: () =>
    set((state) => {
      const newValue = !state.soundEnabled;
      localStorage.setItem("chat-sound-enabled", JSON.stringify(newValue));
      return { soundEnabled: newValue };
    }),

   doNotDisturb: JSON.parse(localStorage.getItem("chat-dnd")) ?? false,
   toggleDND: () =>
    set((state) => {
      const newValue = !state.doNotDisturb;
      localStorage.setItem("chat-dnd", JSON.stringify(newValue));
      return { doNotDisturb: newValue };
    }),
}));
