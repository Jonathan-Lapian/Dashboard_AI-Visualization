import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  Suspense,
  useTransition,
} from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LabelList,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./App.css";

// Import Three.js Components
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  ContactShadows,
  Html,
  Environment,
  Preload, // OPTIMASI: Preload untuk mencegah blank screen
  Loader, // OPTIMASI: Loading screen bawaan Drei
} from "@react-three/drei";

// Import Google Gemini AI
import { GoogleGenerativeAI } from "@google/generative-ai";
// ---> MASUKKAN API KEY PRIBADI ANDA DI SINI <---
const genAI = new GoogleGenerativeAI("API_KEY_ANDA");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// ==============================================================================
// 1. KONFIGURASI FIREBASE REALTIME DATABASE
// ==============================================================================
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  databaseURL: "https://davisai-fbf3c-default-rtdb.firebaseio.com/",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// ==============================================================================
// 2. SISTEM TEMA WARNA & ICONS
// ==============================================================================
const formatIDR = (value) =>
  `$ ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
const formatNilai = (val) => new Intl.NumberFormat("en-US").format(val);

const lightColors = {
  primary: "#C08B5C",
  secondary: "#8A6B56",
  dark: "#4A3324",
  red: "#D32F2F",
  green: "#388E3C",
  blue: "#0288D1",
  bgLight: "#FCF9F5",
  border: "#E6D5C3",
};

const darkColors = {
  primary: "#D4A373",
  secondary: "#B89F8D",
  dark: "#FDFBF7",
  red: "#EF5350",
  green: "#66BB6A",
  blue: "#4FC3F7",
  bgLight: "#1A1412",
  border: "#3E2F27",
};

const Icons = {
  Dashboard: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  Table: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Box: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  File: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  History: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Logout: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Sun: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Moon: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
};

// ==============================================================================
// 3. SISTEM AUDIO SYNTHESIZER
// ==============================================================================
let audioCtx = null;
const playUISound = (type) => {
  try {
    if (!audioCtx)
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === "hover") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.05,
      );
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === "click") {
      osc.type = "square";
      osc.frequency.setValueAtTime(300, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        100,
        audioCtx.currentTime + 0.1,
      );
      gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.1,
      );
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === "alert") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(500, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        200,
        audioCtx.currentTime + 0.2,
      );
      gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.2,
      );
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    }
  } catch (error) {}
};

// ==============================================================================
// 4. KOMPONEN MASKOT INTERAKTIF
// ==============================================================================
function InteractiveMascot({ isPasswordFocused, isDarkMode }) {
  const [mascotState, setMascotState] = useState("idle");
  const [clickCount, setClickCount] = useState(0);
  const [eyeOffset, setEyeOffset] = useState({ x: 18, y: 0 });
  const [shakeKey, setShakeKey] = useState(0);

  const containerRef = useRef(null);
  const inactivityTimer = useRef(null);
  const angerTimerRef = useRef(null);

  useEffect(() => {
    if (mascotState === "sleep") return;
    if (isDarkMode) {
      setMascotState("tired");
      const timer = setTimeout(() => {
        setMascotState("sleep");
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      if (mascotState === "tired") setMascotState("idle");
    }
  }, [isDarkMode, mascotState]);

  useEffect(() => {
    if (mascotState === "sleep") return;
    if (isPasswordFocused) {
      setMascotState("peeking");
    } else if (mascotState === "peeking") {
      setMascotState("idle");
    }
  }, [isPasswordFocused, mascotState]);

  useEffect(() => {
    if (mascotState === "sleep" || isDarkMode) return;

    const handleMouseMove = (e) => {
      if (mascotState === "sleep") return;
      if (mascotState === "tired") setMascotState("idle");

      if (mascotState === "idle" && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;
        const angle = Math.atan2(
          e.clientY - eyeCenterY,
          e.clientX - eyeCenterX,
        );
        setEyeOffset({ x: Math.cos(angle) * 8, y: Math.sin(angle) * 8 });
      }

      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        if (
          !isPasswordFocused &&
          mascotState !== "angry1" &&
          mascotState !== "angry2"
        ) {
          setMascotState("tired");
          setEyeOffset({ x: 0, y: 0 });
        }
      }, 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(inactivityTimer.current);
    };
  }, [mascotState, isDarkMode, isPasswordFocused]);

  const handlePoke = () => {
    if (mascotState === "sleep") return;

    const newCount = clickCount + 1;
    setClickCount(newCount);
    setShakeKey((prev) => prev + 1);

    if (newCount >= 4) {
      setMascotState("angry2");
      setEyeOffset({ x: 0, y: 0 });
    } else {
      setMascotState("angry1");
      setEyeOffset({ x: 0, y: 0 });
    }

    clearTimeout(angerTimerRef.current);
    angerTimerRef.current = setTimeout(() => {
      setClickCount(0);
      if (!isPasswordFocused) setMascotState("idle");
    }, 3000);
  };

  return (
    <div
      className="mascot-interactive-container"
      ref={containerRef}
      onClick={handlePoke}
    >
      <img
        src="/mascot-body.png"
        alt="Idle"
        className={`mascot-layer ${mascotState === "idle" || mascotState === "annoyed" ? "active" : ""}`}
      />
      <img
        src="/mascot-peeking.png"
        alt="Peeking"
        className={`mascot-layer ${mascotState === "peeking" ? "active" : ""}`}
      />
      <img
        key={`a1-${shakeKey}`}
        src="/mascot-angry1.png"
        alt="Angry 1"
        className={`mascot-layer ${mascotState === "angry1" ? "active mascot-shake-active" : ""}`}
      />
      <img
        key={`a2-${shakeKey}`}
        src="/mascot-angry2.png"
        alt="Angry 2"
        className={`mascot-layer ${mascotState === "angry2" ? "active mascot-shake-active" : ""}`}
      />
      <img
        src="/mascot-tired.png"
        alt="Tired"
        className={`mascot-layer ${mascotState === "tired" ? "active" : ""}`}
      />
      <img
        src="/mascot-sleep.png"
        alt="Sleep"
        className={`mascot-layer ${mascotState === "sleep" ? "active" : ""}`}
      />
      <img
        src="/mascot-eyes.png"
        alt="Eyes"
        className={`mascot-layer mascot-eyes ${mascotState === "idle" || mascotState === "annoyed" ? "active" : ""}`}
        style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }}
      />
    </div>
  );
}

// ==============================================================================
// 5. MAIN APP COMPONENT
// ==============================================================================
export default function App() {
  const [role, setRole] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(window.innerWidth > 768);

  // OPTIMASI 3: Transisi React 18 untuk navigasi tab yang lebih halus
  const [isPending, startTransition] = useTransition();

  const themeColors = isDarkMode ? darkColors : lightColors;

  const [rawProducts, setRawProducts] = useState({});
  const [processedData, setProcessedData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [activeQuickFilter, setActiveQuickFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("desc");

  const [logs, setLogs] = useState([
    {
      id: Date.now(),
      type: "SYSTEM",
      action: "Sistem Diinisialisasi",
      description: "Menghubungkan ke Davis AI...",
      user: "SYSTEM",
      timestamp: new Date().toISOString(),
    },
  ]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light",
    );
  }, [isDarkMode]);

  const addLog = (type, action, description, actingUser = role) => {
    setLogs((prev) => [
      {
        id: Date.now() + Math.random(),
        type,
        action,
        description,
        user: actingUser || "SYSTEM",
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  useEffect(() => {
    const dbRef = ref(db, "/");
    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const safeProductMap = {};
          const productRoot = data.products || data.Products || data.product;

          const extractProducts = (node) => {
            if (!node || typeof node !== "object") return;
            Object.keys(node).forEach((k) => {
              const p = node[k];
              if (
                p &&
                typeof p === "object" &&
                (p.category || p.price !== undefined || p.name)
              ) {
                let actualId =
                  p.product_id || p.productId || p.ProductID || p.id || k;
                safeProductMap[String(actualId).trim()] = {
                  name:
                    p.product_name ||
                    p.name ||
                    p.Product ||
                    `Produk ID ${actualId}`,
                  category:
                    p.product_category ||
                    p.category ||
                    p.Category ||
                    "Tanpa Kategori",
                  type: p.product_type || p.type || p.Type || "-",
                  price: parseFloat(
                    p.current_wholesale_price || p.price || p.Price || 0,
                  ),
                };
              }
            });
          };

          if (productRoot) extractProducts(productRoot);
          else
            Object.keys(data).forEach((k) => {
              if (k.toLowerCase().includes("product")) extractProducts(data[k]);
            });

          setRawProducts(safeProductMap);

          const rawItems = [];
          Object.keys(data).forEach((rootKey) => {
            const rootNode = data[rootKey];
            if (
              !rootNode ||
              typeof rootNode !== "object" ||
              rootKey.toLowerCase().includes("product")
            )
              return;
            if (
              rootNode.product_id ||
              rootNode.productId ||
              rootNode.ProductID
            ) {
              rawItems.push({ invId: rootKey, ...rootNode });
            } else {
              Object.keys(rootNode).forEach((childKey) => {
                const childNode = rootNode[childKey];
                if (
                  childNode &&
                  typeof childNode === "object" &&
                  (childNode.product_id ||
                    childNode.productId ||
                    childNode.ProductID)
                ) {
                  rawItems.push({
                    invId: `${rootKey}_${childKey}`,
                    ...childNode,
                  });
                }
              });
            }
          });

          const combined = rawItems.map((invItem) => {
            let rawDate =
              invItem.date ||
              invItem.transaction_date ||
              invItem.Date ||
              "2000-01-01";
            let fDate = String(rawDate).split(" ")[0];
            if (fDate.includes("/")) {
              const parts = fDate.split("/");
              if (parts.length === 3)
                fDate = `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
            } else {
              const dObj = new Date(fDate);
              if (!isNaN(dObj)) fDate = dObj.toISOString().split("T")[0];
            }

            const pId = String(
              invItem.product_id ||
                invItem.productId ||
                invItem.ProductID ||
                "",
            ).trim();
            const prodDetails = safeProductMap[pId] || {
              name: `Unknown (ID: ${pId})`,
              category: "Lainnya",
              type: "-",
              price: 0,
            };
            const price = parseFloat(prodDetails.price) || 0;
            const soldQty = parseFloat(
              invItem.sold || invItem.transaction_qty || invItem.qty || 1,
            );
            const wasteQty = parseFloat(invItem.waste || invItem.Waste || 0);

            return {
              invId: invItem.invId,
              ...invItem,
              formattedDate: fDate,
              productName: prodDetails.name,
              category: prodDetails.category,
              type: prodDetails.type,
              price: price,
              sold: soldQty,
              waste: wasteQty,
              revenue: soldQty * price,
              wasteCost: wasteQty * price,
            };
          });

          combined.sort((a, b) =>
            a.formattedDate.localeCompare(b.formattedDate),
          );
          setProcessedData(combined);
          setFirebaseError(null);
        } else {
          setFirebaseError("Database terhubung, tetapi data kosong.");
        }
        setIsLoading(false);
      },
      (error) => {
        setFirebaseError(`Koneksi Gagal: ${error.message}`);
        setIsLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (processedData.length > 0 && !startDate && !endDate) {
      setStartDate(processedData[0].formattedDate);
      setEndDate(processedData[processedData.length - 1].formattedDate);
    }
  }, [processedData, startDate, endDate]);

  const applyQuickFilter = (type) => {
    playUISound("click");
    setActiveQuickFilter(type);
    if (processedData.length === 0) return;
    const baseDate = new Date(processedData[0].formattedDate);
    let start = new Date(baseDate),
      end = new Date(baseDate);

    if (type === "W1") end.setDate(start.getDate() + 6);
    else if (type === "W2") {
      start.setDate(start.getDate() + 7);
      end.setDate(start.getDate() + 6);
    } else if (type === "W3") {
      start.setDate(start.getDate() + 14);
      end.setDate(start.getDate() + 6);
    } else if (type === "W4") {
      start.setDate(start.getDate() + 21);
      end.setDate(start.getDate() + 6);
    } else if (type === "ALL") {
      start = new Date(processedData[0].formattedDate);
      end = new Date(processedData[processedData.length - 1].formattedDate);
    }
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const filteredData = processedData.filter((d) => {
    if (categoryFilter !== "ALL" && d.category !== categoryFilter) return false;
    if (startDate && d.formattedDate < startDate) return false;
    if (endDate && d.formattedDate > endDate) return false;
    return true;
  });

  const uniqueCategories = [
    "ALL",
    ...new Set(processedData.map((d) => d.category)),
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    const selectedRole = e.target.roleSelect.value;
    setRole(selectedRole);
    setActiveTab("overview");
    addLog(
      "LOGIN",
      "Sesi Sistem Dimulai",
      `Pengguna masuk dengan otorisasi: ${selectedRole.toUpperCase()}`,
      selectedRole,
    );
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      const root = document.querySelector(".app-root");
      if (root) {
        root.style.setProperty("--mouse-x", `${e.clientX}px`);
        root.style.setProperty("--mouse-y", `${e.clientY}px`);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const ThemeSwitcher = () => (
    <div
      className={`theme-switch-wrapper ${isDarkMode ? "is-dark" : ""}`}
      onClick={() => {
        playUISound("click");
        setIsDarkMode(!isDarkMode);
      }}
    >
      <div className="theme-switch-thumb"></div>
      <div
        className={`theme-option ${!isDarkMode ? "active" : ""}`}
        title="Mode Terang"
      >
        <Icons.Sun />
      </div>
      <div
        className={`theme-option ${isDarkMode ? "active" : ""}`}
        title="Mode Gelap"
      >
        <Icons.Moon />
      </div>
    </div>
  );

  const switchTab = (tabName) => {
    startTransition(() => {
      setActiveTab(tabName);
    });
  };

  if (firebaseError)
    return (
      <div
        className="app-root"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            color: themeColors.red,
            fontSize: "40px",
            marginBottom: "10px",
          }}
        >
          KONEKSI GAGAL
        </h1>
        <p>{firebaseError}</p>
      </div>
    );
  if (isLoading)
    return (
      <div
        className="app-root"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            border: `5px solid ${themeColors.border}`,
            borderTop: `5px solid ${themeColors.primary}`,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h2
          style={{
            color: themeColors.dark,
            marginTop: "20px",
            letterSpacing: "2px",
          }}
        >
          MENYEDUH DATA KAFE...
        </h2>
      </div>
    );

  if (!role) {
    return (
      <div className="app-root">
        <div className="cursor-tracker">
          <div className="coffee-swirl"></div>
        </div>
        <div className="login-split-container">
          <div className="login-side-left animate-fade-in">
            <div className="login-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "30px",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 900 }}>
                  DAVIS CAFE
                </h2>
                <ThemeSwitcher />
              </div>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "14px",
                  marginBottom: "30px",
                }}
              >
                Silakan masuk untuk mengakses dasbor analitik kafe.
              </p>
              <form onSubmit={handleLogin} className="login-form">
                <div className="input-group">
                  <label>Otoritas Akses</label>
                  <select
                    name="roleSelect"
                    required
                    onFocus={() => playUISound("hover")}
                    className="cyber-select"
                  >
                    <option value="admin">Store Manager</option>
                    <option value="viewer">Data Analyst</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Kata Sandi</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    onFocus={() => {
                      playUISound("hover");
                      setIsPasswordFocused(true);
                    }}
                    onBlur={() => setIsPasswordFocused(false)}
                    className="cyber-input"
                  />
                </div>
                <button
                  type="submit"
                  onMouseEnter={() => playUISound("hover")}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "var(--primary)",
                    border: "none",
                    color: "var(--bg-base)",
                    fontWeight: "bold",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginTop: "10px",
                    fontSize: "15px",
                  }}
                >
                  Masuk Dashboard
                </button>
              </form>
            </div>
          </div>
          <div className="login-side-right">
            <InteractiveMascot
              isPasswordFocused={isPasswordFocused}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>
    );
  }

  const FilterUI = (
    <div
      className={`modern-control-panel animate-fade-in ${isFilterOpen ? "is-open" : "is-closed"}`}
    >
      <div
        className="filter-toggle-header"
        onClick={() => {
          playUISound("click");
          setIsFilterOpen(!isFilterOpen);
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span
            style={{
              fontSize: "13px",
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Filter Data
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {!isFilterOpen && (
            <span
              className="filter-hint"
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                fontWeight: "600",
              }}
            >
              Ketuk untuk ubah
            </span>
          )}
          <span
            style={{
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: isFilterOpen ? "rotate(180deg)" : "rotate(0deg)",
              fontSize: "12px",
              color: "var(--primary)",
            }}
          >
            ▼
          </span>
        </div>
      </div>

      <div className="filter-body-wrapper">
        <div className="filter-body-content">
          <div className="control-row">
            <div className="control-group mobile-date-group">
              <span className="control-label">Periode Data:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  playUISound("click");
                  setStartDate(e.target.value);
                  setActiveQuickFilter(null);
                }}
                className="date-input-modern"
              />
              <span
                className="date-separator"
                style={{ color: "var(--text-muted)", fontWeight: "bold" }}
              >
                —
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  playUISound("click");
                  setEndDate(e.target.value);
                  setActiveQuickFilter(null);
                }}
                className="date-input-modern"
              />
            </div>
            <div className="control-group quick-filter-wrapper">
              {["W1", "W2", "W3", "W4", "ALL"].map((t) => {
                const isActive = activeQuickFilter === t;
                return (
                  <button
                    key={t}
                    onMouseEnter={() => playUISound("hover")}
                    onClick={() => applyQuickFilter(t)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: `1px solid ${isActive ? "var(--text-main)" : "var(--primary)"}`,
                      background: isActive ? "var(--text-main)" : "transparent",
                      color: isActive ? "var(--bg-base)" : "var(--primary)",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: isActive
                        ? "0 4px 10px var(--shadow-color)"
                        : "none",
                    }}
                  >
                    {t === "ALL" ? "Semua Data" : `Minggu ${t[1]}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="control-row" style={{ marginTop: "15px" }}>
            <div
              className="control-group"
              style={{ alignItems: "flex-start", width: "100%" }}
            >
              <span
                className="control-label"
                style={{ marginTop: "8px", minWidth: "75px" }}
              >
                Kategori:
              </span>
              <div className="category-chips-wrapper">
                {uniqueCategories.map((c) => {
                  const isActive = categoryFilter === c;
                  return (
                    <button
                      key={c}
                      className={`category-chip ${isActive ? "active" : ""}`}
                      onMouseEnter={() => playUISound("hover")}
                      onClick={() => {
                        playUISound("click");
                        setCategoryFilter(c);
                      }}
                    >
                      {c === "ALL" ? "Semua Kategori" : c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            className="control-row"
            style={{
              marginTop: "15px",
              paddingTop: "15px",
              borderTop: "1px dashed var(--border-glass)",
            }}
          >
            <div
              className="control-group"
              style={{ alignItems: "center", width: "100%" }}
            >
              <span className="control-label" style={{ minWidth: "75px" }}>
                Performa:
              </span>
              <div
                style={{
                  display: "flex",
                  background: "var(--input-bg)",
                  borderRadius: "30px",
                  border: "1px solid var(--border-solid)",
                  padding: "4px",
                  gap: "4px",
                }}
              >
                <button
                  onClick={() => {
                    playUISound("click");
                    setSortOrder("desc");
                  }}
                  style={{
                    padding: "8px 20px",
                    border: "none",
                    borderRadius: "25px",
                    background:
                      sortOrder === "desc" ? "var(--primary)" : "transparent",
                    color:
                      sortOrder === "desc"
                        ? "var(--bg-base)"
                        : "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                    transition: "all 0.3s ease",
                    boxShadow:
                      sortOrder === "desc"
                        ? "0 4px 10px rgba(0,0,0,0.2)"
                        : "none",
                  }}
                >
                  Top 5
                </button>
                <button
                  onClick={() => {
                    playUISound("click");
                    setSortOrder("asc");
                  }}
                  style={{
                    padding: "8px 20px",
                    border: "none",
                    borderRadius: "25px",
                    background:
                      sortOrder === "asc" ? "var(--primary)" : "transparent",
                    color:
                      sortOrder === "asc"
                        ? "var(--bg-base)"
                        : "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                    transition: "all 0.3s ease",
                    boxShadow:
                      sortOrder === "asc"
                        ? "0 4px 10px rgba(0,0,0,0.2)"
                        : "none",
                  }}
                >
                  Bottom 5
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const showHeaderAndFilter = [
    "overview",
    "table",
    "3d-bar",
    "3d-pie",
  ].includes(activeTab);

  return (
    <div className="app-root">
      <div className="cursor-tracker">
        <div className="coffee-swirl"></div>
      </div>
      <div className="main-layout relative-z">
        <div
          className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>

        <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <h2>
              DAVIS<span style={{ color: "var(--primary)" }}>CAFE</span>
            </h2>
            <div className="status-dot"></div>
            <button
              className="mobile-close-btn"
              onClick={() => setIsSidebarOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="user-profile-card">
            <div className="user-avatar">{role === "admin" ? "AD" : "VW"}</div>
            <div className="user-details">
              <span className="name">User Internal</span>
              <span className="role">
                {role === "admin" ? "Store Manager" : "Data Analyst"}
              </span>
            </div>
          </div>
          <nav
            className="sidebar-nav"
            style={{
              flexGrow: 1,
              overflowY: "auto",
              padding: "0",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            <div className="nav-section-title">ANALITIK & DATA</div>
            <button
              onMouseEnter={() => playUISound("hover")}
              className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => {
                playUISound("click");
                switchTab("overview");
                setIsSidebarOpen(false);
              }}
            >
              <Icons.Dashboard /> Dasbor Analitik
            </button>
            <button
              onMouseEnter={() => playUISound("hover")}
              className={`nav-item ${activeTab === "table" ? "active" : ""}`}
              onClick={() => {
                playUISound("click");
                switchTab("table");
                setIsSidebarOpen(false);
              }}
            >
              <Icons.Table /> Tabel Transaksi
            </button>
            <div className="nav-section-title" style={{ marginTop: "15px" }}>
              MANAJEMEN SISTEM
            </div>
            <button
              onMouseEnter={() => playUISound("hover")}
              className={`nav-item ${activeTab === "products" ? "active" : ""}`}
              onClick={() => {
                playUISound("click");
                switchTab("products");
                setIsSidebarOpen(false);
              }}
            >
              <Icons.Box /> Master Produk
            </button>
            <button
              onMouseEnter={() => playUISound("hover")}
              className={`nav-item ${activeTab === "export" ? "active" : ""}`}
              onClick={() => {
                playUISound("click");
                switchTab("export");
                setIsSidebarOpen(false);
              }}
            >
              <Icons.File /> Cetak Laporan
            </button>
            <button
              onMouseEnter={() => playUISound("hover")}
              className={`nav-item ${activeTab === "history" ? "active" : ""}`}
              onClick={() => {
                playUISound("click");
                switchTab("history");
                setIsSidebarOpen(false);
              }}
            >
              <Icons.History /> Riwayat Sistem
            </button>
          </nav>
          <div
            className="sidebar-footer"
            style={{
              flexShrink: 0,
              padding: "25px 20px",
              borderTop: `1px solid var(--border-solid)`,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <ThemeSwitcher />
            <button
              className="logout-btn-sidebar"
              onMouseEnter={() => playUISound("hover")}
              onClick={() => {
                playUISound("click");
                addLog("LOGOUT", "Sesi Berakhir", "Keluar dari sistem");
                setRole(null);
              }}
            >
              <Icons.Logout /> Keluar Sistem
            </button>
          </div>
        </aside>

        <main className="content-area">
          <div className="mobile-menu-header">
            <button
              className="hamburger-btn"
              onClick={() => setIsSidebarOpen(true)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h2 className="mobile-logo-text">
              DAVIS<span style={{ color: "var(--primary)" }}>CAFE</span>
            </h2>
          </div>

          {showHeaderAndFilter && (
            <div
              className="header-section"
              style={{
                borderBottom: "none",
                paddingBottom: "0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div>
                <h1 className="main-title">
                  {activeTab === "overview" && "RINGKASAN PERFORMA PENJUALAN"}
                  {activeTab === "table" && "DATA TRANSAKSI MENTAH"}
                  {activeTab === "3d-bar" && "STUDIO ANALITIK: PRODUK"}
                  {activeTab === "3d-pie" && "STUDIO ANALITIK: KATEGORI"}
                </h1>
                {activeTab.startsWith("3d") && (
                  <span
                    style={{ fontSize: "12px", color: "var(--text-muted)" }}
                  >
                    Klik & seret untuk memutar kamera. Arahkan kursor ke grafik
                    untuk interaksi.
                  </span>
                )}
              </div>
              {activeTab.startsWith("3d") && (
                <button
                  className="page-btn"
                  onClick={() => {
                    playUISound("click");
                    switchTab("overview");
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "var(--primary)",
                    color: "var(--bg-base)",
                  }}
                >
                  ◀ Kembali ke Dasbor
                </button>
              )}
            </div>
          )}

          {showHeaderAndFilter && FilterUI}

          {/* RENDER KONTEN TAB */}
          {activeTab === "overview" && (
            <DashboardOverview
              data={filteredData}
              colors={themeColors}
              setTab={switchTab}
              sortOrder={sortOrder}
            />
          )}
          {activeTab === "table" && (
            <DataTableView
              data={filteredData}
              colors={themeColors}
              playUISound={playUISound}
            />
          )}
          {activeTab === "products" && (
            <ProductManager rawProducts={rawProducts} colors={themeColors} />
          )}
          {activeTab === "export" && (
            <ExportCenter
              data={filteredData}
              addLog={addLog}
              playUISound={playUISound}
              colors={themeColors}
            />
          )}
          {activeTab === "history" && (
            <HistoryLog
              logs={logs}
              playUISound={playUISound}
              colors={themeColors}
            />
          )}

          {/* SUSPENSE UNTUK 3D STUDIO AGAR TIDAK BLANK SCREEN */}
          {activeTab === "3d-bar" && (
            <div
              style={{ position: "relative", width: "100%", height: "65vh" }}
            >
              <Suspense fallback={null}>
                <Advanced3DBarView
                  data={filteredData}
                  isDarkMode={isDarkMode}
                  colors={themeColors}
                  sortOrder={sortOrder}
                />
              </Suspense>
              {/* Tambahkan Loader Drei di Sini */}
              <Loader
                dataInterpolation={(p) =>
                  `Memuat Studio 3D... ${p.toFixed(0)}%`
                }
              />
            </div>
          )}
          {activeTab === "3d-pie" && (
            <div
              style={{ position: "relative", width: "100%", height: "65vh" }}
            >
              <Suspense fallback={null}>
                <Advanced3DPieView
                  data={filteredData}
                  isDarkMode={isDarkMode}
                  colors={themeColors}
                  sortOrder={sortOrder}
                />
              </Suspense>
              {/* Tambahkan Loader Drei di Sini */}
              <Loader
                dataInterpolation={(p) =>
                  `Memuat Studio 3D... ${p.toFixed(0)}%`
                }
              />
            </div>
          )}
        </main>
      </div>

      <FloatingAIChatAssistant
        data={filteredData}
        playUISound={playUISound}
        isOpen={isChatOpen}
        toggleChat={() => {
          playUISound("click");
          setIsChatOpen(!isChatOpen);
        }}
        activeTab={activeTab}
        categoryFilter={categoryFilter}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
}

// ==============================================================================
// 5. VIEW COMPONENTS (DASHBOARD 2D & TABLES)
// ==============================================================================
function DashboardOverview({ data, colors, setTab, sortOrder }) {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalSold = data.reduce((sum, item) => sum + item.sold, 0);
  const totalWaste = data.reduce((sum, item) => sum + item.waste, 0);

  const catSales = {};
  data.forEach((d) => {
    catSales[d.category] = (catSales[d.category] || 0) + d.revenue;
  });

  const sortedCategories = Object.keys(catSales)
    .sort((a, b) =>
      sortOrder === "desc"
        ? catSales[b] - catSales[a]
        : catSales[a] - catSales[b],
    )
    .slice(0, 5);

  const topCategory = sortedCategories[0] || "N/A";
  const pieChartData = sortedCategories.map((cat) => ({
    name: cat,
    value: catSales[cat],
  }));

  const lineMap = {};
  data.forEach((d) => {
    lineMap[d.formattedDate] = (lineMap[d.formattedDate] || 0) + d.revenue;
  });
  const lineChartData = Object.keys(lineMap)
    .map((date) => ({ date, pendapatan: lineMap[date] }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const productMap = {};
  data.forEach((d) => {
    if (!productMap[d.productName])
      productMap[d.productName] = { revenue: 0, category: d.category };
    productMap[d.productName].revenue += d.revenue;
  });

  const barChartData = Object.keys(productMap)
    .map((name) => ({
      name: name.length > 20 ? name.substring(0, 20) + "..." : name,
      pendapatan: productMap[name].revenue,
      category: productMap[name].category,
    }))
    .sort((a, b) =>
      sortOrder === "desc"
        ? b.pendapatan - a.pendapatan
        : a.pendapatan - b.pendapatan,
    )
    .slice(0, 5);

  const PIE_COLORS = [
    colors.primary,
    colors.secondary,
    "#C8A98B",
    "#8B5A2B",
    "#A68A76",
  ];

  return (
    <div className="dashboard-content animate-fade-in">
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeftColor: colors.primary }}>
          <span className="kpi-label">TOTAL PENDAPATAN</span>
          <span className="kpi-value primary-color">
            {formatIDR(totalRevenue)}
          </span>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: colors.green }}>
          <span className="kpi-label">TOTAL TERJUAL</span>
          <span className="kpi-value" style={{ color: colors.green }}>
            {formatNilai(totalSold)} Item
          </span>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: colors.red }}>
          <span className="kpi-label">TOTAL WASTE (RUGI)</span>
          <span className="kpi-value" style={{ color: colors.red }}>
            {formatNilai(totalWaste)} Unit
          </span>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: colors.secondary }}>
          <span className="kpi-label">
            {sortOrder === "desc" ? "KATEGORI TERLARIS" : "KATEGORI TERENDAH"}
          </span>
          <span
            className="kpi-value"
            style={{ color: colors.secondary, fontSize: "18px" }}
          >
            {topCategory}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "25px",
          marginBottom: "25px",
        }}
      >
        <div
          className="dashboard-card"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div className="card-header">
            <h3 className="card-title">Tren Pendapatan (Harian)</h3>
          </div>
          <div
            className="chart-wrapper"
            style={{ flexGrow: 1, minHeight: "340px" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={lineChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <defs>
                  <linearGradient
                    id="colorPendapatan"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={colors.primary}
                      stopOpacity={0.6}
                    />
                    <stop
                      offset="95%"
                      stopColor={colors.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={colors.border}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: colors.secondary, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: colors.secondary, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  formatter={(value) => formatIDR(value)}
                  labelFormatter={(label) => `Tanggal: ${label}`}
                  contentStyle={{
                    backgroundColor: "var(--glass-bg-heavy)",
                    border: `1px solid var(--border-glass)`,
                    borderRadius: "8px",
                    color: "var(--text-main)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pendapatan"
                  stroke={colors.primary}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPendapatan)"
                  activeDot={{ r: 6, fill: colors.primary }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className="dashboard-card"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div
            className="card-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 className="card-title">Pendapatan Kategori</h3>
            <button
              className="page-btn"
              onClick={() => setTab("3d-pie")}
              style={{
                padding: "6px 12px",
                fontSize: "11px",
                background: colors.secondary,
                color: "#fff",
              }}
            >
              Lihat Studio 3D
            </button>
          </div>
          <div
            className="chart-wrapper"
            style={{
              flexGrow: 1,
              minHeight: "340px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="40%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value) => formatIDR(value)}
                  contentStyle={{
                    backgroundColor: "var(--glass-bg-heavy)",
                    borderRadius: "8px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={45}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "var(--text-main)",
                    paddingTop: "15px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-card" style={{ marginBottom: "25px" }}>
        <div
          className="card-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 className="card-title">5 Produk Tersukses</h3>
          <button
            className="page-btn"
            onClick={() => setTab("3d-bar")}
            style={{
              padding: "6px 12px",
              fontSize: "11px",
              background: colors.primary,
              color: "#fff",
            }}
          >
            Lihat Studio 3D
          </button>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={barChartData}
              layout="vertical"
              margin={{ top: 10, right: 80, left: 10, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke={colors.border}
              />
              <XAxis type="number" hide domain={[0, "dataMax * 1.2"]} />
              <YAxis dataKey="name" type="category" hide />
              <RechartsTooltip
                cursor={{ fill: "var(--table-hover)" }}
                formatter={(value) => [formatIDR(value), "Pendapatan"]}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0)
                    return `Kategori: ${payload[0].payload.category}`;
                  return label;
                }}
                contentStyle={{
                  backgroundColor: "var(--glass-bg-heavy)",
                  border: `1px solid var(--border-glass)`,
                  borderRadius: "8px",
                  color: "var(--text-main)",
                }}
              />
              <Bar
                dataKey="pendapatan"
                fill={colors.primary}
                barSize={35}
                radius={[0, 4, 4, 0]}
              >
                <LabelList
                  dataKey="name"
                  position="insideLeft"
                  style={{
                    fill: "var(--bg-base)",
                    fontSize: 12,
                    fontWeight: "bold",
                    paddingLeft: "10px",
                  }}
                />
                <LabelList
                  dataKey="pendapatan"
                  position="right"
                  style={{
                    fill: "var(--text-main)",
                    fontSize: 13,
                    fontWeight: "bold",
                  }}
                  formatter={(val) => formatIDR(val)}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const SortIcon = ({ direction }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      marginLeft: "6px",
      display: "inline-block",
      verticalAlign: "middle",
      transition: "transform 0.2s",
      transform: direction === "desc" ? "rotate(180deg)" : "none",
    }}
  >
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

function DataTableView({ data, colors, playUISound }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [data, sortConfig]);

  const handleSort = (key) => {
    playUISound("click");
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) {
      playUISound("click");
      setCurrentPage(currentPage + 1);
    }
  };
  const handlePrev = () => {
    if (currentPage > 1) {
      playUISound("click");
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="dashboard-content animate-fade-in">
      <div
        className="dashboard-card"
        style={{ padding: 0, overflow: "hidden" }}
      >
        <div style={{ width: "100%", overflowX: "auto", minHeight: "400px" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "12%" }}>Tanggal</th>
                <th style={{ width: "23%" }}>Nama Produk</th>
                <th style={{ width: "15%" }}>Kategori</th>
                <th
                  style={{
                    width: "12%",
                    cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                  onClick={() => handleSort("price")}
                  onMouseEnter={(e) => (e.target.style.color = colors.primary)}
                  onMouseLeave={(e) =>
                    (e.target.style.color = "var(--text-muted)")
                  }
                >
                  Harga Base{" "}
                  {sortConfig.key === "price" && (
                    <SortIcon direction={sortConfig.direction} />
                  )}
                </th>
                <th
                  style={{
                    width: "11%",
                    color: colors.green,
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                  onClick={() => handleSort("sold")}
                  onMouseEnter={(e) => (e.target.style.opacity = 0.7)}
                  onMouseLeave={(e) => (e.target.style.opacity = 1)}
                >
                  Terjual{" "}
                  {sortConfig.key === "sold" && (
                    <SortIcon direction={sortConfig.direction} />
                  )}
                </th>
                <th
                  style={{
                    width: "13%",
                    color: colors.red,
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                  onClick={() => handleSort("waste")}
                  onMouseEnter={(e) => (e.target.style.opacity = 0.7)}
                  onMouseLeave={(e) => (e.target.style.opacity = 1)}
                >
                  Waste (Rugi){" "}
                  {sortConfig.key === "waste" && (
                    <SortIcon direction={sortConfig.direction} />
                  )}
                </th>
                <th
                  style={{
                    width: "14%",
                    color: colors.primary,
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                  onClick={() => handleSort("revenue")}
                  onMouseEnter={(e) => (e.target.style.opacity = 0.7)}
                  onMouseLeave={(e) => (e.target.style.opacity = 1)}
                >
                  Pendapatan{" "}
                  {sortConfig.key === "revenue" && (
                    <SortIcon direction={sortConfig.direction} />
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "30px" }}
                  >
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                currentItems.map((item, idx) => {
                  const isWasteHigh = item.waste > item.sold;
                  return (
                    <tr key={`${item.invId}-${idx}`}>
                      <td>{item.formattedDate}</td>
                      <td style={{ fontWeight: "bold" }}>{item.productName}</td>
                      <td>{item.category}</td>
                      <td>$ {item.price}</td>
                      <td style={{ color: colors.green, fontWeight: "bold" }}>
                        {item.sold}
                      </td>
                      <td style={{ color: colors.red, fontWeight: "bold" }}>
                        {item.waste}{" "}
                        {isWasteHigh && (
                          <span
                            style={{
                              fontSize: "10px",
                              marginLeft: "5px",
                              background: colors.red,
                              color: "#fff",
                              padding: "2px 4px",
                              borderRadius: "4px",
                            }}
                          >
                            KRITIS
                          </span>
                        )}
                      </td>
                      <td style={{ color: colors.primary, fontWeight: "bold" }}>
                        {formatIDR(item.revenue)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {data.length > 0 && (
          <div className="table-footer">
            <div className="pagination-info">
              Menampilkan {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, sortedData.length)} dari total{" "}
              {sortedData.length} data
            </div>
            <div className="pagination-controls">
              <button
                className="page-btn"
                onClick={handlePrev}
                disabled={currentPage === 1}
                onMouseEnter={() => {
                  if (currentPage !== 1) playUISound("hover");
                }}
              >
                ◀ Sebelumnya
              </button>
              <button
                className="page-btn"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                onMouseEnter={() => {
                  if (currentPage !== totalPages) playUISound("hover");
                }}
              >
                Selanjutnya ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FloatingAIChatAssistant({
  data,
  playUISound,
  isOpen,
  toggleChat,
  activeTab,
  categoryFilter,
  startDate,
  endDate,
}) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Halo! Saya Davis AI. Saya siap membantu menganalisis dasbor ini. Ketik sesuatu untuk mulai!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const messagesEndRef = useRef(null);

  const askRealGemini = async (userQuery) => {
    try {
      if (!data || data.length === 0)
        return "Data saat ini kosong untuk filter yang dipilih.";

      const totalRev = data.reduce((sum, d) => sum + d.revenue, 0);
      const totalSold = data.reduce((sum, d) => sum + d.sold, 0);
      const totalWaste = data.reduce((sum, d) => sum + d.waste, 0);

      const productMap = {};
      data.forEach((d) => {
        productMap[d.productName] =
          (productMap[d.productName] || 0) + d.revenue;
      });
      const topProducts = Object.keys(productMap)
        .sort((a, b) => productMap[b] - productMap[a])
        .slice(0, 3)
        .join(", ");

      let tabName = "Dasbor";
      if (activeTab === "overview")
        tabName = "Ringkasan Dasbor (Grafik Garis & KPI)";
      if (activeTab === "table") tabName = "Tabel Transaksi Mentah";
      if (activeTab === "3d-bar") tabName = "Studio 3D: Bar Chart Top Produk";
      if (activeTab === "3d-pie") tabName = "Studio 3D: Pie Chart Kategori";

      const filterKategori =
        categoryFilter === "ALL" ? "Semua Kategori" : categoryFilter;
      const filterTanggal =
        startDate && endDate ? `${startDate} sampai ${endDate}` : "Semua Waktu";

      const promptContext = `
        Kamu adalah Davis AI, asisten analis data yang interaktif, ramah, dan proaktif untuk Davis Cafe.
        Gunakan gaya bahasa Indonesia yang kasual-profesional (gunakan kata "Anda" dan "Saya").

        KONTEKS LAYAR PENGGUNA SAAT INI:
        - Sedang melihat halaman: **${tabName}**
        - Filter Data Aktif: Kategori **${filterKategori}**, Tanggal: **${filterTanggal}**

        RINGKASAN DATA (Berdasarkan filter aktif):
        - Total Pendapatan: $${totalRev.toLocaleString("en-US")}
        - Total Barang Terjual: ${totalSold} item
        - Total Waste (Rugi/Terbuang): ${totalWaste} item
        - Top 3 Produk: ${topProducts}
        
        PERTANYAAN PENGGUNA:
        "${userQuery}"
        
        PANDUAN MENJAWAB (SANGAT PENTING):
        1. Jika pengguna hanya menyapa (halo, hai, tes, p), JANGAN merangkum seluruh data! Balas saja sapaannya dengan ramah, sebutkan halaman apa yang sedang ia lihat (${tabName}), dan tawarkan bantuan analisis.
        2. Jika pengguna meminta analisis/tanya data, berikan insight yang nyambung dengan filter/layar yang sedang ia lihat.
        3. Hindari memuntahkan angka mentah secara kaku. Buat menjadi narasi (contoh: "Wah, pendapatan kita dari ${filterKategori} mencapai...").
        4. Gunakan emoji secukupnya agar tidak kaku.
      `;

      const result = await model.generateContent(promptContext);
      return result.response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Waduh, sepertinya saya kesulitan menghubungi server Google. Coba lagi dalam beberapa detik ya!";
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    playUISound("click");
    const userMsg = input;
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    const reply = await askRealGemini(userMsg);

    playUISound("alert");
    setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    setIsTyping(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="floating-chat-container">
      {isOpen && (
        <div className="floating-chat-window">
          <div className="floating-chat-header">
            <span>Davis AI Analytics</span>
            <button className="floating-close-btn" onClick={toggleChat}>
              ✕
            </button>
          </div>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-bubble ${m.sender === "user" ? "chat-user" : "chat-ai"}`}
              >
                <small
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    opacity: 0.7,
                  }}
                >
                  {m.sender === "user" ? "Anda" : "Davis AI"}
                </small>
                {m.text.split("\n").map((line, idx) => (
                  <span key={idx}>
                    {line
                      .split("**")
                      .map((part, index) =>
                        index % 2 === 1 ? (
                          <strong key={index}>{part}</strong>
                        ) : (
                          part
                        ),
                      )}{" "}
                    <br />
                  </span>
                ))}
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble chat-ai">
                <em>Menganalisis layar dan data...</em>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              placeholder="Tanya insight data..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" className="chat-send-btn" disabled={isTyping}>
              KIRIM
            </button>
          </form>
        </div>
      )}

      <button
        className={`chat-toggle-btn ${isOpen ? "is-open" : ""}`}
        onClick={toggleChat}
        onMouseEnter={() => {
          playUISound("hover");
          setIsHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundImage: isOpen
            ? "none"
            : `url(${isHovered ? "/mascot-excite.png" : "/mascot-body.png"})`,
          backgroundColor: isOpen ? "var(--primary)" : "transparent",
          width: isOpen ? "75px" : "100px",
          height: isOpen ? "75px" : "100px",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          border: "none",
          backgroundPosition: "center center",
        }}
      >
        {isOpen ? "✕" : ""}
      </button>
    </div>
  );
}

function ProductManager({ rawProducts, colors }) {
  const productList = Object.keys(rawProducts || {}).map((k) => ({
    id: k,
    ...rawProducts[k],
  }));
  return (
    <div className="dashboard-content animate-fade-in">
      <div
        className="header-section"
        style={{ borderBottom: "none", paddingBottom: "0" }}
      >
        <h1 className="main-title">MASTER DATA PRODUK</h1>
      </div>
      <div className="dashboard-card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "15%" }}>ID Produk</th>
              <th style={{ width: "35%" }}>Nama Produk</th>
              <th style={{ width: "15%" }}>Tipe Bean</th>
              <th style={{ width: "20%" }}>Kategori</th>
              <th style={{ width: "15%" }}>Harga Base</th>
            </tr>
          </thead>
          <tbody>
            {productList.map((p, i) => (
              <tr key={i}>
                <td style={{ color: colors.primary, fontWeight: "bold" }}>
                  PRD-{p.id}
                </td>
                <td style={{ fontWeight: "bold" }}>{p.name}</td>
                <td>{p.type}</td>
                <td>{p.category}</td>
                <td style={{ fontWeight: "bold" }}>$ {p.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExportCenter({ data, addLog, playUISound, colors }) {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalSold = data.reduce((sum, item) => sum + item.sold, 0);
  const totalWaste = data.reduce((sum, item) => sum + item.waste, 0);

  const exportToExcel = () => {
    playUISound("click");
    const wb = utils.book_new();
    utils.book_append_sheet(
      wb,
      utils.json_to_sheet(
        data.map((d) => ({
          Tanggal: d.formattedDate,
          Produk: d.productName,
          Revenue: d.revenue,
        })),
      ),
      "Data",
    );
    writeFile(wb, "Laporan_Davis_Cafe.xlsx");
    addLog("EXPORT", "Ekspor Excel", "Pengguna mengunduh laporan.");
  };

  return (
    <div className="dashboard-content animate-fade-in print-container">
      <div
        className="header-section no-print"
        style={{ borderBottom: "none", paddingBottom: "0" }}
      >
        <h1 className="main-title">CETAK LAPORAN</h1>
      </div>
      <div
        className="print-summary-box"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border-glass)",
          borderRadius: "16px",
          padding: "30px",
          marginBottom: "30px",
          color: "var(--text-main)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            borderBottom: `2px solid ${colors.primary}`,
            paddingBottom: "15px",
          }}
        >
          <h2 style={{ margin: "0 0 10px 0", fontSize: "28px" }}>DAVIS CAFE</h2>
          <h3
            style={{
              margin: "0",
              color: "var(--text-muted)",
              fontSize: "16px",
            }}
          >
            Laporan Ringkasan Performa Penjualan
          </h3>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "20px",
            textAlign: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                fontWeight: "bold",
                textTransform: "uppercase",
                marginBottom: "5px",
              }}
            >
              Total Pendapatan
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "900",
                color: colors.primary,
              }}
            >
              {formatIDR(totalRevenue)}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                fontWeight: "bold",
                textTransform: "uppercase",
                marginBottom: "5px",
              }}
            >
              Barang Terjual
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "900",
                color: colors.green,
              }}
            >
              {totalSold} Item
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                fontWeight: "bold",
                textTransform: "uppercase",
                marginBottom: "5px",
              }}
            >
              Waste (Rugi)
            </div>
            <div
              style={{ fontSize: "24px", fontWeight: "900", color: colors.red }}
            >
              {totalWaste} Unit
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                fontWeight: "bold",
                textTransform: "uppercase",
                marginBottom: "5px",
              }}
            >
              Total Transaksi
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "900",
                color: colors.blue,
              }}
            >
              {data.length} Baris
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: "20px",
            paddingTop: "15px",
            borderTop: "1px dashed var(--border-solid)",
            fontSize: "12px",
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          *Laporan ini dicetak berdasarkan filter data yang aktif pada dasbor
          utama.
        </div>
      </div>
      <div
        className="no-print"
        style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}
      >
        <div
          className="dashboard-card"
          style={{
            flex: 1,
            minWidth: "200px",
            borderTop: `4px solid ${colors.primary}`,
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: "var(--text-main)",
              fontSize: "18px",
              marginTop: 0,
            }}
          >
            Cetak (PDF)
          </h2>
          <button
            onClick={() => {
              playUISound("click");
              window.print();
            }}
            className="action-btn"
            style={{
              background: "transparent",
              border: `2px solid ${colors.primary}`,
              color: colors.primary,
              width: "100%",
            }}
          >
            CETAK KE PDF
          </button>
        </div>
        <div
          className="dashboard-card"
          style={{
            flex: 1,
            minWidth: "200px",
            borderTop: `4px solid ${colors.green}`,
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: "var(--text-main)",
              fontSize: "18px",
              marginTop: 0,
            }}
          >
            Ekspor Excel
          </h2>
          <button
            onClick={exportToExcel}
            className="action-btn"
            style={{
              background: "transparent",
              border: `2px solid ${colors.green}`,
              color: colors.green,
              width: "100%",
            }}
          >
            UNDUH EXCEL
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryLog({ logs, playUISound, colors }) {
  const [typeFilter, setTypeFilter] = useState("ALL");
  const filteredLogs =
    typeFilter === "ALL" ? logs : logs.filter((l) => l.type === typeFilter);
  return (
    <div className="dashboard-content animate-fade-in">
      <div
        className="header-section"
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "none",
          paddingBottom: "0",
        }}
      >
        <h1 className="main-title">RIWAYAT SISTEM</h1>
        <select
          className="cyber-select"
          style={{ width: "200px" }}
          value={typeFilter}
          onChange={(e) => {
            playUISound("click");
            setTypeFilter(e.target.value);
          }}
        >
          <option value="ALL">Semua Aktivitas</option>
          <option value="LOGIN">Sesi Login</option>
          <option value="EXPORT">Aktivitas Cetak</option>
        </select>
      </div>
      <div
        className="dashboard-card"
        style={{ padding: 0, overflow: "hidden" }}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "20%" }}>Waktu</th>
              <th style={{ width: "15%" }}>Tipe</th>
              <th style={{ width: "20%" }}>Aktivitas</th>
              <th style={{ width: "30%" }}>Deskripsi</th>
              <th style={{ width: "15%" }}>Otorisasi</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => {
              let badgeColor = colors.primary;
              if (log.type === "LOGIN" || log.type === "LOGOUT")
                badgeColor = colors.blue;
              if (log.type === "EXPORT") badgeColor = colors.green;
              return (
                <tr key={log.id}>
                  <td>{new Date(log.timestamp).toLocaleString("id-ID")}</td>
                  <td>
                    <span
                      style={{
                        background: `${badgeColor}22`,
                        color: badgeColor,
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      {log.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: "bold" }}>{log.action}</td>
                  <td>{log.description}</td>
                  <td style={{ color: colors.primary, fontWeight: "bold" }}>
                    {log.user.toUpperCase()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==============================================================================
// 6. ADVANCED 3D VIEWS (MENGGUNAKAN NATIVE MESH PHYSICAL MATERIAL)
// ==============================================================================

function InteractiveNeonBar({
  item,
  index,
  maxRevenue,
  color,
  isDarkMode,
  setTooltip,
}) {
  const [hovered, setHover] = useState(false);
  const meshRef = useRef();
  const lightRef = useRef();

  const targetHeight = Math.max((item.revenue / maxRevenue) * 6, 0.1);
  const targetXPos = (index - 2.5) * 2;

  useFrame(() => {
    if (meshRef.current) {
      const targetScaleY = targetHeight * (hovered ? 1.05 : 1);
      meshRef.current.scale.y = THREE.MathUtils.lerp(
        meshRef.current.scale.y,
        targetScaleY,
        0.1,
      );
      meshRef.current.position.y = meshRef.current.scale.y / 2;

      if (lightRef.current) {
        lightRef.current.position.y = meshRef.current.position.y;
        const baseIntensity = hovered ? 10 : 3;
        lightRef.current.intensity = THREE.MathUtils.lerp(
          lightRef.current.intensity,
          baseIntensity,
          0.1,
        );
      }
    }
  });

  return (
    <group position={[targetXPos, 0, 0]}>
      <pointLight
        ref={lightRef}
        color={color}
        intensity={3}
        distance={6}
        decay={2}
      />
      <mesh
        ref={meshRef}
        scale={[1, 0.01, 1]} // OPTIMASI SCALE
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
          setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            item,
            color,
          });
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "default";
          setTooltip({ visible: false, x: 0, y: 0, item: null, color: "" });
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          transmission={1}
          transparent={true}
          opacity={1}
          roughness={0.3}
          ior={1.5}
          thickness={2}
          color="#ffffff"
          attenuationColor={color}
          attenuationDistance={2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive={color}
          emissiveIntensity={isDarkMode ? 0.2 : 0.05}
        />
      </mesh>
    </group>
  );
}

function Advanced3DBarView({ data, isDarkMode, colors, sortOrder }) {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    item: null,
    color: "",
  });
  const productMap = {};
  data.forEach((d) => {
    if (!productMap[d.productName])
      productMap[d.productName] = {
        revenue: 0,
        sold: 0,
        waste: 0,
        category: d.category,
      };
    productMap[d.productName].revenue += d.revenue;
    productMap[d.productName].sold += d.sold;
    productMap[d.productName].waste += d.waste;
  });

  const topData = Object.keys(productMap)
    .map((name) => ({ name, ...productMap[name] }))
    .sort((a, b) =>
      sortOrder === "desc" ? b.revenue - a.revenue : a.revenue - b.revenue,
    )
    .slice(0, 5);
  const maxRevenue = Math.max(...topData.map((d) => d.revenue), 1);

  const bgCanvas = isDarkMode ? "#0B0C10" : colors.bgLight;
  const gridColor = isDarkMode ? "#1F2833" : colors.border;
  const BAR_COLORS = isDarkMode
    ? ["#4D4DFF", "#9D4DFF", "#FF4DF0", "#FF2A2A", "#FF8C00"]
    : [colors.primary, colors.secondary, colors.green, colors.blue, "#C8A98B"];
  const hudBg = isDarkMode
    ? "rgba(11, 12, 16, 0.85)"
    : "rgba(255, 255, 255, 0.85)";
  const hudBorder = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const hudText = isDarkMode ? "#ffffff" : colors.dark;
  const hudSubtitle = isDarkMode ? "#8a8a8a" : colors.secondary;
  const totalTopRevenue = topData.reduce((sum, item) => sum + item.revenue, 0);
  const totalTopSold = topData.reduce((sum, item) => sum + item.sold, 0);
  const totalTopWaste = topData.reduce((sum, item) => sum + item.waste, 0);

  return (
    <div
      className="dashboard-content animate-fade-in"
      style={{
        height: "65vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {tooltip.visible && tooltip.item && (
        <div
          style={{
            position: "fixed",
            top: tooltip.y - 130,
            left: tooltip.x + 20,
            zIndex: 9999,
            background: hudBg,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: `1px solid ${hudBorder}`,
            padding: "15px 20px",
            borderRadius: "16px",
            color: hudText,
            width: "180px",
            boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: tooltip.color,
              fontWeight: "bold",
              textTransform: "uppercase",
              marginBottom: "5px",
              letterSpacing: "1px",
            }}
          >
            {tooltip.item.category || "Produk"}
          </div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              marginBottom: "12px",
              fontFamily: "monospace",
            }}
          >
            {formatIDR(tooltip.item.revenue)}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: `1px solid ${hudBorder}`,
              paddingTop: "10px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "9px",
                  color: hudSubtitle,
                  letterSpacing: "0.5px",
                }}
              >
                TERJUAL
              </div>
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                {tooltip.item.sold || 0}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "9px",
                  color: hudSubtitle,
                  letterSpacing: "0.5px",
                }}
              >
                WASTE
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: isDarkMode ? "#FF4DF0" : colors.red,
                }}
              >
                {tooltip.item.waste || 0}
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          flexGrow: 1,
          background: bgCanvas,
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
          border: `1px solid ${gridColor}`,
        }}
      >
        <div
          className="studio-overlay-card"
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 10,
            background: hudBg,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${hudBorder}`,
            borderRadius: "16px",
            padding: "20px",
            color: hudText,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            width: "240px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: BAR_COLORS[0],
              letterSpacing: "1.5px",
              fontWeight: "bold",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            {sortOrder === "desc" ? "TOP 5 PRODUCTS" : "BOTTOM 5 PRODUCTS"}
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "900",
              fontFamily: "monospace",
              margin: "0 0 15px 0",
            }}
          >
            {formatIDR(totalTopRevenue)}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "10px",
                  color: hudSubtitle,
                  letterSpacing: "0.5px",
                  fontWeight: "bold",
                }}
              >
                TOTAL SOLD
              </span>
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                {totalTopSold}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: hudSubtitle,
                  letterSpacing: "0.5px",
                  fontWeight: "bold",
                }}
              >
                TOTAL WASTE
              </span>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: isDarkMode ? "#FF4DF0" : colors.red,
                }}
              >
                {totalTopWaste}
              </span>
            </div>
          </div>
          <div
            style={{
              marginTop: "15px",
              paddingTop: "15px",
              borderTop: `1px solid ${hudBorder}`,
              fontSize: "10px",
              color: hudSubtitle,
              textAlign: "center",
            }}
          >
            Hover over bars for details
          </div>
        </div>
        <div
          className="studio-overlay-legend"
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            right: "20px",
            zIndex: 10,
            background: hudBg,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${hudBorder}`,
            borderRadius: "12px",
            padding: "12px 20px",
            color: hudText,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {topData.map((item, index) => (
            <div
              key={item.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "4px",
                  background: BAR_COLORS[index % BAR_COLORS.length],
                  flexShrink: 0,
                }}
              ></div>
              <span style={{ whiteSpace: "nowrap" }}>{item.name}</span>
            </div>
          ))}
        </div>

        {/* OPTIMASI: Set DPR ke 1.5 max agar performa ringan */}
        <Canvas camera={{ position: [8, 6, 14], fov: 45 }} dpr={[1, 1.5]}>
          <color attach="background" args={[bgCanvas]} />

          <Suspense fallback={null}>
            <Environment preset={isDarkMode ? "night" : "city"} />
            <ambientLight intensity={isDarkMode ? 0.8 : 1.2} />
            <directionalLight
              position={[10, 15, 10]}
              intensity={isDarkMode ? 2.5 : 2}
            />
            <spotLight
              position={[-10, 10, -10]}
              angle={0.3}
              penumbra={1}
              intensity={2}
              color="#ffffff"
            />

            <group position={[0, -2, 0]}>
              <gridHelper args={[20, 20, gridColor, gridColor]} />
              {topData.map((item, index) => (
                <InteractiveNeonBar
                  /* OPTIMASI: Gunakan kombinasi nama, revenue, dan index sebagai key */
                  key={`bar-${item.name}-${item.revenue}-${index}`}
                  item={item}
                  index={index}
                  maxRevenue={maxRevenue}
                  color={BAR_COLORS[index % BAR_COLORS.length]}
                  isDarkMode={isDarkMode}
                  setTooltip={setTooltip}
                />
              ))}
            </group>

            {/* OPTIMASI: Resolusi shadow 128 dan frames 1 */}
            <ContactShadows
              position={[0, -2, 0]}
              opacity={isDarkMode ? 0.4 : 0.2}
              scale={20}
              blur={2}
              resolution={128}
              frames={1}
            />
            <Preload all />
          </Suspense>

          <OrbitControls
            makeDefault
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2.1}
          />
        </Canvas>
      </div>
    </div>
  );
}

function InteractivePieSlice({ slice, isDarkMode, setTooltip }) {
  const [hovered, setHover] = useState(false);
  const meshRef = useRef();
  const lightRef = useRef();

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const outerRadius = 4;
    const innerRadius = 2.2;
    const segments = 32;

    s.moveTo(
      Math.cos(slice.startAngle) * outerRadius,
      Math.sin(slice.startAngle) * outerRadius,
    );
    for (let j = 1; j <= segments; j++) {
      const a = slice.startAngle + (j / segments) * slice.angleLength;
      s.lineTo(Math.cos(a) * outerRadius, Math.sin(a) * outerRadius);
    }
    const endAngle = slice.startAngle + slice.angleLength;
    s.lineTo(
      Math.cos(endAngle) * innerRadius,
      Math.sin(endAngle) * innerRadius,
    );
    for (let j = segments - 1; j >= 0; j--) {
      const a = slice.startAngle + (j / segments) * slice.angleLength;
      s.lineTo(Math.cos(a) * innerRadius, Math.sin(a) * innerRadius);
    }
    return s;
  }, [slice.startAngle, slice.angleLength]);

  const extrudeSettings = useMemo(
    () => ({
      depth: 1,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.08,
      bevelSegments: 4,
    }),
    [],
  );
  const targetDepth = 0.4 + (slice.revenue / slice.maxRev) * 2;
  const midRadius = (2.2 + 4) / 2;
  const lightX = Math.cos(slice.midAngle) * midRadius;
  const lightZ = -Math.sin(slice.midAngle) * midRadius;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, targetDepth), 0.1);
      const pushOut = hovered ? 0.6 : 0;
      const targetX = Math.cos(slice.midAngle) * pushOut;
      const targetZ = -Math.sin(slice.midAngle) * pushOut;
      const targetY = hovered ? 0.8 : 0;
      meshRef.current.position.lerp(
        new THREE.Vector3(targetX, targetY, targetZ),
        0.1,
      );

      if (lightRef.current) {
        const lightTargetX = lightX + targetX;
        const lightTargetZ = lightZ + targetZ;
        const lightTargetY = targetDepth / 2 + targetY;
        lightRef.current.position.lerp(
          new THREE.Vector3(lightTargetX, lightTargetY, lightTargetZ),
          0.1,
        );
        const baseIntensity = hovered ? 12 : 5;
        lightRef.current.intensity = THREE.MathUtils.lerp(
          lightRef.current.intensity,
          baseIntensity,
          0.1,
        );
      }
    }
  });

  return (
    <group>
      <pointLight
        ref={lightRef}
        color={slice.color}
        intensity={5}
        distance={6}
        decay={2}
      />
      <mesh
        ref={meshRef}
        scale={[0.01, 0.01, 0.01]} // OPTIMASI SCALE
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
          setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            item: slice,
            color: slice.color,
          });
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "default";
          setTooltip({ visible: false, x: 0, y: 0, item: null, color: "" });
        }}
      >
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshPhysicalMaterial
          transmission={1}
          transparent={true}
          opacity={1}
          roughness={0.3}
          ior={1.5}
          thickness={2}
          color="#ffffff"
          attenuationColor={slice.color}
          attenuationDistance={2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive={slice.color}
          emissiveIntensity={isDarkMode ? 0.3 : 0.05}
        />
      </mesh>
    </group>
  );
}

function Advanced3DPieView({ data, isDarkMode, colors, sortOrder }) {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    item: null,
    color: "",
  });
  const catSales = {};

  data.forEach((d) => {
    if (!catSales[d.category])
      catSales[d.category] = { revenue: 0, sold: 0, waste: 0 };
    catSales[d.category].revenue += d.revenue;
    catSales[d.category].sold += d.sold;
    catSales[d.category].waste += d.waste;
  });

  const sortedCats = Object.keys(catSales)
    .sort((a, b) =>
      sortOrder === "desc"
        ? catSales[b].revenue - catSales[a].revenue
        : catSales[a].revenue - catSales[b].revenue,
    )
    .slice(0, 5);
  const pieData = sortedCats.map((cat) => ({ name: cat, ...catSales[cat] }));
  const displayTotalRev = pieData.reduce((sum, d) => sum + d.revenue, 0);
  const displayTotalSold = pieData.reduce((sum, d) => sum + d.sold, 0);
  const displayTotalWaste = pieData.reduce((sum, d) => sum + d.waste, 0);
  const maxRev = Math.max(...pieData.map((d) => d.revenue), 1);

  const bgCanvas = isDarkMode ? "#0B0C10" : colors.bgLight;
  const gridColor = isDarkMode ? "#1F2833" : colors.border;
  const PIE_COLORS = isDarkMode
    ? ["#4D4DFF", "#9D4DFF", "#FF4DF0", "#FF2A2A", "#FF8C00"]
    : [colors.primary, colors.secondary, colors.green, colors.blue, "#C8A98B"];
  const hudBg = isDarkMode
    ? "rgba(11, 12, 16, 0.85)"
    : "rgba(255, 255, 255, 0.85)";
  const hudBorder = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const hudText = isDarkMode ? "#ffffff" : colors.dark;
  const hudSubtitle = isDarkMode ? "#8a8a8a" : colors.secondary;

  let startAngle = 0;
  const slices = pieData.map((d, i) => {
    const angleLength = (d.revenue / displayTotalRev) * Math.PI * 2;
    const sAngle = startAngle;
    startAngle += angleLength;
    return {
      ...d,
      startAngle: sAngle,
      angleLength,
      midAngle: sAngle + angleLength / 2,
      total: displayTotalRev,
      maxRev,
      color: PIE_COLORS[i % PIE_COLORS.length],
    };
  });

  return (
    <div
      className="dashboard-content animate-fade-in"
      style={{
        height: "65vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {tooltip.visible && tooltip.item && (
        <div
          style={{
            position: "fixed",
            top: tooltip.y - 130,
            left: tooltip.x + 20,
            zIndex: 9999,
            background: hudBg,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: `1px solid ${hudBorder}`,
            padding: "15px 20px",
            borderRadius: "16px",
            color: hudText,
            width: "180px",
            boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: tooltip.color,
              fontWeight: "bold",
              textTransform: "uppercase",
              marginBottom: "5px",
              letterSpacing: "1px",
            }}
          >
            {tooltip.item.name} (
            {((tooltip.item.revenue / tooltip.item.total) * 100).toFixed(1)}%)
          </div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              marginBottom: "12px",
              fontFamily: "monospace",
            }}
          >
            {formatIDR(tooltip.item.revenue)}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: `1px solid ${hudBorder}`,
              paddingTop: "10px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "9px",
                  color: hudSubtitle,
                  letterSpacing: "0.5px",
                }}
              >
                TERJUAL
              </div>
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                {tooltip.item.sold || 0}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "9px",
                  color: hudSubtitle,
                  letterSpacing: "0.5px",
                }}
              >
                WASTE
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: isDarkMode ? "#FF4DF0" : colors.red,
                }}
              >
                {tooltip.item.waste || 0}
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          flexGrow: 1,
          background: bgCanvas,
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
          border: `1px solid ${gridColor}`,
        }}
      >
        <div
          className="studio-overlay-card"
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 10,
            background: hudBg,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${hudBorder}`,
            borderRadius: "16px",
            padding: "20px",
            color: hudText,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            width: "240px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: PIE_COLORS[0],
              letterSpacing: "1.5px",
              fontWeight: "bold",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            CATEGORY REVENUE
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "900",
              fontFamily: "monospace",
              margin: "0 0 15px 0",
            }}
          >
            {formatIDR(displayTotalRev)}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "10px",
                  color: hudSubtitle,
                  letterSpacing: "0.5px",
                  fontWeight: "bold",
                }}
              >
                TOTAL SOLD
              </span>
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                {displayTotalSold}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: hudSubtitle,
                  letterSpacing: "0.5px",
                  fontWeight: "bold",
                }}
              >
                TOTAL WASTE
              </span>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: isDarkMode ? "#FF4DF0" : colors.red,
                }}
              >
                {displayTotalWaste}
              </span>
            </div>
          </div>
          <div
            style={{
              marginTop: "15px",
              paddingTop: "15px",
              borderTop: `1px solid ${hudBorder}`,
              fontSize: "10px",
              color: hudSubtitle,
              textAlign: "center",
            }}
          >
            Hover over slices for details
          </div>
        </div>
        <div
          className="studio-overlay-legend"
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            right: "20px",
            zIndex: 10,
            background: hudBg,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${hudBorder}`,
            borderRadius: "12px",
            padding: "12px 20px",
            color: hudText,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {pieData.map((item, index) => (
            <div
              key={item.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "4px",
                  background: PIE_COLORS[index % PIE_COLORS.length],
                  flexShrink: 0,
                }}
              ></div>
              <span style={{ whiteSpace: "nowrap" }}>{item.name}</span>
            </div>
          ))}
        </div>

        {/* OPTIMASI: Set DPR ke 1.5 max agar performa ringan */}
        <Canvas camera={{ position: [0, 8, 12], fov: 45 }} dpr={[1, 1.5]}>
          <color attach="background" args={[bgCanvas]} />

          <Suspense fallback={null}>
            <Environment preset={isDarkMode ? "night" : "city"} />
            <ambientLight intensity={isDarkMode ? 0.8 : 1.2} />
            <directionalLight
              position={[10, 15, 10]}
              intensity={isDarkMode ? 2.5 : 2}
            />
            <spotLight
              position={[-10, 10, -10]}
              angle={0.3}
              penumbra={1}
              intensity={2}
              color="#ffffff"
            />
            <pointLight
              position={[5, -2, -5]}
              intensity={isDarkMode ? 3 : 1.5}
              color={PIE_COLORS[0]}
            />
            <pointLight
              position={[-5, -2, 5]}
              intensity={isDarkMode ? 3 : 1.5}
              color={PIE_COLORS[2]}
            />

            <group position={[0, -1, 0]}>
              {slices.map((slice, index) => (
                <InteractivePieSlice
                  /* OPTIMASI: Gunakan kombinasi nama, revenue, dan angle sebagai key */
                  key={`pie-${slice.name}-${slice.revenue}-${slice.startAngle}`}
                  slice={slice}
                  isDarkMode={isDarkMode}
                  setTooltip={setTooltip}
                />
              ))}
            </group>

            {/* OPTIMASI: Resolusi shadow 128 dan frames 1 */}
            <ContactShadows
              position={[0, -1.5, 0]}
              opacity={isDarkMode ? 0.4 : 0.2}
              scale={15}
              blur={2}
              resolution={128}
              frames={1}
            />
            <Preload all />
          </Suspense>

          <OrbitControls
            enableZoom={true}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2.5}
          />
        </Canvas>
      </div>
    </div>
  );
}
