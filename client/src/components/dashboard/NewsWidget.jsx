import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Loader2, RefreshCw } from 'lucide-react';

const NewsWidget = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/news');
            const data = await res.json();
            if (data.success) {
                setNews(data.data);
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error("News Load Failed", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    return (
        <div className="h-full flex flex-col bg-transparent rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header - Official Dark Blue Style */}
            <div className="px-6 py-5 border-b border-[#082a63] flex justify-between items-center bg-[#0B3D91] sticky top-0 z-10">
                <div className="flex items-center space-x-3 text-white">
                    <div className="p-2.5 bg-white/10 rounded-xl shadow-inner border border-white/20 backdrop-blur-sm">
                        <Newspaper className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg font-serif tracking-wide">Agri-News & Updates</h3>
                        <div className="w-12 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded-full mt-1.5 opacity-90"></div>
                    </div>
                </div>
                <button
                    onClick={fetchNews}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 border border-transparent rounded-lg transition-all"
                    title="Refresh News"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-white' : ''}`} />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative bg-[#F8F9FA]">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#F8F9FA]/80 z-10 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 animate-spin text-[#0B3D91]" />
                    </div>
                )}

                {!loading && error && (
                    <div className="flex items-center justify-center h-full text-center p-6 text-gray-500 text-sm">
                        <div>
                            <p className="mb-2">Unable to load live updates.</p>
                            <button onClick={fetchNews} className="text-[#0B3D91] font-bold px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">Retry Connection</button>
                        </div>
                    </div>
                )}

                {!loading && !error && (
                    <div className="space-y-3">
                        {news.map((item, index) => (
                            <a
                                key={index}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-[#0B3D91] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <h4 className="text-[15px] font-bold text-gray-800 leading-snug group-hover:text-[#0B3D91] line-clamp-2">
                                        {item.title}
                                    </h4>
                                    <div className="bg-gray-50 p-1.5 rounded-full border border-gray-100 group-hover:bg-[#0B3D91] group-hover:border-[#0B3D91] group-hover:text-white text-gray-400 transition-all flex-shrink-0">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4 text-xs font-semibold">
                                    <span className="bg-[#FFF5E5] text-[#CC6600] px-2.5 py-1 rounded-md border border-[#FFE0B2]">
                                        {item.source}
                                    </span>
                                    <span className="text-gray-500 flex items-center">
                                        <span className="w-1 h-1 bg-gray-300 rounded-full mx-2"></span>
                                        {new Date(item.pubDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer with Live Status Ping */}
            <div className="py-3.5 px-6 bg-white border-t border-gray-200 flex justify-center items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] z-10">
                <div className="flex items-center gap-2 bg-[#F0FDF4] px-4 py-1.5 rounded-full border border-[#DCFCE7] shadow-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]"></span>
                    </span>
                    <span className="text-[10px] text-[#16A34A] uppercase tracking-widest font-extrabold items-center flex">Live Data Feed</span>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }
            `}</style>
        </div>
    );
};

export default NewsWidget;
