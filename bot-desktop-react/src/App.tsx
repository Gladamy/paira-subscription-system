import { useState, useEffect, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import Editor from "@monaco-editor/react";
import AnsiToHtml from "ansi-to-html";
import {
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import "./App.css";

// Production API configuration
const API_BASE = 'https://api.paira.live';

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [botStatus, setBotStatus] = useState("Stopped");
  const [tradesSent] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [config, setConfig] = useState<string>("");
  const [configLoaded, setConfigLoaded] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [customAccent, setCustomAccent] = useState<string>("#374151");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [licenseValid, setLicenseValid] = useState<boolean | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'login' | 'subscribing'>('checking');
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  // Config form state
  const [configForm, setConfigForm] = useState({
    speed: {
      fast_mode: true,
      fast_disable_images: true,
      implicit_wait_secs: 0.1,
      page_change_timeout: 1.5,
      mutation_poll_ms: 80,
      human_delay_min: 0.05,
      human_delay_max: 0.1,
      max_pages_scan: 50
    },
    trading_preferences: {
      trading_modes: ["downgrade"],
      avoid_projected: true,
      avoid_projected_offer: true,
      upgrade_to_valued_only: false,
      valued_premium_min_percent: -0.05,
      valued_premium_max_percent: 0.02
    },
    limits: {
      max_offer_items: 4,
      max_request_items: 4,
      min_item_value: 1000
    }
  });

  // Helper function to calculate brightness of a color
  const getBrightness = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  };


  // Generate theme colors based on accent
  const generateThemeColors = (accent: string) => {
    const brightness = getBrightness(accent);
    const isLightAccent = brightness > 128;

    // For light theme
    const lightSurface = isLightAccent ? '#ffffff' : '#f8fafc';
    const lightBorder = isLightAccent ? '#e5e7eb' : '#d1d5db';
    const lightText = isLightAccent ? '#111827' : '#1f2937';

    // For dark theme
    const darkSurface = isLightAccent ? '#1f2937' : '#111827';
    const darkBorder = isLightAccent ? '#374151' : '#4b5563';
    const darkText = isLightAccent ? '#f9fafb' : '#e5e7eb';

    return {
      light: {
        surface: lightSurface,
        border: lightBorder,
        text: lightText,
        accent
      },
      dark: {
        surface: darkSurface,
        border: darkBorder,
        text: darkText,
        accent
      }
    };
  };

  const themeColors = generateThemeColors(customAccent);
  const currentThemeColors = themeColors[theme];

  const ansiConverter = useMemo(() => new AnsiToHtml({
    fg: currentThemeColors.text,
    bg: currentThemeColors.surface,
    newline: true,
    escapeXML: true,
    stream: true,
    colors: {
      0: '#000000', // black
      1: '#ef4444', // red (bright red)
      2: customAccent, // green -> use accent color (for success messages)
      3: '#eab308', // yellow (bright yellow)
      4: customAccent, // blue -> use accent color
      5: '#a855f7', // magenta (bright magenta)
      6: '#06b6d4', // cyan (bright cyan)
      7: currentThemeColors.text, // white -> use theme text color
      8: '#6b7280', // bright black (gray)
      9: '#f87171', // bright red
      10: '#4ade80', // bright green
      11: '#facc15', // bright yellow
      12: customAccent, // bright blue -> use accent color
      13: '#c084fc', // bright magenta
      14: '#22d3ee', // bright cyan
      15: currentThemeColors.text, // bright white -> use theme text color
    },
  }), [currentThemeColors.text, currentThemeColors.surface, customAccent]);

  useEffect(() => {
    const unlisten = listen("bot-log", (event) => {
      setLogs((prev) => [...prev, event.payload as string]);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // Load theme settings from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("botDesktop-theme");
    const savedCustomAccent = localStorage.getItem("botDesktop-customAccent");

    if (savedTheme) {
      setTheme(savedTheme as "light" | "dark");
    }
    if (savedCustomAccent) {
      setCustomAccent(savedCustomAccent);
    }
  }, []);

  // Save theme settings to localStorage
  useEffect(() => {
    localStorage.setItem("botDesktop-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("botDesktop-customAccent", customAccent);
  }, [customAccent]);

  const startBot = async () => {
    try {
      const result = await invoke("start_bot");
      setBotStatus("Running");
      setLogs((prev) => [...prev, `Bot started: ${result}`]);
    } catch (error) {
      setLogs((prev) => [...prev, `Error starting bot: ${error}`]);
    }
  };

  const stopBot = async () => {
    try {
      const result = await invoke("stop_bot");
      setBotStatus("Stopped");
      setLogs((prev) => [...prev, `Bot stopped: ${result}`]);
    } catch (error) {
      setLogs((prev) => [...prev, `Error stopping bot: ${error}`]);
    }
  };

  const checkStatus = async () => {
    try {
      const status = await invoke("get_bot_status");
      setBotStatus(status as string);
    } catch (error) {
      setLogs((prev) => [...prev, `Error checking status: ${error}`]);
    }
  };

  useEffect(() => {
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // License validation (demo - would normally run on app start)
  const validateLicense = async () => {
    try {
      const hwid = await invoke('get_hwid');
      const deviceName = await invoke('get_device_name');

      console.log('HWID:', hwid);
      console.log('Device:', deviceName);

      // For demo purposes, we'll simulate license validation
      // In production, this would call your backend API
      setLicenseValid(true); // Simulate valid license
      setLogs((prev) => [...prev, `License validated for device: ${deviceName}`]);

    } catch (error) {
      console.error('License validation failed:', error);
      setLicenseValid(false);
      setLogs((prev) => [...prev, `License validation failed: ${error}`]);
    }
  };

  // License validation and auth check on app start
  const checkAuthStatus = async () => {
    try {
      // Check for stored auth token
      const storedToken = localStorage.getItem('paira_auth_token');
      if (!storedToken) {
        setAuthState('login');
        return;
      }

      // Validate license with backend
      const hwid = await invoke('get_hwid');
      const response = await fetch(`${API_BASE}/api/licenses/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        },
        body: JSON.stringify({ hwid })
      });

      const result = await response.json();

      if (result.valid) {
        setUserToken(storedToken);
        setLicenseValid(true);
        setSubscription(result.subscription);
        setAuthState('authenticated');
      } else {
        setAuthState('login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState('login');
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const logout = () => {
    localStorage.removeItem('paira_auth_token');
    setUserToken(null);
    setUser(null);
    setSubscription(null);
    setLicenseValid(null);
    setAuthState('login');
    setShowWelcome(false);
  };


  const loadConfig = async () => {
    try {
      const configData = await invoke("get_config");
      const parsedConfig = JSON.parse(configData as string);

      // Update form state with loaded config
      setConfigForm({
        speed: {
          fast_mode: parsedConfig.speed?.fast_mode ?? true,
          fast_disable_images: parsedConfig.speed?.fast_disable_images ?? true,
          implicit_wait_secs: parsedConfig.speed?.implicit_wait_secs ?? 0.1,
          page_change_timeout: parsedConfig.speed?.page_change_timeout ?? 1.5,
          mutation_poll_ms: parsedConfig.speed?.mutation_poll_ms ?? 80,
          human_delay_min: parsedConfig.speed?.human_delay_min ?? 0.05,
          human_delay_max: parsedConfig.speed?.human_delay_max ?? 0.1,
          max_pages_scan: parsedConfig.speed?.max_pages_scan ?? 50
        },
        trading_preferences: {
          trading_modes: parsedConfig.trading_preferences?.trading_modes ?? ["downgrade"],
          avoid_projected: parsedConfig.trading_preferences?.avoid_projected ?? true,
          avoid_projected_offer: parsedConfig.trading_preferences?.avoid_projected_offer ?? true,
          upgrade_to_valued_only: parsedConfig.trading_preferences?.upgrade_to_valued_only ?? false,
          valued_premium_min_percent: parsedConfig.trading_preferences?.valued_premium_min_percent ?? -0.05,
          valued_premium_max_percent: parsedConfig.trading_preferences?.valued_premium_max_percent ?? 0.02
        },
        limits: {
          max_offer_items: parsedConfig.limits?.max_offer_items ?? 4,
          max_request_items: parsedConfig.limits?.max_request_items ?? 4,
          min_item_value: parsedConfig.limits?.min_item_value ?? 1000
        }
      });

      setConfig(configData as string);
      setConfigLoaded(true);
    } catch (error) {
      setLogs((prev) => [...prev, `Error loading config: ${error}`]);
    }
  };

  const saveConfig = async () => {
    try {
      // Merge form data with existing config to preserve other sections
      const existingConfig = JSON.parse(config);
      const updatedConfig = {
        ...existingConfig,
        speed: configForm.speed,
        trading_preferences: configForm.trading_preferences,
        limits: configForm.limits
      };

      const configString = JSON.stringify(updatedConfig, null, 2);
      await invoke("save_config", { config: configString });
      setConfig(configString);
      setLogs((prev) => [...prev, "Configuration saved successfully"]);
    } catch (error) {
      setLogs((prev) => [...prev, `Error saving config: ${error}`]);
    }
  };

  useEffect(() => {
    if (activeTab === "settings" && !configLoaded) {
      loadConfig();
    }
  }, [activeTab, configLoaded]);

  const appWindow = getCurrentWindow();

  // Show loading screen while checking auth
  if (authState === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen surface text-custom">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-custom opacity-75">Checking license...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (authState === 'login') {
    return <AuthScreen onAuthenticated={(token, userData) => {
      setUserToken(token);
      setUser(userData);
      setAuthState('subscribing');
      setShowWelcome(true);
      // Hide welcome message after 3 seconds
      setTimeout(() => setShowWelcome(false), 3000);
    }} />;
  }

  // Show subscription screen if authenticated but no subscription
  if (authState === 'subscribing') {
    return <SubscriptionScreen
      userToken={userToken!}
      onSubscribed={(subscriptionData) => {
        setSubscription(subscriptionData);
        setLicenseValid(true);
        setAuthState('authenticated');
      }}
    />;
  }

  return (
    <div
      className="flex flex-col h-screen surface text-custom"
      style={{
        '--accent-color': customAccent,
        '--surface-color': currentThemeColors.surface,
        '--border-color': currentThemeColors.border,
        '--text-color': currentThemeColors.text
      } as React.CSSProperties}
    >
      {/* Custom Title Bar */}
      <div className="flex items-center justify-between h-12 border-b border-custom px-4 select-none surface text-custom">
        <div
          className="flex-1 cursor-move"
          data-tauri-drag-region
          style={{ height: '100%' }}
        ></div>
        <h1 className="text-lg font-medium text-custom absolute left-4">Paira</h1>
        <div className="flex items-center space-x-1 z-10">
          <button
            onClick={async () => {
              console.log('Minimize button clicked');
              try {
                const result = await appWindow.minimize();
                console.log('Minimize result:', result);
              } catch (error) {
                console.error('Failed to minimize window:', error);
              }
            }}
            className="w-8 h-8 flex items-center justify-center rounded surface border border-custom hover:accent hover:text-white transition-all duration-200"
          >
            <span className="text-sm font-bold">−</span>
          </button>
          <button
            onClick={async () => {
              console.log('Maximize button clicked');
              try {
                const result = await appWindow.toggleMaximize();
                console.log('Toggle maximize result:', result);
              } catch (error) {
                console.error('Failed to toggle maximize:', error);
              }
            }}
            className="w-8 h-8 flex items-center justify-center rounded surface border border-custom hover:accent hover:text-white transition-all duration-200"
          >
            <span className="text-sm font-bold">□</span>
          </button>
          <button
            onClick={async () => {
              console.log('Close button clicked');
              try {
                const result = await appWindow.close();
                console.log('Close result:', result);
              } catch (error) {
                console.error('Failed to close window:', error);
              }
            }}
            className="w-8 h-8 flex items-center justify-center rounded surface border border-custom hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <span className="text-sm font-bold">×</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        <aside className={`border-r border-custom shadow-neumorphism surface text-custom transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-56"
        }`}>
          {/* Header */}
          <div className="p-4 border-b border-custom">
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-custom">Bot</h2>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1 rounded surface border border-custom hover:accent hover:text-white transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="w-full p-1 rounded surface border border-custom hover:accent hover:text-white transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4 mx-auto" />
              </button>
            )}
          </div>

          {/* Status */}
          <div className="p-3 border-b border-custom">
            <div className="flex justify-center">
              {botStatus === "Running" ? (
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
              ) : (
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-2">
            <div className="space-y-1">
              <button
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} p-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "dashboard"
                    ? "accent text-white"
                    : "hover:accent hover:text-white"
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">Dashboard</span>}
              </button>

              <button
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} p-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "settings"
                    ? "accent text-white"
                    : "hover:accent hover:text-white"
                }`}
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">Settings</span>}
              </button>

            </div>
          </nav>

          {/* Profile Section */}
          {user && (
            <div className="mt-auto p-3 border-t border-custom">
              {!sidebarCollapsed && (
                <div className="mb-3">
                  <div className="text-xs text-custom opacity-75 mb-1">Logged in as</div>
                  <div className="text-sm font-medium text-custom truncate">{user.email}</div>
                  {subscription && (
                    <div className="text-xs text-green-600 mt-1">
                      {subscription.plan} • Active
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg font-medium transition-all duration-200 surface text-custom border border-custom hover:accent hover:text-white text-sm"
              >
                <span>Logout</span>
              </button>
            </div>
          )}
        </aside>

      <main className="flex-1 p-5 overflow-y-auto">
        {activeTab === "dashboard" && (
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-medium mb-5 text-custom">
                {showWelcome && user ? `Hey again, ${user.email}!` : 'Dashboard'}
              </h1>

              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
                <div className="border border-custom rounded-neumorphism p-5 shadow-neumorphism surface">
                  <h3 className="text-base font-medium mb-2.5 text-custom">Bot Status</h3>
                  <p className={`text-lg font-medium ${botStatus === "Running" ? "text-green-600" : "text-red-600"}`}>
                    {botStatus}
                  </p>
                </div>
                <div className="border border-custom rounded-neumorphism p-5 shadow-neumorphism surface">
                  <h3 className="text-base font-medium mb-2.5 text-custom">Trades Sent</h3>
                  <p className="text-2xl font-medium text-custom">{tradesSent}</p>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  className="accent text-white border border-custom rounded-neumorphism px-6 py-3 font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={startBot}
                  disabled={botStatus === "Running"}
                >
                  Start Bot
                </button>
                <button
                  className="surface text-custom border border-custom rounded-neumorphism px-6 py-3 font-medium transition-all hover:accent hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={stopBot}
                  disabled={botStatus === "Stopped"}
                >
                  Stop Bot
                </button>
                <button
                  className="surface text-custom border border-custom rounded-neumorphism px-6 py-3 font-medium transition-all hover:accent hover:text-white"
                  onClick={validateLicense}
                >
                  Test License
                </button>
              </div>
            </div>

            {/* Logs Section */}
            <div className="h-64">
              <div className="border border-custom rounded-neumorphism shadow-neumorphism surface h-full flex flex-col">
                <div className="p-3 border-b border-custom">
                  <h3 className="text-sm font-medium text-custom">Activity Logs</h3>
                </div>
                <div className="flex-1 p-2 overflow-y-auto">
                  <div className="space-y-0.5">
                    {logs.length === 0 ? (
                      <div className="text-center py-4 text-custom opacity-50">
                        <p className="text-xs">No logs yet. Start the bot to see activity.</p>
                      </div>
                    ) : (
                      logs.slice(-50).map((log, index) => (
                        <div
                          key={index}
                          className="px-2 py-1 rounded surface border border-custom text-xs font-mono"
                        >
                          <div className="flex items-start gap-1.5">
                            <div className="flex-shrink-0 w-1 h-1 rounded-full bg-accent mt-1 opacity-60"></div>
                            <div className="flex-1 min-w-0">
                              <div
                                className="text-custom break-words leading-tight"
                                dangerouslySetInnerHTML={{ __html: ansiConverter.toHtml(log) }}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <h1 className="text-2xl font-medium mb-5 text-custom">Settings</h1>
            <div className="space-y-6">
              {/* Appearance Settings */}
              <div className="border border-custom rounded-neumorphism p-5 shadow-neumorphism surface">
                <h3 className="text-lg font-medium mb-3 text-custom">Appearance Settings</h3>

                {/* Theme Mode */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2 text-custom">Theme Mode</h4>
                  <div className="flex gap-3">
                    <button
                      className={`px-3 py-2 rounded-neumorphism font-medium transition-all text-sm ${
                        theme === "light"
                          ? "accent text-white"
                          : "surface text-custom border border-custom hover:accent hover:text-white"
                      }`}
                      onClick={() => setTheme("light")}
                    >
                      Light
                    </button>
                    <button
                      className={`px-3 py-2 rounded-neumorphism font-medium transition-all text-sm ${
                        theme === "dark"
                          ? "accent text-white"
                          : "surface text-custom border border-custom hover:accent hover:text-white"
                      }`}
                      onClick={() => setTheme("dark")}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                {/* Custom Accent Color */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-custom">Accent Color</h4>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customAccent}
                      onChange={(e) => setCustomAccent(e.target.value)}
                      className="w-12 h-10 rounded border-2 border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm font-mono text-custom">
                      {customAccent.toUpperCase()}
                    </span>
                    <button
                      className="px-3 py-1 rounded text-xs font-medium transition-all surface text-custom border border-custom hover:accent hover:text-white"
                      onClick={() => setCustomAccent("#374151")}
                    >
                      Reset
                    </button>
                  </div>
                  <p className="text-xs mt-2 text-custom opacity-75">
                    Choose any color - the entire UI will automatically adapt to match it perfectly
                  </p>
                </div>
              </div>

              {/* Config.json Editor */}
              <div className="border border-custom rounded-neumorphism p-5 shadow-neumorphism surface">
                <h3 className="text-lg font-medium mb-3 text-custom">Configuration</h3>
                <div className="border border-border rounded-neumorphism overflow-hidden shadow-neumorphism">
                  <Editor
                    height="500px"
                    language="json"
                    value={config}
                    onChange={(value) => setConfig(value || "")}
                    theme={theme === "dark" ? "vs-dark" : "vs"}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    className="accent text-white border border-custom rounded-neumorphism px-4 py-2 font-medium transition-all hover:shadow-lg"
                    onClick={saveConfig}
                  >
                    Save Config
                  </button>
                  <button
                    className="border border-custom rounded-neumorphism px-4 py-2 font-medium transition-all surface text-custom hover:accent hover:text-white"
                    onClick={loadConfig}
                  >
                    Reload Config
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
      </div>
    </div>
  );
}

// AuthScreen Component
const AuthScreen: React.FC<{ onAuthenticated: (token: string, userData: any) => void }> = ({ onAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      console.log('Making request to:', `${API_BASE}${endpoint}`);
      console.log('Request body:', { email, password });

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        localStorage.setItem('paira_auth_token', data.token);
        onAuthenticated(data.token, data.user);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Network error:', error);
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center surface p-4">
      <div className="border border-custom rounded-neumorphism p-8 shadow-neumorphism surface max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-custom mb-2">Paira Bot</h1>
          <p className="text-custom opacity-75">Professional Roblox Trading Automation</p>
        </div>

        <div className="flex mb-6 border border-custom rounded-neumorphism">
          <button
            className={`flex-1 py-2 px-4 rounded-l-neumorphism font-medium transition-all ${
              isLogin ? 'accent text-white' : 'text-custom hover:accent hover:text-white'
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-r-neumorphism font-medium transition-all ${
              !isLogin ? 'accent text-white' : 'text-custom hover:accent hover:text-white'
            }`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-custom rounded-neumorphism surface text-custom placeholder-custom placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-custom rounded-neumorphism surface text-custom placeholder-custom placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-neumorphism">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full accent text-white border border-custom rounded-neumorphism px-6 py-3 font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-custom opacity-50">
          {!isLogin ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            className="text-accent hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </div>
      </div>
    </div>
  );
};

// SubscriptionScreen Component
const SubscriptionScreen: React.FC<{
  userToken: string;
  onSubscribed: (subscriptionData: any) => void;
}> = ({ userToken, onSubscribed }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  const plans = {
    monthly: { price: '$6.99', period: 'month', priceId: 'price_1S67LIHF7lE4j38pfL7hMYpA' },
    annual: { price: '$54.99', period: 'year', priceId: 'price_1S75fTHF7lE4j38pMqjFt3Im', savings: 'Save 25%' }
  };

  // Check if user already has an active subscription
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/subscriptions/status`, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.subscription && data.subscription.status === 'active') {
            setHasActiveSubscription(true);
            onSubscribed(data.subscription);
          }
        }
      } catch (error) {
        console.error('Failed to check subscription status:', error);
      }
    };

    checkSubscription();
  }, [userToken, onSubscribed]);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/subscriptions/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ priceId: plans[selectedPlan].priceId })
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Open Stripe checkout in external browser
        window.open(data.url, '_blank');
        // In a real app, you'd listen for the success callback
        // For demo, we'll simulate success after a delay
        setTimeout(() => {
          onSubscribed({ plan: selectedPlan, status: 'active' });
        }, 3000);
      } else {
        alert('Failed to create checkout session');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (hasActiveSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center surface p-4">
        <div className="border border-custom rounded-neumorphism p-8 shadow-neumorphism surface max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-medium text-custom mb-2">Welcome back!</h1>
            <p className="text-custom opacity-75">You already have an active subscription.</p>
          </div>
          <button
            onClick={() => onSubscribed({ plan: 'active', status: 'active' })}
            className="accent text-white border border-custom rounded-neumorphism px-6 py-3 font-medium transition-all hover:shadow-lg"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center surface p-4">
      <div className="border border-custom rounded-neumorphism p-8 shadow-neumorphism surface max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-custom mb-2">Choose Your Plan</h1>
          <p className="text-custom opacity-75">Unlock the full power of Paira Bot</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Monthly Plan */}
          <div
            className={`border-2 rounded-neumorphism p-6 cursor-pointer transition-all ${
              selectedPlan === 'monthly'
                ? 'border-accent bg-accent bg-opacity-5'
                : 'border-custom hover:border-accent'
            }`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <div className="text-center">
              <h3 className="text-xl font-medium text-custom mb-2">Monthly</h3>
              <div className="text-3xl font-bold text-accent mb-1">{plans.monthly.price}</div>
              <div className="text-custom opacity-75">per {plans.monthly.period}</div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-custom">
              <li>✓ Full bot functionality</li>
              <li>✓ HWID-based licensing</li>
              <li>✓ Priority support</li>
              <li>✓ Cancel anytime</li>
            </ul>
          </div>

          {/* Annual Plan */}
          <div
            className={`border-2 rounded-neumorphism p-6 cursor-pointer transition-all relative ${
              selectedPlan === 'annual'
                ? 'border-accent bg-accent bg-opacity-5'
                : 'border-custom hover:border-accent'
            }`}
            onClick={() => setSelectedPlan('annual')}
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-accent text-white text-xs px-3 py-1 rounded-full font-medium">
                {plans.annual.savings}
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-medium text-custom mb-2">Annual</h3>
              <div className="text-3xl font-bold text-accent mb-1">{plans.annual.price}</div>
              <div className="text-custom opacity-75">per {plans.annual.period}</div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-custom">
              <li>✓ All Monthly features</li>
              <li>✓ 2 months free</li>
              <li>✓ Exclusive beta access</li>
              <li>✓ Premium support</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="accent text-white border border-custom rounded-neumorphism px-8 py-4 font-medium text-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Subscribe to ${selectedPlan === 'monthly' ? 'Monthly' : 'Annual'} Plan`}
          </button>
          <p className="text-xs text-custom opacity-50 mt-4">
            Secure payment powered by Stripe • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
