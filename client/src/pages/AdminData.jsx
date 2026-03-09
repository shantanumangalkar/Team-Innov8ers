import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, XCircle, Eye, LogOut } from 'lucide-react';

const AdminData = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState({ users: [], farmers: [], buyers: [] });
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState(null);

    const fetchData = async () => {
        try {
            const { data } = await api.get('/admin/data');
            if (data.success) {
                setData(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleVerify = async (id, name) => {
        if (!window.confirm(`Are you sure you want to verify ${name}?`)) return;
        try {
            await api.put(`/admin/verify/${id}`);
            alert(`User ${name} verified successfully.`);
            fetchData();
        } catch (error) {
            alert('Verification failed');
        }
    };

    const handleReject = async (id, name) => {
        if (!window.confirm(`Are you sure you want to block/reject ${name}?`)) return;
        try {
            await api.put(`/admin/reject/${id}`);
            alert(`User ${name} blocked.`);
            fetchData();
        } catch (error) {
            alert('Action failed');
        }
    };

    const viewProfile = (user) => {
        let profile = null;
        if (user.role === 'farmer') {
            profile = data.farmers.find(f => f.user?._id === user._id);
        } else if (user.role === 'buyer') {
            profile = data.buyers.find(b => b.user?._id === user._id);
        }

        if (profile) {
            setSelectedProfile({ ...profile, role: user.role, userName: user.name });
        } else {
            alert('Detailed profile not found or incomplete.');
        }
    };

    const closeModal = () => setSelectedProfile(null);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Portal...</div>;

    // Filter to show only pending approvals + verified users (contracts hidden)
    const verificationList = data.users.filter(u => u.role !== 'admin');

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Verification Portal</h1>
                        <p className="text-gray-500 mt-1">Review and Approve Farmer & Company Registrations</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => { logout(); navigate('/'); }}
                            className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold border border-red-100 hover:bg-red-100 transition"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                        </button>
                        <div className="bg-white p-3 rounded-lg shadow-sm border flex items-center space-x-4">
                            <div className="text-center">
                                <span className="block text-xl font-bold text-yellow-600">{verificationList.filter(u => !u.isVerified).length}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Pending</span>
                            </div>
                            <div className="w-px h-8 bg-gray-200"></div>
                            <div className="text-center">
                                <span className="block text-xl font-bold text-green-600">{verificationList.filter(u => u.isVerified).length}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Verified</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                        <h2 className="font-semibold text-gray-700 flex items-center">
                            <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" />
                            Pending Approvals & User Status
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white text-gray-500 uppercase font-bold text-xs border-b">
                                <tr>
                                    <th className="px-6 py-4">Applicant</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {verificationList.map((item) => (
                                    <tr key={item._id} className={`group hover:bg-gray-50 transition ${!item.isVerified ? 'bg-yellow-50/30' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 text-base">{item.name}</div>
                                            <div className="text-xs text-gray-500">{item.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.role === 'farmer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {item.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.isVerified ? (
                                                <span className="flex items-center text-green-700 text-xs font-bold bg-green-50 w-fit px-2 py-1 rounded-full border border-green-200">
                                                    <UserCheck className="w-3 h-3 mr-1" /> Verified
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-amber-700 text-xs font-bold bg-amber-50 w-fit px-2 py-1 rounded-full border border-amber-200">
                                                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span> Pending Review
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center items-center space-x-2">
                                                <button
                                                    onClick={() => viewProfile(item)}
                                                    className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-700 text-xs font-medium hover:bg-gray-50 hover:border-gray-400 transition"
                                                    title="View Full Profile Details"
                                                >
                                                    <Eye className="w-3 h-3 mr-1" /> View Profile
                                                </button>

                                                {!item.isVerified && (
                                                    <button
                                                        onClick={() => handleVerify(item._id, item.name)}
                                                        className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 shadow-sm transition"
                                                    >
                                                        Safe To Verify
                                                    </button>
                                                )}

                                                {item.isVerified ? (
                                                    <button
                                                        onClick={() => handleReject(item._id, item.name)}
                                                        className="text-gray-400 hover:text-red-500 p-1"
                                                        title="Revoke Verification"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReject(item._id, item.name)}
                                                        className="text-gray-400 hover:text-red-500 p-1"
                                                        title="Reject Application"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {verificationList.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                            No pending verifications found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Profile Modal */}
            {selectedProfile && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{selectedProfile.userName}</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">{selectedProfile.role} Application Details</p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {selectedProfile.role === 'farmer' ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailCard label="Father's Name" value={selectedProfile.personalDetails?.fatherName} />
                                        <DetailCard label="Contact Number" value={selectedProfile.personalDetails?.altPhone || 'N/A'} />
                                    </div>

                                    <SectionHeader title="Land & Agriculture" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailCard label="Total Land" value={`${selectedProfile.landDetails?.totalLandArea || 0} Acres`} />
                                        <DetailCard label="Irrigation" value={selectedProfile.landDetails?.irrigationSource} />
                                        <DetailCard label="Primary Crops" value={selectedProfile.cropDetails?.primaryCrops?.join(', ')} />
                                        <DetailCard label="District" value={selectedProfile.location?.district} />
                                    </div>

                                    <SectionHeader title="KYC & Banking" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailCard label="Aadhaar No." value={selectedProfile.kyc?.aadhaarNumber} />
                                        <DetailCard label="PAN No." value={selectedProfile.kyc?.panNumber} />
                                        <DetailCard label="Bank Name" value={selectedProfile.kyc?.bankDetails?.bankName} />
                                        <DetailCard label="IFSC Code" value={selectedProfile.kyc?.bankDetails?.ifscCode} />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailCard label="Company Name" value={selectedProfile.companyDetails?.companyName} />
                                        <DetailCard label="Company Type" value={selectedProfile.companyDetails?.companyType} />
                                    </div>

                                    <SectionHeader title="Business Registration" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailCard label="GST Number" value={selectedProfile.companyDetails?.gstNumber} />
                                        <DetailCard label="CIN" value={selectedProfile.companyDetails?.cin} />
                                        <DetailCard label="Company PAN" value={selectedProfile.companyDetails?.panNumber} />
                                        <DetailCard label="HQ Location" value={`${selectedProfile.address?.district}, ${selectedProfile.address?.state}`} />
                                    </div>

                                    <SectionHeader title="Authorized Representative" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailCard label="Name" value={selectedProfile.authPerson?.name} />
                                        <DetailCard label="Designation" value={selectedProfile.authPerson?.designation} />
                                        <DetailCard label="Phone" value={selectedProfile.authPerson?.phone} />
                                        <DetailCard label="Email" value={selectedProfile.authPerson?.email} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm">Close Review</button>
                            {!data.users.find(u => u._id === selectedProfile.user?._id)?.isVerified && (
                                <button
                                    onClick={() => {
                                        handleVerify(selectedProfile.user?._id, selectedProfile.userName);
                                        closeModal();
                                    }}
                                    className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 shadow-md text-sm flex items-center"
                                >
                                    <ShieldCheck className="w-4 h-4 mr-2" /> Approve Application
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SectionHeader = ({ title }) => (
    <h4 className="font-bold text-gray-800 border-b pb-1 mb-3 text-sm flex items-center">
        <span className="w-1 h-4 bg-blue-500 rounded mr-2"></span> {title}
    </h4>
);

const DetailCard = ({ label, value }) => (
    <div className="p-3 bg-gray-50 rounded border border-gray-100">
        <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{label}</span>
        <span className="font-medium text-gray-900 text-sm truncate block" title={value}>{value || '-'}</span>
    </div>
);

export default AdminData;
