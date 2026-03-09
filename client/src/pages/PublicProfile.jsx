import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, MapPin, Star, MessageSquare, CheckCircle, Shield, Award, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';

const PublicProfile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0 });

    // Review Form State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', contractId: '' });
    const [eligibleContracts, setEligibleContracts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Profile
                const profileRes = await api.get(`/profiles/user/${userId}`);
                setProfile(profileRes.data.data);

                // 2. Fetch Reviews
                const reviewsRes = await api.get(`/reviews/user/${userId}`);
                setReviews(reviewsRes.data.data);

                // Calculate Stats locally or use from DB if updated
                const avg = reviewsRes.data.data.reduce((acc, curr) => acc + curr.rating, 0) / (reviewsRes.data.data.length || 1);
                setStats({
                    avgRating: avg || 0,
                    totalReviews: reviewsRes.data.data.length
                });

            } catch (error) {
                console.error("Failed to fetch public profile", error);
                // toast.error("User not found");
                // navigate('/dashboard'); // Removed auto-redirect for debugging
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, navigate]);

    // Real-time Stats Recalculation
    useEffect(() => {
        if (reviews.length >= 0) {
            const total = reviews.length;
            const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            const avg = total > 0 ? (sum / total) : 0;

            setStats({
                avgRating: avg,
                totalReviews: total
            });
        }
    }, [reviews]);

    // Check eligibility when Modal opens
    const handleOpenReview = async () => {
        try {
            const { data } = await api.get('/contracts'); // Get MY contracts
            if (data.success) {
                // Filter: Completed AND (Buyer or Farmer matches userId)
                const completed = data.data.filter(c =>
                    (c.status === 'Completed' || c.status === 'Fulfilled' || c.status === 'Active') && // Allowing Active for Demo
                    (c.buyer._id === userId || c.farmer._id === userId)
                );

                if (completed.length === 0) {
                    toast.error("You must have a completed contract with this user to review them.");
                    return;
                }
                setEligibleContracts(completed);
                setShowReviewModal(true);
            }
        } catch (err) {
            console.error(err);
            toast.error("Could not verify eligibility");
        }
    };

    const submitReview = async () => {
        if (!reviewForm.contractId) {
            // select first if only one
            if (eligibleContracts.length > 0) reviewForm.contractId = eligibleContracts[0]._id;
            else return toast.error("Please select a contract");
        }

        try {
            const res = await api.post('/reviews', {
                revieweeId: userId,
                contractId: reviewForm.contractId,
                rating: reviewForm.rating,
                comment: reviewForm.comment
            });
            if (res.data.success) {
                toast.success("Review Submitted!");
                setShowReviewModal(false);
                // Refresh reviews
                const reviewsRes = await api.get(`/reviews/user/${userId}`);
                setReviews(reviewsRes.data.data);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to submit review");
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;

    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
                <p className="text-gray-500 mb-6">The user profile you are looking for does not existence or has been removed.</p>
                <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold">Return to Dashboard</button>
            </div>
        </div>
    );

    const isOwnProfile = currentUser && currentUser.id === userId;
    // Handle different profile structures (user object vs minimal)
    const userData = profile.user || profile;
    const isFarmer = userData.role === 'farmer';
    const themeColor = isFarmer ? 'emerald' : 'blue';

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* Header Profile Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100">
                    <div className={`h-32 bg-gradient-to-r from-${themeColor}-600 to-${themeColor}-800 relative`}>
                        <div className="absolute -bottom-16 left-8">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center overflow-hidden">
                                <User className={`w-16 h-16 text-${themeColor}-200`} />
                            </div>
                        </div>
                    </div>
                    <div className="pt-20 pb-8 px-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
                                    {userData.name}
                                    {profile.kyc?.verificationStatus === 'Verified' && <CheckCircle className="w-6 h-6 text-blue-500 ml-2 fill-current" />}
                                </h1>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">
                                    {isFarmer ? 'Verified Farmer' : 'Registered Buyer'} • {profile.location?.state || 'India'}
                                </p>
                            </div>

                            {/* Reputation Score Big Badge */}
                            <div className="text-center bg-gray-50 px-6 py-4 rounded-2xl border border-gray-200">
                                <div className="text-4xl font-black text-gray-900 flex items-center justify-center">
                                    {stats.avgRating.toFixed(1)} <Star className="w-6 h-6 text-yellow-400 fill-current ml-1" />
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{stats.totalReviews} Verified Reviews</p>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="mt-8 flex space-x-4 border-t border-gray-100 pt-6">
                            {!isOwnProfile && (
                                <button
                                    onClick={handleOpenReview}
                                    className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                                >
                                    <Star className="w-4 h-4 mr-2" /> Write a Review
                                </button>
                            )}
                            <button className="flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">
                                <MessageSquare className="w-4 h-4 mr-2" /> Contact
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Reputation Details */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 flex items-center mb-4"><Shield className="w-5 h-5 mr-2 text-emerald-500" /> Trust Indicators</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">KYC Status</span>
                                    <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Verified</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Member Since</span>
                                    <span className="font-bold text-gray-900">{new Date(userData.createdAt).getFullYear()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Completed Contracts</span>
                                    <span className="font-bold text-gray-900">{profile.trustMetrics?.totalContracts || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Dispute Ratio</span>
                                    <span className={`font-bold ${parseInt(profile.trustMetrics?.disputeRatio) > 5 ? 'text-red-500' : 'text-green-600'}`}>
                                        {profile.trustMetrics?.disputeRatio || '0%'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Contracts could go here */}
                    </div>

                    {/* Right: Reviews Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight mb-4">Reviews & Feedback</h2>

                        {reviews.length === 0 ? (
                            <div className="bg-white p-12 rounded-2xl text-center border border-dashed border-gray-300">
                                <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No reviews yet. Be the first to share your experience!</p>
                            </div>
                        ) : (
                            reviews.map(review => (
                                <div key={review._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center font-bold text-blue-700 mr-3">
                                                {review.reviewer?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{review.reviewer?.name}</p>
                                                <p className="text-xs text-gray-500">{format(new Date(review.createdAt), 'MMM dd, yyyy')}</p>
                                            </div>
                                        </div>
                                        <div className="flex bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-3">"{review.comment}"</p>
                                    <div className="flex items-center text-xs font-bold text-gray-400 bg-gray-50 inline-block px-3 py-1 rounded-full">
                                        <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                        Verified Contract: {review.contract?.cropDetails?.cropName || 'Farming Agreement'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Write Review Modal */}
            {
                showReviewModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                            <h3 className="text-xl font-black text-gray-900 mb-1">Rate your experience</h3>
                            <p className="text-sm text-gray-500 mb-6">Share your feedback to help others.</p>

                            <div className="space-y-4">
                                {/* Star Rating Input */}
                                <div className="flex justify-center space-x-2 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star className={`w-10 h-10 ${star <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                                        </button>
                                    ))}
                                </div>

                                {/* Contract Select */}
                                {eligibleContracts.length > 1 && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Contract</label>
                                        <select
                                            className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                            onChange={(e) => setReviewForm({ ...reviewForm, contractId: e.target.value })}
                                            value={reviewForm.contractId}
                                        >
                                            <option value="">Select a verified contract...</option>
                                            {eligibleContracts.map(c => (
                                                <option key={c._id} value={c._id}>{c.cropDetails?.cropName} ({c.status})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Review</label>
                                    <textarea
                                        className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-32"
                                        placeholder="How was the payment? delivery? communication?"
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    ></textarea>
                                </div>

                                <button
                                    onClick={submitReview}
                                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all"
                                >
                                    Submit Verified Review
                                </button>
                                <button onClick={() => setShowReviewModal(false)} className="w-full py-2 text-gray-400 font-bold hover:text-gray-600 text-sm">Cancel</button>
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
};

export default PublicProfile;
