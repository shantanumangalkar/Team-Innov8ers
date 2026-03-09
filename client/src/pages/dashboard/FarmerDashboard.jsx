import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import DashboardContractCard from '../../components/dashboard/DashboardContractCard';
import { CloudRain, TrendingUp, ShoppingBag, ArrowUpRight, Plus, Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FarmerDashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Contracts where farmer is involved
            const contractsRes = await api.get('/contracts');
            if (contractsRes.data.success) {
                setContracts(contractsRes.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Socket.io for Real-time Updates
    useEffect(() => {
        if (!user) return;

        const socket = io('http://localhost:5000');
        socket.emit('join', user._id);

        socket.on('contract_updated', (updatedContract) => {
            toast.success(`Contract updated: ${updatedContract.status}`);
            fetchData();
        });

        // Listen for new contracts proposed to this farmer (if applicable)
        socket.on('contract_proposed', () => {
            toast.success('New contract proposal received!');
            fetchData();
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    // Simulated Stats Data
    const activeContractsCount = contracts.filter(c => c.status === 'Active').length;
    const estRevenue = contracts.reduce((acc, curr) => acc + (curr.totalValue || 0), 0); // Assuming totalValue or calculate

    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            {/* Top Navigation / Breadcrumb */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-2 border-green-800 pb-4 mb-6 mt-2 gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-tight">Overview Dashboard</h1>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1 tracking-wide">Farmer Portal / {user?.name}</p>
                </div>
                <div className="flex space-x-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-2 bg-green-800 text-white font-semibold text-sm border border-green-900 text-center">Overview</button>
                    <button className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-2 bg-white text-gray-700 font-semibold text-sm border border-gray-300 hover:bg-gray-50 text-center" onClick={() => navigate('/dashboard/marketplace')}>Marketplace</button>
                </div>
            </div>

            {/* Official Stats Check Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

                {/* 1. Active Contracts */}
                <div className="bg-white border border-gray-300 shadow-sm flex flex-col">
                    <div className="bg-gray-100 border-b border-gray-300 p-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">Active Contracts</span>
                        <TrendingUp className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-center">
                        <div className="flex items-baseline space-x-3">
                            <h3 className="text-3xl font-bold text-gray-900">{activeContractsCount}</h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Active contractual agreements</p>
                    </div>
                </div>

                {/* 2. Weather Risk */}
                <div className="bg-white border border-gray-300 shadow-sm flex flex-col">
                    <div className="bg-gray-100 border-b border-gray-300 p-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">Weather Risk</span>
                        <CloudRain className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-center">
                        <div className="flex items-baseline space-x-3">
                            <h3 className="text-2xl font-bold text-green-700">Low Risk</h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Favorable conditions forecasted</p>
                    </div>
                </div>

                {/* 3. Est Revenue */}
                <div className="bg-white border border-gray-300 shadow-sm flex flex-col">
                    <div className="bg-gray-100 border-b border-gray-300 p-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">Est. Revenue</span>
                        <ShoppingBag className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-center">
                        <div className="flex items-baseline space-x-2">
                            <h3 className="text-3xl font-bold text-gray-900">₹4.2L</h3>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">(Projected)</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Based on current contract values</p>
                    </div>
                </div>
            </div>

            {/* My Contracts Section */}
            <div className="bg-white border border-gray-300 shadow-sm">
                <div className="bg-green-800 text-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-green-900 gap-3">
                    <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide flex items-center">
                        <FileText className="w-5 h-5 mr-3 opacity-90" />
                        {t('My Contracts List')}
                    </h2>
                    <button
                        onClick={() => navigate('/dashboard/marketplace')}
                        className="w-full sm:w-auto flex items-center justify-center bg-white text-green-900 hover:bg-gray-100 px-4 py-2 text-sm font-bold transition-colors border border-transparent hover:border-gray-200"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Find New Contracts
                    </button>
                </div>

                <div className="p-6 bg-gray-50/50">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800 mx-auto mb-4"></div>
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Fetching records...</p>
                        </div>
                    ) : (
                        contracts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {contracts.map(contract => (
                                    <DashboardContractCard key={contract._id} contract={contract} role="farmer" />
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center border-2 border-dashed border-gray-300 bg-white">
                                <Search className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-700 mb-2 uppercase">No Records Found</h3>
                                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">No active contracts are registered under your profile. Please visit the marketplace to explore opportunities.</p>
                                <button
                                    onClick={() => navigate('/dashboard/marketplace')}
                                    className="px-6 py-2 bg-green-800 text-white font-bold text-sm hover:bg-green-900 transition-colors"
                                >
                                    Browse Marketplace Portal
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default FarmerDashboard;
