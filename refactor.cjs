const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const pagesDir = path.join(srcDir, 'pages');
const componentsDir = path.join(srcDir, 'components');

if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });
if (!fs.existsSync(componentsDir)) fs.mkdirSync(componentsDir, { recursive: true });

let appJsx = fs.readFileSync(path.join(srcDir, 'App.jsx'), 'utf-8');
let appCss = fs.readFileSync(path.join(srcDir, 'App.css'), 'utf-8');

// --- 1. EXTRACT CSS ---
const extractCssBlock = (startMarker, endMarker) => {
    const startIndex = appCss.indexOf(startMarker);
    if (startIndex === -1) return '';
    const endIndex = endMarker ? appCss.indexOf(endMarker, startIndex) : appCss.length;
    return appCss.substring(startIndex, endIndex).trim();
};

const loginCss = extractCssBlock('/* --- NEW SPLIT LOGIN PAGE --- */', '/* --- THEME TOGGLE SWITCH --- */');
const mascotCss = extractCssBlock('/* --- MASKOT INTERAKTIF LOGIN --- */', '/* --- LOGIN FORM --- */');
const sidebarCss = extractCssBlock('/* --- SIDEBAR (DESKTOP) --- */', '/* --- CONTENT AREA & DASHBOARD ELEMENTS --- */');
const dashboardCss = extractCssBlock('/* --- CONTENT AREA & DASHBOARD ELEMENTS --- */', '/* --- TABLES & PAGINATION --- */');
const tableCss = extractCssBlock('/* --- TABLES & PAGINATION --- */', '/* --- FLOATING CHAT BOT --- */');
const chatCss = extractCssBlock('/* --- FLOATING CHAT BOT --- */', '/* --- HP KECIL KHUSUS --- */');
const responsiveCss = extractCssBlock('/* --- HP KECIL KHUSUS --- */', null); // end of file

// Write CSS files
fs.writeFileSync(path.join(pagesDir, 'Login.css'), loginCss + '\n\n' + mascotCss);
fs.writeFileSync(path.join(componentsDir, 'Sidebar.css'), sidebarCss);
fs.writeFileSync(path.join(pagesDir, 'Dashboard.css'), dashboardCss);
fs.writeFileSync(path.join(pagesDir, 'Table.css'), tableCss);
fs.writeFileSync(path.join(componentsDir, 'Chat.css'), chatCss);
fs.writeFileSync(path.join(srcDir, 'Responsive.css'), responsiveCss);

// Remove extracted blocks from App.css (keep base styles, theme toggle)
appCss = appCss.replace(loginCss, '');
appCss = appCss.replace(mascotCss, '');
appCss = appCss.replace(sidebarCss, '');
appCss = appCss.replace(dashboardCss, '');
appCss = appCss.replace(tableCss, '');
appCss = appCss.replace(chatCss, '');
appCss = appCss.replace(responsiveCss, '');

fs.writeFileSync(path.join(srcDir, 'App.css'), appCss);


// --- 2. EXTRACT JSX COMPONENTS ---
const extractComponent = (funcName, fullText) => {
    // Basic extraction assuming well-formatted "function Name(...) {" and closing "}" at top level
    const regex = new RegExp(`(function ${funcName}\\s*\\([^{]*\\)\\s*\\{)`);
    const match = fullText.match(regex);
    if (!match) return null;
    
    let startIndex = match.index;
    let braceCount = 0;
    let i = startIndex + match[1].length - 1; // start at the opening brace
    let endIndex = -1;
    
    for (; i < fullText.length; i++) {
        if (fullText[i] === '{') braceCount++;
        else if (fullText[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
                endIndex = i + 1;
                break;
            }
        }
    }
    
    if (endIndex !== -1) {
        return fullText.substring(startIndex, endIndex);
    }
    return null;
};

// Common imports for pages
const commonImports = `import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LabelList, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import { utils, writeFile } from "xlsx";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, ContactShadows, Html, Environment } from "@react-three/drei";
`;

const formatIDR = `const formatIDR = (value) => \`$ \${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}\`;\n`;
const formatNilai = `const formatNilai = (val) => new Intl.NumberFormat("en-US").format(val);\n`;

// Components to extract
const componentsToExtract = [
    { name: 'DashboardOverview', dir: pagesDir, css: './Dashboard.css', extra: formatIDR + formatNilai },
    { name: 'DataTableView', dir: pagesDir, css: './Table.css', extra: formatIDR + extractComponent('SortIcon', appJsx) }, // Wait, SortIcon is const
    { name: 'ProductManager', dir: pagesDir, css: '', extra: '' },
    { name: 'ExportCenter', dir: pagesDir, css: '', extra: formatIDR },
    { name: 'HistoryLog', dir: pagesDir, css: '', extra: '' },
    { name: 'Advanced3DBarView', dir: pagesDir, css: '', extra: formatIDR + extractComponent('InteractiveNeonBar', appJsx) },
    { name: 'Advanced3DPieView', dir: pagesDir, css: '', extra: formatIDR + extractComponent('InteractivePieSlice', appJsx) },
    { name: 'FloatingAIChatAssistant', dir: componentsDir, css: './Chat.css', extra: '' }, // We'll need to pass model/genAI if used inside? No, it's passed or defined. Wait, model is defined in App.jsx.
];

// Handle SortIcon (it's a const)
const sortIconRegex = /const SortIcon = \(\{\s*direction\s*\}\) => \([\s\S]*?\);\n/;
const sortIconMatch = appJsx.match(sortIconRegex);
const sortIconCode = sortIconMatch ? sortIconMatch[0] : '';
componentsToExtract.find(c => c.name === 'DataTableView').extra = formatIDR + sortIconCode;

let modifiedAppJsx = appJsx;
let importStatements = '';

for (const comp of componentsToExtract) {
    let compCode = extractComponent(comp.name, modifiedAppJsx);
    if (compCode) {
        // Write to file
        let fileContent = commonImports;
        if (comp.css) {
            fileContent += "import '" + comp.css + "';\n";
        }
        
        // Quick hack to fix `model` in FloatingAIChatAssistant: we will pass `model` as prop later or just import it. Let's just pass model as a prop for now, wait, no, the user wants simple.
        // Actually, let's keep genAI in App.jsx and export it, or just put it in a separate file.
        
        fileContent += "\n" + comp.extra + "\n";
        fileContent += "export default " + compCode + "\n";
        
        fs.writeFileSync(path.join(comp.dir, comp.name + ".jsx"), fileContent);
        
        // Remove from App.jsx
        modifiedAppJsx = modifiedAppJsx.replace(compCode, '');
        
        // Add import
        const relativePath = comp.dir === pagesDir ? "./pages/" + comp.name : "./components/" + comp.name;
        importStatements += "import " + comp.name + " from '" + relativePath + "';\n";
    }
}

// Remove InteractiveNeonBar, InteractivePieSlice, SortIcon from App.jsx as they were moved
if (sortIconCode) modifiedAppJsx = modifiedAppJsx.replace(sortIconCode, '');
const neonBarCode = extractComponent('InteractiveNeonBar', modifiedAppJsx);
if (neonBarCode) modifiedAppJsx = modifiedAppJsx.replace(neonBarCode, '');
const pieSliceCode = extractComponent('InteractivePieSlice', modifiedAppJsx);
if (pieSliceCode) modifiedAppJsx = modifiedAppJsx.replace(pieSliceCode, '');

// Also add CSS imports to App.jsx if needed, but App.jsx still imports './App.css'
importStatements += "import './Responsive.css';\n";
importStatements += "import './components/Sidebar.css';\n";
importStatements += "import './pages/Login.css';\n";

// Insert imports after the initial imports
modifiedAppJsx = modifiedAppJsx.replace('import "./App.css";', 'import "./App.css";\n' + importStatements);

fs.writeFileSync(path.join(srcDir, 'App.jsx'), modifiedAppJsx);

console.log("Refactoring complete!");
