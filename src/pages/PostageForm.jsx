import { useState, useEffect } from 'react'; // Import hooks for data management
import { motion, AnimatePresence } from 'framer-motion'; // Import motion for adding entry and exit animations
import { ExternalLink, Mailbox, Search, Info, Heart, FileText, MousePointer2, Calculator, ChevronLeft, ChevronRight, X } from 'lucide-react'; // Import visual icons for the page
import { fetchPostage } from '../data'; // Import our data fetching function

export default function PostageForm() { // Define the Postage Form page component
  const [postageData, setPostageData] = useState([]); // State to store our spreadsheet data
  const [loading, setLoading] = useState(true); // Loading state
  const [searchTerm, setSearchTerm] = useState(''); // Local search state for the postage table

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchPostage().then(data => {
      setPostageData(data);
      setLoading(false);
    });
  }, []);

  const filteredData = postageData.filter(row => 
    Object.values(row).some(val => (val + '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  // Change: INDESTRUCTIBLE Flag recognition logic to match Dashboard! 🕵️‍♀️🎯
  const formatTagWithFlag = (tag) => {
    // 1. Cleaner N/A handling! ✨
    if (!tag || tag.toUpperCase() === 'N/A') return <span className="text-gray-300 opacity-40 italic tracking-widest">--</span>;
    
    const t = tag.trim();
    if (!t.toUpperCase().includes('#PCO')) return t; 

    const flags = {
      'kr': '🇰🇷', 'cn': '🇨🇳', 'jp': '🇯🇵', 'th': '🇹🇭',
      'my': '🇲🇾', 'sg': '🇸🇬', 'id': '🇮🇩'
    };

    // 2. Powerful Regex: Finds any 2 letters at the start followed by optional space and #PCO!
    const match = t.match(/^([a-z]{2})\s*#?(PCO\d+)/i);
    
    if (match) {
      const countryCode = match[1].toLowerCase();
      const restOfTag = match[2].toUpperCase();
      if (flags[countryCode]) {
        return (
          <span className="inline-flex items-center gap-1.5 align-middle">
            <span className="text-[17px] leading-none mb-0.5">{flags[countryCode]}</span>
            <span className="uppercase text-pink-600 dark:text-pink-400 font-bold tracking-tighter">#{restOfTag}</span>
          </span>
        );
      }
    }

    return t;
  };

  const statusColors = (status) => {
    const s = (status + '').toUpperCase();
    
    // 1. Ready - Blue
    if (s.includes('READY')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    
    // 2. OTW - Pink
    if (s.includes('OTW')) return 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-100 dark:border-pink-800';
    
    // 3. Shipped - Light Green
    if (s.includes('SHIPPED')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
    
    // 4. Completed - Darker Green
    if (s.includes('COMPLETED')) return 'bg-green-600 text-white dark:bg-green-800 dark:text-green-100 border-green-500 shadow-sm';
    
    // 5. Hold - Yellow
    if (s.includes('HOLD')) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    
    // 6. Problem - Red
    if (s.includes('PROBLEM')) return 'bg-red-500 text-white shadow-md shadow-red-200 dark:shadow-none border-red-400';
    
    // 7. Arrived - Purple
    if (s.includes('ARRIVED')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    
    // 8. Others - Gray
    return 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 border-gray-200 dark:border-gray-700';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      className="space-y-10"
    >
      {/* The "Journey Layout" */}
      <div className="flex flex-col lg:flex-row items-stretch gap-6 mt-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 glass rounded-3xl p-6 text-center space-y-4 flex flex-col justify-center border-pink-50/50 dark:border-pink-900/30">
          <div className="w-14 h-14 bg-pink-200/30 dark:bg-pink-800/30 text-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm"><Search size={28} /></div>
          <div className="space-y-1">
            <h4 className="font-black text-gray-700 dark:text-gray-100 text-[13px] uppercase tracking-wide ">1. Search Name</h4>
            <p className="text-[11px] text-gray-400 dark:text-gray-300 font-bold leading-tight">Check your items below!</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-[1.5] glass rounded-3xl p-8 text-center shadow-xl shadow-pink-200/50 dark:shadow-none relative overflow-hidden border-pink-100 dark:border-pink-900/50"> 
          <div className="w-16 h-16 bg-pink-200/30 dark:bg-pink-800/30 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 scale-110 shadow-sm"><Mailbox size={32} /></div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 font-header uppercase tracking-tight relative z-10">Postage 📮</h2>
          <h4 className="text-[13px] text-gray-700 dark:text-gray-100 mb-6 font-black uppercase tracking-wide">2. Submit Postage Form</h4>
          <div className="space-y-3 relative z-10">
            <a href="https://forms.gle/4NbT1DP6ZgDahYLs6" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-3 w-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-[12px] py-3 rounded-xl transition-all shadow-md active:scale-95 border border-pink-400/30 tracking-tight uppercase">
              <span>Fill Google Form</span><ExternalLink size={14} className="group-hover:rotate-12 transition-transform" />
            </a>
            <a href="https://docs.google.com/spreadsheets/d/1qxfSyjii5sBFWEYC7xNytYa860hPfjeFPFHCCtxVSAU/edit?gid=1319480873#gid=1319480873" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-3 w-full bg-white dark:bg-pink-950/20 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/40 font-bold text-[11px] py-2.5 rounded-xl transition-all border border-pink-100 dark:border-pink-800/50 shadow-sm tracking-tight text-center uppercase">
              <span>Postage Fee Calculator</span><Calculator size={14} className="group-hover:rotate-12 transition-transform" />
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 glass rounded-3xl p-6 text-center space-y-4 flex flex-col justify-center border-pink-50/50 dark:border-pink-900/30">
          <div className="w-14 h-14 bg-pink-200/30 dark:bg-pink-800/30 text-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm"><Heart size={28} className="fill-pink-500 animate-pulse" /></div>
          <div className="space-y-1">
            <h4 className="font-black text-gray-700 dark:text-gray-100 text-[13px] uppercase tracking-wide">3. Share The Love</h4>
            <p className="text-[11px] text-gray-400 dark:text-gray-300 font-bold leading-tight">Tell us about your mail!</p>
          </div>
          <a href="https://t.me/luvlock/3803" target="_blank" className="group inline-flex items-center justify-center gap-2 w-full bg-white dark:bg-pink-950/20 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/50 font-bold text-[11px] py-2.5 rounded-xl transition-all border border-pink-100 dark:border-pink-800/50 shadow-sm tracking-tight uppercase">
             <span>Leave a Review</span><ExternalLink size={10} className="group-hover:rotate-12 transition-transform" />
          </a>
        </motion.div>
      </div>

      {/* Postage Table Section */}
      <div className="glass rounded-3xl shadow-xl shadow-pink-100/50 dark:shadow-none flex flex-col overflow-hidden border border-pink-100 dark:border-pink-900/30">
        <div className="p-4 md:p-5 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-pink-100 dark:border-pink-900/30 pb-6 uppercase tracking-tight">
            <div className="text-center md:text-left w-full md:w-auto">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex justify-center md:justify-start items-center gap-2 font-header">Postage Status</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-black tracking-wide opacity-50">Check your items before submitting the form!</p>
            </div>
            <div className="relative w-full md:w-64">
              <input type="text" placeholder="Search @username..." className="w-full bg-pink-50/50 dark:bg-pink-950/20 border-2 border-pink-200 dark:border-pink-700/50 rounded-2xl py-2.5 px-4 pl-10 outline-none focus:border-pink-400 text-sm font-medium transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              {searchTerm ? (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-pink-300 hover:text-pink-500"><X size={18} /></button>
              ) : (
                <Search className="absolute left-3 top-2.5 text-pink-300 opacity-50" size={18} />
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl relative">
            <AnimatePresence mode="wait">
              {loading ? (
                 <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center text-pink-400/50 font-bold uppercase tracking-widest text-[10px] animate-pulse">Syncing Database...</motion.div>
              ) : searchTerm.trim().length < 3 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                  className="py-20 text-center space-y-3"
                >
                  <div className="w-16 h-16 bg-pink-50 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto text-pink-300 dark:text-pink-400/30">
                    <Search size={30} className="animate-pulse" />
                  </div>
                  <p className="text-gray-400 dark:text-gray-500 font-bold italic text-xs uppercase tracking-widest">Searching records...</p>
                </motion.div>
              ) : (
                <motion.div key="table" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="flex justify-between items-center px-1">
                     <h4 className="text-[10px] font-black text-pink-400 uppercase tracking-widest flex items-center gap-1.5 opacity-80"><FileText size={12} /> Results</h4>
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Records found: {filteredData.length}</span>
                  </div>
                  
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-pink-500 text-white text-[10px] font-black uppercase tracking-widest border-b border-pink-100/50 dark:border-pink-900/50 leading-none">
                        <th className="py-5 px-5 rounded-tl-2xl whitespace-nowrap">Tag</th>
                        <th className="py-5 px-5 whitespace-nowrap">Username</th>
                        <th className="py-5 px-5 whitespace-nowrap">Specification</th>
                        <th className="py-5 px-5 text-center whitespace-nowrap">Qtt</th>
                        <th className="py-5 px-5 rounded-tr-2xl text-center whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-[12px] font-medium">
                      {currentItems.length === 0 ? (
                        <tr><td colSpan="5" className="py-12 text-center text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest text-[10px] italic">No matches for "{searchTerm}" 🧸</td></tr>
                      ) : (
                        currentItems.map((row, i) => (
                          <tr key={i} className="border-b border-pink-50/50 dark:border-pink-900/10 hover:bg-pink-50/30 dark:hover:bg-pink-950/10 transition-colors">
                            <td className="py-5 px-5 text-pink-600 dark:text-pink-400 font-black tracking-tight tracking-tight">
                               {/* Change: Tag with Flag Logic Sync and N/A cleanup! 🕵️‍♀️🎯 */}
                               {formatTagWithFlag(row.TAG || row.CODE)}
                            </td>
                            <td className="py-5 px-5 text-gray-700 dark:text-gray-200 font-black tracking-tight">{row.USERNAME?.startsWith('@') ? row.USERNAME : `@${row.USERNAME}`}</td>
                            <td className="py-5 px-5 text-gray-800 dark:text-gray-200 font-body leading-snug">{toTitleCase(row.SPECIFICATION) ||'--'}</td>
                            <td className="py-5 px-5 text-gray-500 dark:text-gray-400 font-bold text-center">{row.QTT || '--'}</td>
                            <td className="py-5 px-5 text-center">
                              <span className={`px-2 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-sm whitespace-nowrap inline-block min-w-[100px] border ${statusColors(row.STATUS)}`}>
                                {row.STATUS || 'PENDING'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Pagination Section */}
        <div className="bg-pink-50/50 dark:bg-pink-950/20 px-6 py-4 border-t border-pink-100 dark:border-pink-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-[10px] font-black uppercase text-pink-400 tracking-widest leading-none">Display:</label>
            <select value={itemsPerPage} onChange={(e) => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}} className="bg-white dark:bg-pink-900/30 border border-pink-100 dark:border-pink-800 px-2 py-1.5 rounded-lg text-xs font-bold text-pink-500 outline-none">
              {[10, 25, 50, 100].map(val => <option key={val} value={val}>{val}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-xl border border-pink-100 dark:border-pink-900/50 bg-white dark:bg-pink-900/20 text-pink-500 disabled:opacity-30 disabled:pointer-events-none hover:bg-pink-50 transition-all active:scale-90"><ChevronLeft size={16} /></button>
            <div className="px-4 py-1.5 bg-pink-500 text-white rounded-xl text-xs font-black shadow-md shadow-pink-200/50 dark:shadow-none">Page {currentPage} of {totalPages || 1}</div>
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-xl border border-pink-100 dark:border-pink-900/50 bg-white dark:bg-pink-900/20 text-pink-500 disabled:opacity-30 disabled:pointer-events-none hover:bg-pink-50 transition-all active:scale-90"><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Status Legend */}
        <div className="bg-pink-50/10 dark:bg-pink-950/20 px-6 py-3 border-t border-pink-100 dark:border-pink-900/30 flex flex-wrap items-center gap-x-4 gap-y-2 uppercase tracking-widest opacity-80">
           <p className="text-[9px] font-black text-gray-400 dark:text-gray-500">Key:</p>
           {[
             { l: "Ready", c: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
             { l: "OTW", c: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300" },
             { l: "Shipped", c: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
             { l: "Completed", c: "bg-green-600 text-white dark:bg-green-800" },
             { l: "Arrived", c: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" }
           ].map((item, i) => (
             <span key={i} className={`text-[8px] font-black px-1.5 py-0.5 rounded-lg border border-transparent ${item.c}`}>{item.l}</span>
           ))}
        </div>
      </div>
    </motion.div>
  );
}
