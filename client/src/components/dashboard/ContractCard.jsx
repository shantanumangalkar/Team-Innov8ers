import { Calendar, CheckCircle, AlertCircle, FileText, TrendingUp, User, MapPin, ArrowRight, Info, Clock, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';

const CONTRACT_DESCRIPTIONS = {
    'Market Specification': 'Buyer provides quality specs & commits to buy. You manage production.',
    'Production': 'Buyer supplies inputs (seeds, tech) & manages processes. You provide land & labor.',
    'Buy-Back': 'Company finances the crop & guarantees purchase. Loan deducted from payment.',
    'Price Guarantee': 'Fixed price guaranteed regardless of market value. High security.',
    'Cluster': 'Join other farmers to fill a large demand together.'
};

const ContractCard = ({ contract, role }) => {
    const navigate = useNavigate();
    const isSigned = role === 'farmer' ? contract.farmerSigned : contract.buyerSigned;

    // Status Logic for Color Coding
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Proposed': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Completed': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="bg-white border border-gray-300 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
            <div className="flex flex-col gap-3 mb-4 border-b border-gray-200 pb-3">
                <div className="flex flex-col gap-2 w-full min-w-0">
                    <div className="flex justify-between items-start w-full gap-2">
                        {/* Contract Type Badge */}
                        <div className="flex items-center gap-2 group/type relative min-w-0 shrink">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border flex items-center gap-1 cursor-help truncate min-w-0 ${contract.contractType === 'Cluster' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                                contract.contractType === 'Price Guarantee' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                    'bg-gray-100 text-gray-700 border-gray-300'
                                }`}>
                                <span className="truncate">{contract.contractType || 'Market Specification'}</span>
                                <Info className="w-3 h-3 ml-0.5 shrink-0" />
                            </span>

                            {/* Tooltip */}
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover/type:block w-64 bg-white text-gray-800 text-xs p-3 border border-gray-300 shadow-lg z-50">
                                <p className="font-bold mb-1 uppercase tracking-wider">{contract.contractType || 'Market Specification'}</p>
                                <p className="text-gray-600 font-medium whitespace-normal">
                                    {CONTRACT_DESCRIPTIONS[contract.contractType] || CONTRACT_DESCRIPTIONS['Market Specification']}
                                </p>
                            </div>
                        </div>

                        {/* Status Badge moved here from the right to avoid squeezing */}
                        <div className="shrink-0 flex items-start ml-auto">
                            <span className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border shrink-0 ${getStatusStyle(contract.status)}`}>
                                {contract.status || 'DRAFT'}
                            </span>
                        </div>
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 uppercase tracking-tight mb-2 leading-tight truncate">
                        {contract.cropDetails?.cropName || contract.cropName || contract.demand?.cropName || 'Contract Agreement'}
                    </h3>

                    <div className="flex items-center text-xs text-gray-600 font-medium bg-gray-50 px-2 py-1.5 border border-gray-200 mb-2 w-fit max-w-full overflow-hidden rounded">
                        <User className="w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0" />
                        <span className="uppercase text-[10px] tracking-wider mr-1 text-gray-500 hidden sm:inline shrink-0">Counterparty:</span>
                        {role === 'farmer' ? (
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (contract.buyer?._id) navigate(`/profile/${contract.buyer._id}`);
                                }}
                                className={`font-bold transition-colors truncate min-w-0 ${contract.buyer?._id ? "hover:text-green-800 hover:underline cursor-pointer text-gray-800" : "text-gray-500"}`}
                            >
                                {contract.buyer?.name || 'Waiting for Buyer'}
                            </span>
                        ) : (
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (contract.farmer?._id) navigate(`/profile/${contract.farmer._id}`);
                                }}
                                className={`font-bold transition-colors truncate min-w-0 ${contract.farmer?._id ? "hover:text-green-800 hover:underline cursor-pointer text-gray-800" : "text-gray-500"}`}
                            >
                                {contract.farmer?.name || 'Waiting for Farmer'}
                            </span>
                        )}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center text-[10px] text-gray-500 font-medium whitespace-nowrap">
                        <Clock className="w-3 h-3 mr-1 shrink-0" />
                        {contract.createdAt ? (
                            <span>Initiated {formatDistanceToNow(new Date(contract.createdAt), { addSuffix: true })}</span>
                        ) : 'Recently Initiated'}
                    </div>
                </div>
            </div>

            <div className="mb-4 border border-gray-200 bg-gray-50/50 rounded-sm overflow-hidden flex-grow flex flex-col justify-center">
                <div className="flex flex-col lg:flex-row justify-between lg:items-center p-2.5 border-b border-gray-200 bg-white gap-1">
                    <span className="text-gray-500 text-[10px] font-bold flex items-center tracking-wider uppercase truncate">
                        <FileText className="w-3.5 h-3.5 mr-1.5 opacity-70 shrink-0" />
                        <span className="hidden sm:inline mr-1">Sanctioned</span> Qty
                    </span>
                    <span className="font-bold text-gray-900 text-xs truncate">
                        {contract.cropDetails?.quantity || contract.quantity} Tons
                    </span>
                </div>
                <div className="flex flex-col lg:flex-row justify-between lg:items-center p-2.5 bg-gray-50 gap-1">
                    <span className="text-gray-500 text-[10px] font-bold flex items-center tracking-wider uppercase truncate">
                        <TrendingUp className="w-3.5 h-3.5 mr-1.5 opacity-70 shrink-0" />
                        <span className="hidden sm:inline mr-1">Agreed</span> Price
                    </span>
                    <span className="font-bold text-gray-900 text-xs truncate">
                        ₹{contract.pricingTerms?.pricePerUnit || contract.pricePerTon}/ton
                    </span>
                </div>
            </div>

            {/* PDF Download Link if available */}
            {contract.legal && contract.legal.contractUrl && (
                <a
                    href={`http://localhost:5000${contract.legal.contractUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center w-full mb-4 py-2 flex-grow-0 border border-gray-300 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors uppercase tracking-wider whitespace-nowrap"
                >
                    <FileText className="w-3.5 h-3.5 mr-2 opacity-70 shrink-0" />
                    <span className="truncate">Download Official Document</span>
                </a>
            )}

            <div className="flex flex-wrap items-center justify-between mt-auto pt-3 border-t border-gray-100 gap-2">
                {isSigned ? (
                    <div className="flex items-center text-green-700 text-[9px] font-bold uppercase tracking-wider bg-green-50 px-2 py-1.5 border border-green-200 shrink-0 truncate max-w-full">
                        <CheckCircle className="w-3 h-3 mr-1.5 shrink-0" /> <span className="truncate">Authorized</span>
                    </div>
                ) : (
                    <div className="flex items-center text-amber-700 text-[9px] font-bold uppercase tracking-wider bg-amber-50 px-2 py-1.5 border border-amber-200 shrink-0 truncate max-w-full">
                        <AlertCircle className="w-3 h-3 mr-1.5 shrink-0" /> <span className="truncate">Pending<span className="hidden sm:inline">&nbsp;Sign</span></span>
                    </div>
                )}

                <button
                    onClick={() => navigate(`/contract/${contract._id}/track`)}
                    className="flex justify-center items-center bg-white text-green-900 border border-green-800 px-3 py-1.5 text-[10px] font-bold hover:bg-green-50 transition-colors uppercase tracking-wider shrink-0 ml-auto rounded-sm group/btn"
                >
                    <span>Proceed</span>
                    <ArrowRight className="w-3 h-3 ml-1.5 shrink-0 transform group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default ContractCard;
