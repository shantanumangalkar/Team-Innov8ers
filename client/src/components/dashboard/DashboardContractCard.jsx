import { useNavigate } from 'react-router-dom';
import { User, ArrowRight, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const DashboardContractCard = ({ contract, role }) => {
    const navigate = useNavigate();
    const isSigned = role === 'farmer' ? contract.farmerSigned : contract.buyerSigned;

    // Helper for Status Badge
    const getStatusBadge = (status) => {
        const styles = {
            'Active': 'bg-green-100 text-green-700',
            'Completed': 'bg-blue-100 text-blue-700',
            'Pending': 'bg-amber-100 text-amber-700',
            'Cancelled': 'bg-red-100 text-red-700',
            'In Production': 'bg-purple-100 text-purple-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="bg-white border border-gray-300 p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full overflow-hidden hover:border-green-600 group">
            {/* Header: ID & Status */}
            <div className="flex flex-col gap-3 mb-4 border-b border-gray-200 pb-3">
                <div className="flex flex-col gap-2 w-full min-w-0">
                    <div className="flex justify-between items-start w-full gap-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-0.5 border border-gray-200 shrink-0">
                            REF: {contract._id ? contract._id.slice(-7).toUpperCase() : 'NEW'}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border shrink-0 ${getStatusBadge(contract.status)}`}>
                            {contract.status || 'DRAFT'}
                        </span>
                    </div>

                    <h3 className="font-bold text-[13px] sm:text-[15px] text-gray-900 leading-tight uppercase tracking-tight line-clamp-2 pr-1 truncate group-hover:text-green-800 transition-colors">
                        {contract.cropDetails?.cropName || contract.cropName || contract.demand?.cropName || 'Contract'}
                    </h3>

                    <div className="flex items-center text-[10px] sm:text-[11px] text-gray-600 font-medium bg-gray-50 px-2.5 py-1.5 border border-gray-200 rounded shrink-0 overflow-hidden">
                        <User className="w-3 h-3 mr-1 text-gray-400 shrink-0" />
                        <span className="uppercase text-[9px] tracking-wider mr-1 text-gray-500 shrink-0">Party:</span>
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                if (contract.buyer?._id) navigate(`/profile/${contract.buyer._id}`);
                            }}
                            className={`font-semibold transition-colors truncate min-w-0 ${contract.buyer?._id
                                ? "hover:text-green-800 hover:underline cursor-pointer text-gray-800"
                                : "text-gray-500"
                                }`}
                        >
                            {contract.buyer?.name || 'Unknown'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content: Quantity & Price */}
            <div className="mb-4 border border-gray-200 bg-white rounded-sm overflow-hidden flex-grow flex flex-col justify-center">
                <div className="flex flex-col lg:flex-row justify-between lg:items-center p-2 sm:p-3 border-b border-gray-200 gap-1 bg-gray-50/50">
                    <span className="flex items-center text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <FileText className="w-3 h-3 mr-1.5 opacity-70 shrink-0" /> Qty
                    </span>
                    <span className="font-bold text-gray-900 text-xs truncate">
                        {contract.cropDetails?.quantity || contract.quantity} Ton
                    </span>
                </div>
                <div className="flex flex-col lg:flex-row justify-between lg:items-center p-2 sm:p-3 bg-white gap-1">
                    <span className="flex items-center text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">
                        Agreed Price
                    </span>
                    <span className="font-bold text-gray-900 text-xs truncate">
                        ₹{contract.pricingTerms?.pricePerUnit || contract.pricePerTon}/ton
                    </span>
                </div>
            </div>

            {/* Footer: Action & Warning */}
            <div className="flex items-center justify-between mt-auto gap-2 pt-1 border-t border-gray-100/50 pt-3">
                {!isSigned ? (
                    <div className="flex items-center text-amber-700 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-amber-50 px-2 py-1.5 border border-amber-200 rounded-sm shrink-0 truncate">
                        <AlertCircle className="w-3 h-3 mr-1 shrink-0" /> Sign
                    </div>
                ) : (
                    <div className="flex items-center text-green-700 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-green-50 px-2 py-1.5 border border-green-200 rounded-sm shrink-0 truncate">
                        <CheckCircle className="w-3 h-3 mr-1 shrink-0" /> Auth
                    </div>
                )}

                <button
                    onClick={() => navigate(`/contract/${contract._id}/track`)}
                    className="flex justify-center items-center bg-white text-green-900 border border-green-800 px-3 py-1.5 text-[9px] sm:text-[10px] font-bold hover:bg-green-50 transition-colors uppercase tracking-wider shrink-0 rounded-sm"
                >
                    Details <ArrowRight className="w-3 h-3 ml-1 shrink-0" />
                </button>
            </div>
        </div>
    );
};

export default DashboardContractCard;
