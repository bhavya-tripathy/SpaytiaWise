import React, { useState, useEffect, createContext, useContext, useMemo, useRef } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- STYLES & FONTS ---
const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
        
        :root {
            --font-heading: 'Poppins', sans-serif;
            --font-body: 'Inter', sans-serif;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.1);
            border-radius: 10px;
        }
        .dark ::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.1);
        }
        
        .page-enter {
            opacity: 0;
            transform: translateY(20px);
        }
        .page-enter-active {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 300ms, transform 300ms;
        }
    `}</style>
);

// --- ICONS (Minimalist Line Icons) ---
const Logo = () => (
    <div className="flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#E57373] mr-2">
            {/* This SVG path creates a stylized 'S' shape, which combined with the W in the name forms the logo mark */}
            <path d="M22 10C22 6.68629 19.3137 4 16 4C12.6863 4 10 6.68629 10 10V13C10 14.6569 11.3431 16 13 16H16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 22C10 25.3137 12.6863 28 16 28C19.3137 28 22 25.3137 22 22V19C22 17.3431 20.6569 16 19 16H16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2 className="text-3xl font-bold font-heading text-[#4A4A4A] dark:text-[#E0E0E0]">SpaytiaWise</h2>
    </div>
);
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const SmsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03 8-9 8s9 3.582 9 8z" /></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m1-9l2.293-2.293a1 1 0 011.414 0l.707.707a1 1 0 010 1.414L11 14l-2 2-2-2 2.293-2.293a1 1 0 010-1.414l.707-.707a1 1 0 011.414 0L13 11m0 0l2 2 2-2m-2 2v-2m4 5l2.293-2.293a1 1 0 011.414 0l.707.707a1 1 0 010 1.414L19 18l-2 2-2-2 2.293-2.293a1 1 0 010-1.414l.707-.707a1 1 0 011.414 0L21 15m-2 2v-2m-4-5l-2-2-2 2m2 2l2-2" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;
const ChatBubbleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03 8-9 8s9 3.582 9 8z" /></svg>;
const PaperAirplaneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const GoogleIcon = () => <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.846 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;

// --- DUMMY DATA & API SERVICE ---
const categories = [ { id: 'cat1', name: 'Entertainment' }, { id: 'cat2', name: 'Work & Productivity' }, { id: 'cat3', name: 'Utilities' }, { id: 'cat4', name: 'Finance & Banking' }, { id: 'cat5', name: 'Health & Wellness' }, ];
let subscriptions = [
    // Today's Date: Aug 30, 2025
    { id: '1', name: 'Netflix Premium', category: 'Entertainment', price: 19.99, currency: 'USD', frequency: 'monthly', nextDueDate: '2025-09-10' },
    { id: '2', name: 'Spotify Family', category: 'Entertainment', price: 15.99, currency: 'USD', frequency: 'monthly', nextDueDate: '2025-09-15' },
    { id: '3', name: 'AWS Server', category: 'Work & Productivity', price: 75.00, currency: 'USD', frequency: 'monthly', nextDueDate: '2025-09-01' },
    { id: '4', name: 'Jio Fiber', category: 'Utilities', price: 999, currency: 'INR', frequency: 'monthly', nextDueDate: '2025-08-20' },
    { id: '5', name: 'Car Loan EMI', category: 'Finance & Banking', price: 250.00, currency: 'USD', frequency: 'monthly', nextDueDate: '2025-09-05', roi: 4.5 },
    { id: '6', name: 'Gym Membership', category: 'Health & Wellness', price: 40, currency: 'USD', frequency: 'monthly', nextDueDate: '2025-08-30' },
    { id: '7', name: 'Notion Plus', category: 'Work & Productivity', price: 8, currency: 'USD', frequency: 'monthly', nextDueDate: '2025-08-31' },
    { id: '8', name: 'Hotstar Premium', category: 'Entertainment', price: 1499, currency: 'INR', frequency: 'annually', nextDueDate: '2026-08-08' },
];
const smsFeed = [
    { id: 'sms1', date: '2025-08-28', merchant: 'Zomato', amount: 450, currency: 'INR'},
    { id: 'sms2', date: '2025-08-27', merchant: 'Uber', amount: 15.20, currency: 'USD'},
    { id: 'sms3', date: '2025-08-25', merchant: 'Swiggy Instamart', amount: 1200, currency: 'INR'},
];

const api = {
    getSubscriptions: async () => { await new Promise(res => setTimeout(res, 500)); return [...subscriptions]; },
    updateSubscription: async (sub) => { subscriptions = subscriptions.map(s => s.id === sub.id ? sub : s); return sub; },
    deleteSubscription: async (id) => { subscriptions = subscriptions.filter(sub => sub.id !== id); return { id }; },
    getSmsFeed: async () => { await new Promise(res => setTimeout(res, 200)); return [...smsFeed]; },
    getFinancialInsights: async (subs) => { await new Promise(res => setTimeout(res, 1500)); return `### Your AI Financial Snapshot:\n\nBased on your subscriptions, your **total monthly spend** is approximately **$398 USD** and **₹999 INR**.\n\n**💡 Key Insight:** Your 'Entertainment' category makes up about 10% of your monthly USD spending. While enjoyable, consider if you need both Netflix and Hotstar, as there might be overlapping content.\n\n**Actionable Advice:**\n* **Review Duplicates:** Check for content overlap between streaming services.\n* **Annual Plans:** For services you use long-term like AWS, switching to an annual plan could save you up to 15%.\n* **Loan Prepayment:** Your car loan has a 4.5% ROI (interest). Consider making small, extra payments to reduce the principal and save on total interest paid over the loan's lifetime.`; },
    getChatbotResponse: async (msg) => { await new Promise(res => setTimeout(res, 800)); return "I'm a demo chatbot! I can't answer that, but in a real app, I'd connect to an AI to give you helpful information about your subscriptions."; }
};

// --- HELPERS ---
const formatCurrency = (amount, currency) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
const today = new Date('2025-08-30T00:00:00');

// --- CONTEXT PROVIDERS ---
const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const signIn = (callback) => { setUser({ name: "Demo User" }); callback(); };
    const signOut = (callback) => { setUser(null); callback(); };
    return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>;
};
const useAuth = () => useContext(AuthContext);

const ThemeContext = createContext(null);
const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    useEffect(() => {
        document.documentElement.className = theme;
        document.documentElement.style.colorScheme = theme;
    }, [theme]);
    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};
const useTheme = () => useContext(ThemeContext);

const NotificationContext = createContext(null);
const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const addNotification = (message, type = 'info') => {
        setNotifications(prev => [...prev, { id: Date.now(), message, type }]);
    };
    return <NotificationContext.Provider value={{ notifications, addNotification }}>{children}</NotificationContext.Provider>;
};
const useNotification = () => useContext(NotificationContext);

// --- UI COMPONENTS ---
const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseClasses = "font-semibold py-2 px-5 rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#2a2a2a] flex items-center justify-center";
    const variantClasses = {
        primary: 'bg-[#FFDAB9] text-[#4A4A4A] hover:bg-[#E57373] hover:text-white focus:ring-[#E57373] shadow-md hover:shadow-lg hover:-translate-y-0.5',
        secondary: 'bg-[#FCFCFC] dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 text-[#4A4A4A] dark:text-[#E0E0E0] hover:bg-gray-100 dark:hover:bg-[#3a3a3a] focus:ring-gray-400',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    };
    return <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>{children}</button>;
};

const Card = ({ children, className = '', tilt = false }) => {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!tilt || !cardRef.current) return;
        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / (width/2);
        const y = (e.clientY - top - height / 2) / (height/2);
        cardRef.current.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale3d(1.05, 1.05, 1.05)`;
    };

    const handleMouseLeave = () => {
        if (!tilt || !cardRef.current) return;
        cardRef.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`bg-[#FCFCFC] dark:bg-[#2a2a2a] rounded-xl shadow-lg transition-all duration-300 p-6 ${className}`}
        >
            {children}
        </div>
    );
};

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#FCFCFC] dark:bg-[#2a2a2a] rounded-xl shadow-2xl p-6 w-full max-w-md m-4 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold font-heading text-[#4A4A4A] dark:text-[#E0E0E0]">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

// --- LAYOUT & MAIN FEATURE COMPONENTS ---

const Sidebar = () => {
    const navigate = useNavigate();
    const auth = useAuth();
    const handleLogout = () => auth.signOut(() => navigate("/"));
    
    const baseLink = "flex items-center px-4 py-2.5 mt-2 rounded-lg transition-colors duration-200 transform relative";
    const hoverEffect = "hover:bg-[#FFDAB9]/50 dark:hover:bg-[#E57373]/20 hover:text-[#4A4A4A] dark:hover:text-[#E0E0E0] group";
    const activeLink = "bg-[#FFDAB9] dark:bg-[#E57373]/30 text-[#4A4A4A] dark:text-white font-semibold";
    
    const NavItem = ({ to, icon, children }) => (
        <NavLink to={to} className={({ isActive }) => `${baseLink} ${hoverEffect} ${isActive ? activeLink : 'text-gray-500 dark:text-gray-400'}`}>
            {icon}
            <span className="mx-4 font-medium">{children}</span>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#E57373] transition-all duration-300 group-hover:w-1/2"></span>
        </NavLink>
    );

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen px-4 py-8 bg-[#FCFCFC] dark:bg-[#2a2a2a] border-r border-gray-200 dark:border-gray-700/50">
            <Logo />
            <nav className="flex-1 mt-10">
                <NavItem to="/app/dashboard" icon={<DashboardIcon />} >Dashboard</NavItem>
                <NavItem to="/app/manage" icon={<ListIcon />} >Manage</NavItem>
                <NavItem to="/app/reports" icon={<ChartBarIcon />} >Reports</NavItem>
                <NavItem to="/app/sms-feed" icon={<SmsIcon />} >SMS Feed</NavItem>
            </nav>
            <div>
                <button onClick={handleLogout} className={`${baseLink} ${hoverEffect} w-full text-gray-500 dark:text-gray-400`}>
                    <LogoutIcon />
                    <span className="mx-4 font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const { notifications } = useNotification();
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    
    return (
        <header className="sticky top-0 z-30 w-full px-6 py-3 bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-lg shadow-sm flex items-center justify-end space-x-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="relative">
                <button onClick={() => setIsNotifOpen(p => !p)} className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]">
                    <BellIcon />
                    {notifications.length > 0 && <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-[#E57373] rounded-full border-2 border-white/70 dark:border-[#1a1a1a]/70"></span>}
                </button>
                {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-[#FCFCFC] dark:bg-[#2a2a2a] rounded-lg shadow-xl overflow-hidden z-20 border border-gray-200 dark:border-gray-700">
                        <div className="p-3 font-semibold border-b dark:border-gray-700 text-[#4A4A4A] dark:text-[#E0E0E0]">Notifications</div>
                        <div className="divide-y dark:divide-gray-700 max-h-80 overflow-y-auto">
                            {notifications.length > 0 ? notifications.map(n => (
                                <div key={n.id} className="p-3 text-sm text-gray-600 dark:text-gray-300">{n.message}</div>
                            )) : <div className="p-4 text-sm text-gray-500">No new notifications</div>}
                        </div>
                    </div>
                )}
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]">{theme === 'light' ? <MoonIcon /> : <SunIcon />}</button>
        </header>
    );
};

const CalendarView = ({ subscriptions, onSubscriptionClick }) => {
    const [currentDate, setCurrentDate] = useState(today);
    
    const { startDay, daysInMonth, monthName, year } = useMemo(() => {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        return {
            startDay: startOfMonth.getDay(),
            daysInMonth: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(),
            monthName: currentDate.toLocaleString('default', { month: 'long' }),
            year: currentDate.getFullYear(),
        };
    }, [currentDate]);

    const subsByDate = useMemo(() => {
        const map = new Map();
        subscriptions.forEach(sub => {
            const subDate = new Date(sub.nextDueDate + 'T00:00:00');
            if (subDate.getUTCMonth() === currentDate.getMonth() && subDate.getUTCFullYear() === currentDate.getFullYear()) {
                const day = subDate.getUTCDate();
                if (!map.has(day)) map.set(day, []);
                map.get(day).push(sub);
            }
        });
        return map;
    }, [subscriptions, currentDate]);

    const changeMonth = (offset) => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50"><ChevronLeftIcon /></button>
                <h2 className="text-xl font-bold font-heading">{monthName} {year}</h2>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50"><ChevronRightIcon /></button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-400 dark:text-gray-500">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2 mt-2">
                {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="h-28 rounded-lg"></div>)}
                {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
                    const day = dayIndex + 1;
                    const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
                    return (
                        <div key={day} className={`h-28 border border-gray-200 dark:border-gray-700/50 rounded-lg p-1.5 overflow-y-auto flex flex-col ${isToday ? 'bg-[#FFDAB9]/30 dark:bg-[#E57373]/20' : ''}`}>
                            <span className={`font-semibold text-xs ${isToday ? 'text-[#E57373] dark:text-[#FFDAB9]' : 'text-gray-700 dark:text-gray-300'}`}>{day}</span>
                            <div className="space-y-1 mt-1">
                                {subsByDate.get(day)?.map(sub => (
                                    <button key={sub.id} onClick={() => onSubscriptionClick(sub)} className="w-full text-left text-xs bg-[#FFDAB9]/60 dark:bg-[#E57373]/40 p-1 rounded hover:opacity-80 truncate">
                                        {sub.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ sender: 'ai', text: "Hi! I'm SpaytiaWise AI. How can I help?" }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
    
    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;
        const userMessage = { sender: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        const aiResponse = await api.getChatbotResponse(newMessages);
        setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        setIsLoading(false);
    };

    return (
        <div className="fixed bottom-5 right-5 z-40">
            {isOpen ? (
                <div className="w-80 h-[28rem] bg-[#FCFCFC] dark:bg-[#2a2a2a] rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 animate-fade-in-up">
                    <header className="p-4 bg-[#FFDAB9] dark:bg-[#222] flex justify-between items-center rounded-t-2xl">
                        <h3 className="font-semibold font-heading text-[#4A4A4A] dark:text-[#E0E0E0]">SpaytiaWise AI</h3>
                        <button onClick={() => setIsOpen(false)} className="text-[#4A4A4A] dark:text-[#E0E0E0]"><XIcon /></button>
                    </header>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${msg.sender === 'user' ? 'bg-[#E57373] text-white rounded-br-none' : 'bg-gray-200 dark:bg-[#3a3a3a] text-[#4A4A4A] dark:text-[#E0E0E0] rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && <div className="flex justify-start"><div className="rounded-2xl px-3 py-2 bg-gray-200 dark:bg-[#3a3a3a]">...</div></div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-3 border-t dark:border-gray-700 flex items-center">
                        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask something..." className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#3a3a3a] border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-[#E57373]" />
                        <button onClick={handleSend} className="ml-2 text-white bg-[#E57373] p-2 rounded-full hover:opacity-90 disabled:opacity-50" disabled={isLoading}><PaperAirplaneIcon /></button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setIsOpen(true)} className="bg-[#E57373] text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-transform hover:scale-110">
                    <ChatBubbleIcon />
                </button>
            )}
        </div>
    );
};


// --- PAGES ---

const HomePage = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5DC] dark:bg-[#1a1a1a] text-center p-4">
            <div className="max-w-4xl">
                <h1 className="text-5xl md:text-6xl font-bold font-heading text-[#4A4A4A] dark:text-[#E0E0E0]">Master Your Subscriptions.</h1>
                <h2 className="text-5xl md:text-6xl font-bold font-heading text-[#E57373] mt-2">Effortlessly.</h2>
                <p className="mt-6 text-lg text-gray-500 dark:text-gray-400">SpaytiaWise is the calm, professional way to track your recurring expenses, find savings, and take control of your finances.</p>
                <div className="mt-10 grid md:grid-cols-3 gap-8 text-left">
                    <Card tilt><h3 className="font-bold text-lg font-heading mb-2">Visualize Your Spending</h3><p className="text-gray-500 dark:text-gray-400">See all your due dates on an interactive calendar. Never miss a payment again.</p></Card>
                    <Card tilt><h3 className="font-bold text-lg font-heading mb-2">AI-Powered Insights</h3><p className="text-gray-500 dark:text-gray-400">Let our smart assistant analyze your habits and find you actionable ways to save money.</p></Card>
                    <Card tilt><h3 className="font-bold text-lg font-heading mb-2">Manage with Ease</h3><p className="text-gray-500 dark:text-gray-400">Edit, update, and track your subscriptions in a simple, spreadsheet-like interface.</p></Card>
                </div>
                <Button className="mt-12 text-lg px-8 py-3" onClick={() => navigate('/login')}>Get Started</Button>
            </div>
        </div>
    );
};

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();
    const from = location.state?.from?.pathname || "/app/dashboard";

    const handleLogin = (e) => {
        e.preventDefault();
        auth.signIn(() => navigate(from, { replace: true }));
    };

    const Input = (props) => <input {...props} className="mt-1 block w-full px-4 py-2.5 bg-gray-100 dark:bg-[#2a2a2a] border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E57373] focus:border-transparent transition" />;

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F5F5DC] dark:bg-[#1a1a1a]">
            <Card className="w-full max-w-sm" tilt>
                <h1 className="text-2xl font-bold text-center font-heading">Welcome to SpaytiaWise</h1>
                <form onSubmit={handleLogin} className="space-y-6 mt-8">
                    <Input id="email" type="email" required placeholder="you@example.com" />
                    <Input id="password" type="password" required placeholder="••••••••" />
                    <Button type="submit" className="w-full">Sign In</Button>
                </form>
                <div className="flex items-center my-6"><hr className="flex-grow border-gray-200 dark:border-gray-600" /><span className="mx-4 text-xs text-gray-400">OR</span><hr className="flex-grow border-gray-200 dark:border-gray-600" /></div>
                <Button onClick={handleLogin} className="w-full" variant="secondary"><GoogleIcon /> Continue with Google</Button>
            </Card>
        </div>
    );
};

const DashboardPage = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const { addNotification } = useNotification();
    const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
    const [insightContent, setInsightContent] = useState('');
    const [isInsightLoading, setIsInsightLoading] = useState(false);

    useEffect(() => {
        api.getSubscriptions().then(setSubscriptions);
        const timer = setTimeout(() => {
            addNotification("Reminder: You have 2 bills due this week!");
        }, 1500);
        return () => clearTimeout(timer);
    }, [addNotification]);
    
    const handleGetInsights = async () => {
        setIsInsightModalOpen(true);
        setIsInsightLoading(true);
        const insights = await api.getFinancialInsights(subscriptions);
        setInsightContent(insights);
        setIsInsightLoading(false);
    };

    const totalMonthlyCostUSD = useMemo(() => subscriptions.filter(s => s.frequency === 'monthly' && s.currency === 'USD').reduce((a, s) => a + s.price, 0), [subscriptions]);
    const totalMonthlyCostINR = useMemo(() => subscriptions.filter(s => s.frequency === 'monthly' && s.currency === 'INR').reduce((a, s) => a + s.price, 0), [subscriptions]);
    const StatCard = ({ title, value }) => (<Card><h4 className="text-gray-500 dark:text-gray-400 font-medium">{title}</h4><p className="text-3xl font-bold font-heading mt-1">{value}</p></Card>);
    
    return (
        <div className="page-enter-active">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold font-heading">Dashboard</h1>
                <Button onClick={handleGetInsights} disabled={isInsightLoading}><SparklesIcon /> {isInsightLoading ? 'Analyzing...' : 'Get AI Insights'}</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Monthly Cost (USD)" value={formatCurrency(totalMonthlyCostUSD, 'USD')} />
                <StatCard title="Monthly Cost (INR)" value={formatCurrency(totalMonthlyCostINR, 'INR')} />
                <StatCard title="Active Subscriptions" value={subscriptions.length} />
            </div>
            <CalendarView subscriptions={subscriptions} onSubscriptionClick={(sub) => alert(`Viewing ${sub.name}`)} />
            <Modal isOpen={isInsightModalOpen} onClose={() => setIsInsightModalOpen(false)} title="✨ AI Financial Insights">
                {isInsightLoading ? <div className="text-center p-8">Loading...</div> : <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: insightContent.replace(/### (.*)/g, '<h3 class="font-bold text-lg mb-2">$1</h3>').replace(/\* (.*)/g, '<li class="ml-4 list-disc">$1</li>') }}></div>}
            </Modal>
        </div>
    );
};

const ManageSubscriptionsPage = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingRowId, setEditingRowId] = useState(null);
    const [editedData, setEditedData] = useState(null);
    const { addNotification } = useNotification();
    
    const refreshData = () => { setIsLoading(true); api.getSubscriptions().then(data => { setSubscriptions(data); setIsLoading(false); }); };
    useEffect(refreshData, []);

    const handleEdit = (sub) => { setEditingRowId(sub.id); setEditedData({ ...sub }); };
    const handleCancel = () => { setEditingRowId(null); setEditedData(null); };
    const handleSave = async () => { await api.updateSubscription(editedData); addNotification('Subscription updated!'); refreshData(); handleCancel(); };
    const handleDelete = async (id) => { if (window.confirm('Are you sure?')) { await api.deleteSubscription(id); addNotification('Subscription deleted!'); refreshData(); } };
    const handleEditChange = e => setEditedData(p => ({ ...p, [e.target.name]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value }));
    
    const inputClass = "w-full bg-gray-100/50 dark:bg-gray-700/50 p-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E57373]";
    const selectClass = inputClass + " appearance-none";
    
    return (
        <div className="page-enter-active">
            <h1 className="text-3xl font-bold font-heading mb-6">Manage Subscriptions</h1>
            <Card className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                        <tr>{['Name', 'Category', 'Price', 'Due Date', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                        {isLoading ? (<tr><td colSpan="5" className="text-center p-8">Loading...</td></tr>) : (
                            subscriptions.map(sub => (
                                <tr key={sub.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                    {editingRowId === sub.id ? (
                                        <>
                                            <td className="p-2"><input type="text" name="name" value={editedData.name} onChange={handleEditChange} className={inputClass} /></td>
                                            <td className="p-2">
                                                <select name="category" value={editedData.category} onChange={handleEditChange} className={selectClass}>
                                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-2 flex gap-1">
                                                <input type="number" name="price" value={editedData.price} onChange={handleEditChange} className={`${inputClass} w-24`} />
                                                <select name="currency" value={editedData.currency} onChange={handleEditChange} className={selectClass}>
                                                    <option>USD</option><option>INR</option><option>EUR</option>
                                                </select>
                                            </td>
                                            <td className="p-2"><input type="date" name="nextDueDate" value={editedData.nextDueDate} onChange={handleEditChange} className={inputClass} /></td>
                                            <td className="p-2 whitespace-nowrap"><div className="flex space-x-2"><button onClick={handleSave} className="text-green-500"><CheckIcon /></button><button onClick={handleCancel} className="text-red-500"><XIcon /></button></div></td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3 font-medium">{sub.name}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{sub.category}</td>
                                            <td className="px-4 py-3">{formatCurrency(sub.price, sub.currency)}</td>
                                            <td className="px-4 py-3">{sub.nextDueDate}</td>
                                            <td className="px-4 py-3"><div className="flex space-x-3"><button onClick={() => handleEdit(sub)} className="text-gray-400 hover:text-[#4A4A4A] dark:hover:text-white"><PencilIcon /></button><button onClick={() => handleDelete(sub.id)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button></div></td>
                                        </>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

const ReportsPage = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    useEffect(() => { api.getSubscriptions().then(setSubscriptions); }, []);

    const monthlyData = useMemo(() => { /* Complex date logic for charts */ return []; }, [subscriptions]); // Simplified for brevity
    const categoryData = useMemo(() => {
        const data = {};
        subscriptions.forEach(sub => {
            if (!data[sub.category]) data[sub.category] = 0;
            const priceInUSD = sub.currency === 'INR' ? sub.price / 83 : sub.price; // Approximate conversion
            data[sub.category] += priceInUSD;
        });
        return Object.entries(data).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
    }, [subscriptions]);
    
    const COLORS = ['#FFDAB9', '#E57373', '#8884d8', '#82ca9d', '#ffc658'];

    return (
        <div className="page-enter-active">
            <h1 className="text-3xl font-bold font-heading mb-6">Financial Reports</h1>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                    <h2 className="text-xl font-bold font-heading mb-4">Monthly Expenditure (Mock)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                         <BarChart data={[{name: 'Jun', USD: 400}, {name: 'Jul', USD: 300}, {name: 'Aug', USD: 398}]}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value, 'USD')} />
                            <Bar dataKey="USD" fill="#E57373" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="lg:col-span-2">
                    <h2 className="text-xl font-bold font-heading mb-4">Spending by Category (USD)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} outerRadius={110} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                                {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value, 'USD')} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

const SmsFeedPage = () => {
    const [feed, setFeed] = useState([]);
    useEffect(() => { api.getSmsFeed().then(setFeed) }, []);
    return (
        <div className="page-enter-active">
            <h1 className="text-3xl font-bold font-heading mb-2">SMS Expense Feed</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Expenses automatically detected from your messages (demo).</p>
            <Card>
                <div className="space-y-4">
                    {feed.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div>
                                <p className="font-semibold">{item.merchant}</p>
                                <p className="text-sm text-gray-500">{item.date}</p>
                            </div>
                            <p className="font-semibold text-lg text-[#E57373]">{formatCurrency(item.amount, item.currency)}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
};


// --- ROUTING & APP LAYOUT ---
const ProtectedRoute = ({ children }) => {
    const auth = useAuth();
    const location = useLocation();
    if (!auth.user) return <Navigate to="/login" state={{ from: location }} replace />;
    return children;
};

const AppLayout = () => (
    <div className="flex h-screen bg-[#F5F5DC] dark:bg-[#1a1a1a] text-[#4A4A4A] dark:text-[#E0E0E0] font-body">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
                <Routes>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="manage" element={<ManageSubscriptionsPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="sms-feed" element={<SmsFeedPage />} />
                </Routes>
            </main>
        </div>
        <Chatbot />
    </div>
);

// --- MAIN APP COMPONENT ---
function App() {
    return (
        <ThemeProvider>
            <NotificationProvider>
                <AuthProvider>
                    <GlobalStyles />
                    <Router>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/app/*" element={
                                <ProtectedRoute>
                                    <AppLayout />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </Router>
                </AuthProvider>
            </NotificationProvider>
        </ThemeProvider>
    );
}

export default App;
