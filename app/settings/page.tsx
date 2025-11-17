"use client";
import axios from "axios";
import React, { useEffect, useState, FormEvent } from "react";
import { useLanguage } from "../components/contexts/LanguageContext";
import { useTheme } from "../components/contexts/themeContext";

interface User {
  userId: string;
  name: string;
}

interface Setting {
  id: string;
  notifications: boolean;
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;
  user: User;
}

const requestAndShowConfirmation = (title: string, body: string) => {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification(title, { body });
    return;
  }

  if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") new Notification(title, { body });
    });
  }
};

const Page = () => {
  
const { language, setLanguage } = useLanguage();
const { theme, setTheme } = useTheme();
  const [notifications, setNotification] = useState<boolean>(false);
  const [timezone, setTimezone] = useState<string>("GMT");
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  setTimezone(detected);
}, []);


  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await axios.get("/api/settings");
        const data: Setting | null = res.data;

        if (data) {
          setTheme(data.theme);
          setSettingsId(data.id);
          setNotification(data.notifications);
          setLanguage(data.language);
          setTimezone(data.timezone);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []); // FIXED

  // SUBMIT HANDLER
  const handlerPost = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      theme,
      language,
      notifications,
      timezone,
    };

    try {
      if (settingsId) {
        await axios.put("/api/settings", payload);
      } else {
        const res = await axios.post("/api/settings", payload);
        setSettingsId(res.data.id);
      }

      if (notifications === true) {
        requestAndShowConfirmation(
          "Notifications Enabled",
          "Your settings have been saved. You will now receive alerts."
        );
      }
    } catch (err) {
      console.error("Error saving settings:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-xl font-medium text-fuchsia-600 dark:text-fuchsia-400">
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-10 flex justify-center">
      <form
        onSubmit={handlerPost}
        className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-10 space-y-10"
      >
        <h1 className="text-4xl font-bold text-center text-fuchsia-600 dark:text-fuchsia-400">
          Settings
        </h1>

        {/* THEME */}
        <div className="flex justify-between items-center">
          <span className="text-xl font-medium text-gray-700 dark:text-gray-200">
            Theme
          </span>
          

// on theme select:
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as "light" | "dark" | "auto")}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>

        </div>

        <div className="flex justify-between items-center">
          <span className="text-xl font-medium text-gray-700 dark:text-gray-200">
            Language
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-40 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-fuchsia-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="English">English</option>
            <option value="A/Oromoo">Afan Oromo</option>
            <option value="Amharic">Amharic</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xl font-medium text-gray-700 dark:text-gray-200">
            Notifications
          </span>

          <button
            type="button"
            onClick={() => setNotification(!notifications)}
            className={`relative w-14 h-7 flex items-center rounded-full transition-all duration-300 
              ${notifications ? "bg-fuchsia-600" : "bg-gray-400 dark:bg-gray-600"}
            `}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-all duration-300
                ${notifications ? "translate-x-7" : "translate-x-1"}
              `}
            />
          </button>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xl font-medium text-gray-700 dark:text-gray-200">
            Time Zone
          </span>
          <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-40 p-2 border rounded-lg shadow-sm"
           >
          <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
            Auto-detect ({Intl.DateTimeFormat().resolvedOptions().timeZone})
          </option>
          <option value="Africa/Addis_Ababa">Ethiopia (EAT)</option>
          <option value="Europe/London">UK (GMT)</option>
          <option value="America/Los_Angeles">USA (PST)</option>
        </select>

        </div>
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            className="w-40 py-3 bg-fuchsia-600 text-white rounded-xl shadow-lg hover:bg-fuchsia-700 transition-all dark:bg-fuchsia-500 dark:hover:bg-fuchsia-600"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default Page;
