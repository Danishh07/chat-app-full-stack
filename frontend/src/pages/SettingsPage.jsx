import { useEffect, useRef } from "react";
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { playNotificationSound } from "../utils/playSound";

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const { soundEnabled, toggleSound } = useSettingsStore();

  const prevSoundEnabled = useRef(soundEnabled);

  // Play sound when toggled ON
  useEffect(() => {
    if (!prevSoundEnabled.current && soundEnabled) {
      playNotificationSound();
    }
    prevSoundEnabled.current = soundEnabled;
  }, [soundEnabled]);

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl">
      <div className="space-y-6">
        {/* Theme Selection */}
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Theme</h2>
          <p className="text-sm text-base-content/70">Choose a theme for your chat interface</p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {THEMES.map((t) => (
            <button
              key={t}
              className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
                ${theme === t ? "bg-base-200" : "hover:bg-base-200/50"}`}
              onClick={() => setTheme(t)}
            >
              <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={t}>
                <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                  <div className="rounded bg-primary"></div>
                  <div className="rounded bg-secondary"></div>
                  <div className="rounded bg-accent"></div>
                  <div className="rounded bg-neutral"></div>
                </div>
              </div>
              <span className="text-[11px] font-medium truncate w-full text-center">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            </button>
          ))}
        </div>

        {/* Sound Notification Toggle */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="text-sm text-base-content/70 mb-2">Control your sound alerts</p>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={soundEnabled}
              onChange={toggleSound}
            />
            <span>Enable Notification Sounds</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;