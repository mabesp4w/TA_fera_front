"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost">
        <Sun className="w-5 h-5" />
        <span className="ml-2 hidden sm:inline">Tema</span>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-[1] mt-3 w-52 border border-base-300 p-2 shadow-lg"
      >
        <li>
          <button
            onClick={() => setTheme("light")}
            className={theme === "light" ? "active" : ""}
          >
            <Sun className="w-5 h-5" />
            Light
          </button>
        </li>
        <li>
          <button
            onClick={() => setTheme("dark")}
            className={theme === "dark" ? "active" : ""}
          >
            <Moon className="w-5 h-5" />
            Dark
          </button>
        </li>
        <li>
          <button
            onClick={() => setTheme("device")}
            className={theme === "device" ? "active" : ""}
          >
            <Monitor className="w-5 h-5" />
            Device
          </button>
        </li>
      </ul>
    </div>
  );
}

