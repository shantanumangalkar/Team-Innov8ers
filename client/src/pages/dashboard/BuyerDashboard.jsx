import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ContractCard from '../../components/dashboard/ContractCard';
import DemandCard from '../../components/dashboard/DemandCard';
import CreateDemandForm from '../../components/dashboard/CreateDemandForm';
import { Plus, BarChart3, Package, FileText, CheckCircle } from 'lucide-react';

const BuyerDashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [contracts, setContracts] = useState([]);
    const [demands, setDemands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [activeTab, setActiveTab] = useState('contracts'); // 'contracts' or 'demands'

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Contracts
            const contractsRes = await api.get('/contracts');
            if (contractsRes.data.success) {
                setContracts(contractsRes.data.data);
            }

            // Fetch Demands (My Postings)
            const demandsRes = await api.get('/demands/my');
            if (demandsRes.data.success) {
                setDemands(demandsRes.data.data);
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

        socket.on('contract_proposed', (newContract) => {
            toast.success(`New application received for ${newContract.cropName}!`);
            fetchData(); // Refresh data to show new application in DemandCard
        });

        // Listen for new bids/applications
        socket.on('new_bid', (data) => {
            toast.success('New application received!');
            fetchData();
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {showCreateForm && (
                <CreateDemandForm
                    onClose={() => setShowCreateForm(false)}
                    onSuccess={() => {
                        setShowCreateForm(false);
                        fetchData();
                    }}
                />
            )}

            {/* Top Navigation / Breadcrumb */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-2 border-green-800 pb-4 mb-6 mt-2 gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-tight">Buyer Dashboard</h1>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1 tracking-wide">Corporate Portal / {user?.name}</p>
                </div>
                <div className="flex space-x-2 w-full sm:w-auto">
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-green-800 text-white font-semibold text-sm border border-green-900 hover:bg-green-900 flex items-center justify-center shadow-sm transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Post New Demand
                    </button>
                </div>
            </div>

            {/* Official Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {/* 1. Open Demands */}
                <div className="bg-white border border-gray-300 shadow-sm flex flex-col">
                    <div className="bg-gray-100 border-b border-gray-300 p-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">{t('Open Demands')}</span>
                        <Package className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-center">
                        <div className="flex items-baseline space-x-3">
                            <h3 className="text-3xl font-bold text-gray-900">
                                {demands.filter(d => d.status === 'Open').length}
                            </h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Active postings awaiting bids</p>
                    </div>
                </div>

                {/* 2. Active Contracts */}
                <div className="bg-white border border-gray-300 shadow-sm flex flex-col">
                    <div className="bg-gray-100 border-b border-gray-300 p-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">{t('Active Contracts')}</span>
                        <CheckCircle className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-center">
                        <div className="flex items-baseline space-x-3">
                            <h3 className="text-3xl font-bold text-gray-900">
                                {contracts.filter(c => c.status === 'Active').length}
                            </h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Ongoing field contracts</p>
                    </div>
                </div>

                {/* 3. Platform Activity */}
                <div className="bg-white border border-gray-300 shadow-sm flex flex-col">
                    <div className="bg-gray-100 border-b border-gray-300 p-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">Platform Status</span>
                        <BarChart3 className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-center">
                        <div className="flex items-center space-x-3">
                            <div className="relative flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-600"></span>
                            </div>
                            <h3 className="text-lg font-bold text-green-700">System Online</h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Real-time monitoring active</p>
                    </div>
                </div>
            </div>

            {/* Actions & Tabs */}
            <div className="bg-white border border-gray-300 shadow-sm flex flex-col">
                <div className="flex flex-col sm:flex-row border-b border-gray-300 bg-gray-50 sm:pl-2 sm:pt-2">
                    <button
                        onClick={() => setActiveTab('contracts')}
                        className={`px-4 sm:px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'contracts' ? 'bg-white border-l-4 sm:border-l-0 sm:border-t-4 border-green-800 text-green-900 sm:-mb-[1px]' : 'border-l-4 sm:border-l-0 sm:border-t-4 border-transparent text-gray-500 hover:text-green-800 hover:bg-gray-100'
                            }`}
                    >
                        {t('Active Contracts')}
                    </button>
                    <button
                        onClick={() => setActiveTab('demands')}
                        className={`px-4 sm:px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-t border-gray-200 sm:border-t-transparent ${activeTab === 'demands' ? 'bg-white border-l-4 sm:border-l-0 sm:border-t-4 border-green-800 text-green-900 sm:-mb-[1px]' : 'border-l-4 sm:border-l-0 sm:border-t-4 border-transparent text-gray-500 hover:text-green-800 hover:bg-gray-100'
                            }`}
                    >
                        {t('My Postings')}
                    </button>
                </div>

                <div className="p-6 bg-gray-50/50">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800 mx-auto mb-4"></div>
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Fetching records...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'contracts' && (
                                contracts.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        {contracts.map(contract => (
                                            <ContractCard key={contract._id} contract={contract} role="buyer" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center border-2 border-dashed border-gray-300 bg-white">
                                        <FileText className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-gray-700 mb-2 uppercase">No Active Contracts</h3>
                                        <p className="text-gray-500 text-sm max-w-md mx-auto">No established contracts found. Accept bids on your postings to formalize agreements.</p>
                                    </div>
                                )
                            )}

                            {activeTab === 'demands' && (
                                demands.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        {demands.map(demand => (
                                            <DemandCard key={demand._id} demand={demand} onUpdate={fetchData} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center border-2 border-dashed border-gray-300 bg-white">
                                        <Package className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-gray-700 mb-2 uppercase">No Postings Found</h3>
                                        <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">You have not posted any commodity demands yet.</p>
                                        <button onClick={() => setShowCreateForm(true)} className="px-6 py-2 bg-green-800 text-white font-bold text-sm hover:bg-green-900 transition-colors">
                                            Create First Posting
                                        </button>
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuyerDashboard;
