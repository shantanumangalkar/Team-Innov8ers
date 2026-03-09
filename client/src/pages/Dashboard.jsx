import { useAuth } from '../context/AuthContext';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FarmerDashboard from './dashboard/FarmerDashboard';
import BuyerDashboard from './dashboard/BuyerDashboard';
import Marketplace from '../components/dashboard/Marketplace';
import MyDemands from '../components/dashboard/MyDemands'; // New Component
import NewsWidget from '../components/dashboard/NewsWidget'; // New News Widget
import SmartAlerts from './dashboard/SmartAlerts'; // New Smart Alerts Page
import { LayoutDashboard, ShoppingBag, FileText, UserCircle, LogOut, ChevronRight, Sprout, CloudRain, Menu, X } from 'lucide-react';

import VerificationPending from '../components/VerificationPending';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    // Redirect Admin to specialized dashboard if they try to access standard dashboard
    useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/admin/data');
        }
    }, [user, navigate]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Show Pending Screen if user is not verified and not admin
    if (user && user.role !== 'admin' && !user.isVerified) {
        return <VerificationPending />;
    }

    const NavItem = ({ path, icon: Icon, label }) => (
        <button
            onClick={() => navigate(path)}
            className={`w-full flex items-center space-x-3 px-6 py-3 transition-colors duration-200 border-l-4 ${isActive(path)
                ? 'bg-green-800 border-white text-white font-bold'
                : 'border-transparent text-green-100 hover:bg-green-800 hover:text-white'
                }`}
        >
            <Icon className={`w-5 h-5 ${isActive(path) ? 'text-white' : 'text-green-200'}`} />
            <span className="text-sm tracking-wide">{label}</span>
            {isActive(path) && <ChevronRight className="ml-auto w-4 h-4 text-white opacity-70" />}
        </button>
    );

    const NavigationLinks = () => (
        <>
            <div className="px-4 mb-2">
                <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">Main Navigation</p>
            </div>
            <div className="space-y-1">
                <NavItem path="/dashboard" icon={LayoutDashboard} label="Overview Dashboard" />

                {user?.role === 'farmer' && (
                    <>
                        <NavItem path="/dashboard/marketplace" icon={ShoppingBag} label="Crop Marketplace" />
                        <NavItem path="/dashboard/smart-alerts" icon={CloudRain} label="Weather & Alerts" />
                    </>
                )}

                {user?.role === 'buyer' && (
                    <NavItem path="/dashboard/my-demands" icon={FileText} label="Active Postings" />
                )}

                <div className="px-4 mt-6 mb-2">
                    <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">Preferences</p>
                </div>
                <NavItem path="/profile" icon={UserCircle} label="User Profile" />
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex overflow-hidden font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 bg-green-900 text-white shadow-md z-20 flex-shrink-0">
                {/* Header Section */}
                <div className="p-6 border-b border-green-800">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white p-1.5 rounded-sm">
                            <Sprout className="w-6 h-6 text-green-800" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight uppercase">Kisan Bandhu</h1>
                            <p className="text-[10px] text-green-300 uppercase tracking-widest mt-0.5">Government Portal</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Desktop */}
                <div className="py-4 flex-1 overflow-y-auto">
                    <NavigationLinks />
                </div>

                {/* User Section */}
                <div className="p-4 border-t border-green-800 bg-green-900/50">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-white border-2 border-green-700 flex items-center justify-center text-green-900 font-bold shadow-sm">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm text-white truncate">{user?.name}</p>
                            <p className="text-xs text-green-300 capitalize flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2"></span>
                                {user?.role} Account
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-green-800 hover:bg-green-700 text-white text-sm font-medium transition-colors border border-green-700"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Secure Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <aside className={`md:hidden fixed inset-y-0 left-0 w-72 bg-green-900/95 backdrop-blur-xl text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Mobile Sidebar Header */}
                <div className="p-5 border-b border-green-800 bg-green-950/50 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white p-1.5 rounded-sm">
                            <Sprout className="w-5 h-5 text-green-800" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight uppercase line-clamp-1">Kisan Bandhu</h1>
                            <p className="text-[9px] text-green-300 uppercase tracking-widest mt-0.5">Government Portal</p>
                        </div>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-green-200 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors border border-transparent hover:border-white/20">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Mobile Navigation Links */}
                <div className="py-4 flex-1 overflow-y-auto">
                    <NavigationLinks />
                </div>

                {/* Mobile User Section */}
                <div className="p-4 border-t border-green-800 bg-green-950/80 backdrop-blur-md">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-white border-2 border-green-700 flex items-center justify-center text-green-900 font-bold shadow-sm shrink-0">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="overflow-hidden min-w-0">
                            <p className="font-bold text-sm text-white truncate">{user?.name}</p>
                            <p className="text-[10px] text-green-300 capitalize flex items-center tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></span>
                                {user?.role} Account
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-transparent hover:bg-white/10 text-white text-sm font-bold transition-colors border border-white/30 rounded"
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f4f6f8] relative">
                {/* Top Mobile Header */}
                <div className="md:hidden bg-green-900 text-white p-4 flex justify-between items-center shadow-md z-30 sticky top-0">
                    <div className="flex items-center space-x-3">
                        <button
                            className="p-1 hover:bg-white/10 rounded transition-colors text-white mr-1"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <Sprout className="w-5 h-5 text-green-300" />
                        <h1 className="font-bold text-lg uppercase tracking-tight truncate max-w-[150px] sm:max-w-none">Kisan Bandhu</h1>
                    </div>
                    <button onClick={() => { logout(); navigate('/'); }} className="p-1.5 border border-green-700 hover:bg-green-800 rounded bg-black/10 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                {/* Official Govt Portal Header Strip */}
                <div className="hidden md:flex bg-white h-12 border-b border-gray-200 shadow-sm items-center justify-between px-8 z-10">
                    <div className="flex items-center text-sm text-gray-500 font-medium">
                        <span className="mr-4">Ministry of Agriculture & Farmers Welfare</span>
                        <span className="text-gray-300">|</span>
                        <span className="ml-4">Contract Farming Portal</span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                        <span className="text-gray-500">Language: <strong className="text-gray-800">English</strong></span>
                        <span className="text-green-700 font-semibold">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-2 sm:p-4 md:p-8">
                    <div className="max-w-7xl mx-auto h-full flex flex-col xl:flex-row gap-4 md:gap-8">
                        {/* Center Content */}
                        <div className="flex-1 min-w-0">
                            <Routes>
                                <Route path="/" element={
                                    user?.role === 'farmer' ? <FarmerDashboard /> : <BuyerDashboard />
                                } />
                                <Route path="/marketplace" element={<Marketplace />} />
                                <Route path="/my-demands" element={<MyDemands />} />
                                <Route path="/smart-alerts" element={<SmartAlerts />} />
                            </Routes>
                        </div>

                        {/* Right Sidebar: News Feed */}
                        <div className="hidden xl:block w-80 flex-shrink-0">
                            <div className="sticky top-0 h-[calc(100vh-100px)]">
                                <NewsWidget />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;

