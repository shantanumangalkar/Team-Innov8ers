import React, { useState } from 'react';
import {
    MapPin,
    Calendar,
    Package,
    Leaf,
    DollarSign,
    TrendingUp,
    Users,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    Clock,
    User,
    ArrowRight,
    FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import ApplicantProfileModal from './ApplicantProfileModal';
import {
    Info
} from 'lucide-react';

const CONTRACT_DESCRIPTIONS = {
    'Market Specification': 'Buyer provides quality specs & commits to buy. You manage production.',
    'Production': 'Buyer supplies inputs (seeds, tech) & manages processes. You provide land & labor.',
    'Buy-Back': 'Company finances the crop & guarantees purchase. Loan deducted from payment.',
    'Price Guarantee': 'Fixed price guaranteed regardless of market value. High security.',
    'Cluster': 'Join other farmers to fill a large demand together.'
};

const DemandCard = ({ demand, onAcceptBid }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);

    const handleViewProfile = async (userId) => {
        if (!userId) return;
        setIsProfileOpen(true);
        setProfileLoading(true);
        try {
            const res = await api.get(`/profiles/user/${userId}`);
            setSelectedProfile(res.data.data);
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setProfileLoading(false);
        }
    };

    // Helper for status colors
    const getStatusStyle = (status) => {
        if (!status) return 'bg-blue-50 text-blue-700 border-blue-200';
        switch (status.toLowerCase()) {
            case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'closed': return 'bg-gray-50 text-gray-700 border-gray-200';
            case 'fulfilled': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            default: return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    return (
        <>
            <div className="bg-white border border-gray-300 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 border-b border-gray-200 pb-3 gap-2 sm:gap-0">
                    <div className="w-full sm:w-auto">
                        <div className="flex items-center gap-2 mb-2 group/type relative w-fit">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border flex items-center gap-1 cursor-help ${demand.contractType === 'Cluster' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                                demand.contractType === 'Price Guarantee' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                    'bg-gray-100 text-gray-700 border-gray-300'
                                }`}>
                                {demand.contractType || 'Market Specification'}
                                <Info className="w-3 h-3 ml-0.5" />
                            </span>

                            {/* Tooltip */}
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover/type:block w-64 bg-white text-gray-800 text-xs p-3 border border-gray-300 shadow-lg z-50">
                                <p className="font-bold mb-1 uppercase tracking-wider">{demand.contractType || 'Market Specification'}</p>
                                <p className="text-gray-600 font-medium">
                                    {CONTRACT_DESCRIPTIONS[demand.contractType] || CONTRACT_DESCRIPTIONS['Market Specification']}
                                </p>
                            </div>
                        </div>

                        <h3 className="font-bold text-lg text-gray-900 uppercase tracking-tight mb-2 hover:text-green-800 transition-colors">
                            {demand.cropName || demand.cropDetails?.cropName || 'Untitled Demand'}
                        </h3>

                        {/* Clickable Buyer Name */}
                        <div className="flex items-center text-xs text-gray-600 font-medium bg-gray-50 px-2 py-1 inline-flex border border-gray-200 mb-2">
                            <User className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            <span className="uppercase text-[10px] tracking-wider mr-1 text-gray-500">Posted By:</span>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (demand.buyer?._id) navigate(`/profile/${demand.buyer._id}`);
                                }}
                                className={`font-bold transition-colors ${demand.buyer?._id ? "text-gray-800 hover:text-green-800 hover:underline cursor-pointer" : "text-gray-500"}`}
                            >
                                {demand.buyer?.name || 'Unknown Company'}
                            </span>
                        </div>

                        <div className="flex items-center text-[10px] text-gray-500 font-medium mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {demand.createdAt ? (
                                <>
                                    <span>Posted {formatDistanceToNow(new Date(demand.createdAt), { addSuffix: true })}</span>
                                    <span className="mx-1">|</span>
                                    <span>{format(new Date(demand.createdAt), 'dd MMM yyyy')}</span>
                                </>
                            ) : 'Recently Posted'}
                        </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                        <span className={cn("w-full sm:w-auto text-center sm:text-left px-2 py-1 text-[10px] font-bold uppercase tracking-widest border mb-2", getStatusStyle(demand.status || 'Active'))}>
                            {demand.status || 'Active'}
                        </span>
                    </div>
                </div>

                {/* CLUSTER PROGRESS BAR */}
                {demand.contractType === 'Cluster' && (
                    <div className="mb-4 bg-gray-50 p-3 border border-gray-200">
                        <div className="flex justify-between text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                            <span>Cluster Aggregation Progress</span>
                            <span>{demand.fulfilledQuantity || 0} / {demand.quantityRequired} Tons</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 overflow-hidden">
                            <div
                                className="bg-green-700 h-full transition-all duration-500"
                                style={{ width: `${Math.min(((demand.fulfilledQuantity || 0) / demand.quantityRequired) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 font-medium">
                            <Users className="w-3 h-3 inline mr-1" />
                            {demand.applications?.length || 0} farmers currently participating
                        </p>
                    </div>
                )}

                {/* Content Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-gray-200 mb-4 bg-gray-50">
                    <div className="p-2.5 border-b sm:border-r border-gray-200 bg-white">
                        <span className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-1 flex items-center"><Package className="w-3 h-3 mr-1" /> Required Qty</span>
                        <span className="font-bold text-gray-900 text-sm">{demand.quantityRequired} Tons</span>
                    </div>
                    <div className="p-2.5 border-b border-gray-200 bg-white">
                        <span className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-1 flex items-center"><DollarSign className="w-3 h-3 mr-1" /> Offered Price</span>
                        <span className="font-bold text-gray-900 text-sm">₹{demand.pricePerTon || demand.pricePerUnit}</span>
                    </div>
                    <div className="p-2.5 sm:col-span-2 bg-gray-50">
                        <span className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-1 flex items-center"><MapPin className="w-3 h-3 mr-1" /> Delivery Location</span>
                        <span className="font-medium text-gray-800 text-xs truncate block">{demand.deliveryLocation?.address || 'Location not specified'}</span>
                    </div>
                </div>

                {/* Expandable Applications Section */}
                <div className="mt-2 border border-gray-300">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 hover:bg-gray-200 p-2.5 transition-colors"
                    >
                        <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            <span>Bids / Applications ({demand.applications?.length || 0})</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Animated content wrapper */}
                    {isExpanded && (
                        <div className="bg-white p-3 space-y-3 border-t border-gray-300">
                            {(!demand.applications || demand.applications.length === 0) ? (
                                <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-300">
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No Applications Received</p>
                                    <p className="text-xs text-gray-400 mt-1">Pending farmer submissions.</p>
                                </div>
                            ) : (
                                demand.applications.map((app) => (
                                    <div key={app._id} className="border border-gray-300 p-3 bg-white">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center">
                                                <div
                                                    className="w-8 h-8 bg-gray-200 border border-gray-400 flex items-center justify-center text-gray-800 font-bold text-xs mr-3 cursor-pointer hover:bg-gray-300 transition"
                                                    onClick={() => handleViewProfile(app.farmer?._id)}
                                                    title="View Profile"
                                                >
                                                    {app.farmer?.name?.charAt(0) || 'F'}
                                                </div>
                                                <div>
                                                    <h4
                                                        className="font-bold text-gray-900 text-sm hover:text-green-800 cursor-pointer transition uppercase tracking-tight"
                                                        onClick={() => handleViewProfile(app.farmer?._id)}
                                                    >
                                                        {app.farmer?.name || 'Unknown Farmer'}
                                                    </h4>
                                                    <button
                                                        className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center hover:text-gray-800 mt-0.5"
                                                        onClick={() => handleViewProfile(app.farmer?._id)}
                                                    >
                                                        <User className="w-3 h-3 mr-1" /> View Profile
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-right bg-gray-50 px-2 py-1 border border-gray-200">
                                                <div className="font-bold text-gray-900 text-sm">₹{app.pricePerUnit}/ton</div>
                                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Offered Price</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-2 mb-3">
                                            <div className="text-xs text-gray-600">
                                                <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Offered Qty</span>
                                                <span className="font-bold text-gray-800">{app.offeredQuantity || '0'} Tons</span>
                                            </div>
                                            <div className="w-px h-6 bg-gray-300 mx-2"></div>
                                            <div className="text-xs text-gray-600 flex-1 overflow-hidden">
                                                <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Remarks</span>
                                                <span className="italic block truncate" title={app.message || 'No remarks'}>
                                                    {app.message || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        {app.status === 'Pending' && demand.status === 'Open' ? (
                                            <button
                                                onClick={() => onAcceptBid(demand._id, app)}
                                                className="w-full bg-white text-green-900 border border-green-800 hover:bg-green-50 text-xs font-bold py-2 transition-colors uppercase tracking-wider flex items-center justify-center"
                                            >
                                                Accept Offer <ArrowRight className="w-3.5 h-3.5 ml-2" />
                                            </button>
                                        ) : (
                                            <div className={`w-full py-2 border text-center text-[10px] font-bold uppercase tracking-wider ${app.status === 'Accepted'
                                                ? 'bg-green-50 text-green-800 border-green-300'
                                                : app.status === 'Rejected'
                                                    ? 'bg-red-50 text-red-800 border-red-300'
                                                    : 'bg-gray-50 text-gray-600 border-gray-300'
                                                }`}>
                                                {app.status}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* NEW: Contract Document Footer (Safe Check) */}
                {demand.legal && demand.legal.contractUrl && (
                    <div className="mt-4 pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <div className="flex items-center text-[10px] sm:text-xs text-gray-700 font-bold bg-gray-100 px-2 py-1.5 sm:py-1 border border-gray-300 uppercase tracking-wider w-full sm:w-auto">
                            <FileText className="w-3.5 h-3.5 mr-1.5 opacity-70 flex-shrink-0" />
                            <span className="truncate">{demand.legal.contractFileName || 'Legal Agreement.pdf'}</span>
                        </div>
                        <a
                            href={`http://localhost:5000${demand.legal.contractUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-gray-600 hover:text-green-800 flex items-center transition-colors uppercase tracking-wider"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Preview <ArrowRight className="w-3 h-3 ml-1" />
                        </a>
                    </div>
                )}

                <ApplicantProfileModal
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    profile={selectedProfile}
                    loading={profileLoading}
                />
            </div>
        </>
    );
};

export default DemandCard;
