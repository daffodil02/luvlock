import { useState, useEffect } from 'react'; // Import React hooks for managing local state and side effects
import { motion, AnimatePresence } from 'framer-motion'; // Import animation components for smooth UI transitions
import { Search, Loader2, SearchX, Box, Star, AlertCircle, Info, Filter, X, ExternalLink, ChevronLeft, ChevronRight, Heart, List, MapPin } from 'lucide-react'; // Change: Added Heart, List, and MapPin! 🕵️‍♀️🎯
import { fetchOrders } from '../data'; // Import our custom data fetching function

export default function Dashboard() { // Main Dashboard component
  const [searchTerm, setSearchTerm] = useState(''); // State for the search box input text
  const [orders, setOrders] = useState([]); // State to store the full list of orders from the sheet
  const [searchResults, setSearchResults] = useState([]); // State for orders matching the username search 
  const [displayedOrders, setDisplayedOrders] = useState([]); // State for orders after applying secondary filters
  const [isLoading, setIsLoading] = useState(true); // State to show/hide the loading spinner
  const [showGuide, setShowGuide] = useState(false); // Change: Toggle state for Roadmap! 🕵️‍♀️🎯

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter States
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [codeFilter, setCodeFilter] = useState('all'); 
  const [paymentFilter, setPaymentFilter] = useState('all'); 

  useEffect(() => { // This effect runs once when the page first loads
    fetchOrders().then((data) => { 
      setOrders(data); 
      setSearchResults(data); 
      setIsLoading(false); 
    });
  }, []); 

  useEffect(() => {
    let filtered = [...searchResults]; 
    if (statusFilter !== 'all') filtered = filtered.filter(o => o.STATUS?.toLowerCase() === statusFilter.toLowerCase());
    if (codeFilter !== 'all') filtered = filtered.filter(o => (o.TAG || o.CODE) === codeFilter);
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(o => {
        const p1 = o['1ST']?.toUpperCase() === 'PAID';
        const p2 = o['2ND']?.toUpperCase() === 'PAID';
        const isLC = (o.TAG || o.CODE)?.includes('LC');
        if (paymentFilter === 'unpaid') return !p1 || (!p2 && !isLC);
        if (paymentFilter === 'paid') return p1 && (p2 || isLC);
        return true;
      });
    }
    setDisplayedOrders(filtered); 
    setCurrentPage(1); 
  }, [searchResults, statusFilter, codeFilter, paymentFilter, orders]); 

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayedOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayedOrders.length / itemsPerPage);

  const handleSearch = (e) => { 
    if (e) e.preventDefault(); 
    if (!searchTerm.trim()) { setSearchResults(orders); resetFilters(); return; }
    const isBatchSearch = searchTerm.trim().startsWith('#'); 
    const results = orders.filter((order) => {
      const term = searchTerm.toLowerCase().trim();
      if (isBatchSearch) return (order.TAG || order.CODE)?.toLowerCase().includes(term); 
      return order.USERNAME?.toLowerCase().includes(term); 
    });
    setSearchResults(results); 
    resetFilters(); 
  };

  const resetFilters = () => { setStatusFilter('all'); setCodeFilter('all'); setPaymentFilter('all'); };

  const uniqueStatuses = [...new Set(searchResults.map(o => o.STATUS).filter(Boolean))];
  const uniqueCodes = [...new Set(searchResults.map(o => o.TAG || o.CODE).filter(Boolean))];

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  // Change: INDESTRUCTIBLE Flag recognition logic! 🕵️‍♀️🎯
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
    const s = (status || '').toLowerCase();
    
    // 1. Ready/Secured - Blue
    if (s.includes('secured')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    
    // 2. Arrived (PA, WH, Proxy) - Purple
    if (s.includes('arrived')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    
    // 3. Shipped/OTW - Green Light shade match
    if (s.includes('shipped')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
    
    // 4. OTW Logic - Pink
    if (s.includes('otw')) return 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-100 dark:border-pink-800';
    
    // 5. COMPLETED - Custom Green
    if (s.includes('completed')) return 'bg-green-500 text-white shadow-sm shadow-green-200 dark:shadow-none';

    // 6. CANCELLED - Red Alert! 
    if (s.includes('cancelled')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';

    return 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 border-gray-200 dark:border-gray-700';
  };

  const totalItems = searchResults.reduce((sum, o) => sum + parseInt(o.QTT || 1), 0);
  const arrivedItems = searchResults.filter(o => {
    const s = o.STATUS?.toLowerCase() || '';
    return s.includes('arrived pa') || s.includes('ready') || s.includes('shipped');
  }).reduce((sum, o) => sum + parseInt(o.QTT || 1), 0);
  
  const arrivalProgress = totalItems > 0 ? Math.round((arrivedItems / totalItems) * 100) : 0;
  const otwItems = totalItems - arrivedItems;
  const isBatchMode = searchTerm.trim().startsWith('#') && searchResults.length < orders.length;

  const getSmartDate = (obj, keyword) => {
    if (!obj) return '-';
    const key = Object.keys(obj).find(k => k.includes(keyword.toUpperCase()));
    const val = key ? obj[key] : null;
    if (!val || val.trim() === '-' || val.trim().toLowerCase() === 'tba') return '-';
    return toTitleCase(val);
  };

  const estShipment = getSmartDate(searchResults[0], 'SHIP');
  const estArrival = getSmartDate(searchResults[0], 'ARRIV');

  const PaymentStatus = ({ status, isLC }) => {
    if (isLC) return <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto opacity-50" title="Not applicable" />; 
    const isPaid = status?.toUpperCase() === 'PAID'; 
    return <div className={`w-3 h-3 rounded-full mx-auto shadow-sm transition-all duration-500 ${isPaid ? 'bg-green-500 shadow-green-200 dark:shadow-green-900/20' : 'bg-red-400 shadow-red-200 dark:shadow-red-910/20'}`} title={status || 'Unpaid'} />;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header Banner */}
      <div className="bg-pink-500 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-pink-200/80 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] opacity-15 text-9xl transform rotate-12">🔒</div>
        <div className="absolute bottom-[-10%] left-[-5%] opacity-15 text-9xl transform -rotate-12">💖</div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2 text-white uppercase tracking-tight font-header">Masterlist 🎀</h1>
          <p className="text-pink-100 font-medium text-xs uppercase tracking-wider opacity-90 mb-4">Your items are making their way to you!</p>
          <div className="flex flex-wrap items-center gap-3">
            {/* <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-semibold uppercase tracking-widest">
              <AlertCircle size={14} /> <span>Your treasures are making their way to you! </span>
            </div> */}
            {/* Change: Stylish Guide Toggle Button! 🕵️‍♀️🎯 */}
            <button 
              onClick={() => setShowGuide(!showGuide)}
              className="inline-flex items-center gap-2 bg-white text-pink-500 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-pink-50 transition-all active:scale-95 shadow-lg"
            >
              <Info size={14} /> <span>{showGuide ? 'Close Guide' : 'Portal Guide'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Change: Luvlock Roadmap wrapped in AnimatePresence for smooth sliding! 🕵️‍♀️🎯 */}
      <AnimatePresence>
        {showGuide && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden"
          >
            <motion.div 
              whileHover={{ y: -5 }}
              className="glass rounded-2xl p-4 border-pink-100 dark:border-pink-900/30 flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center flex-shrink-0 group-hover:bg-pink-500 group-hover:text-white transition-all">
                <Heart size={20} fill="currentColor" fillOpacity={0.1} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-black uppercase text-pink-500 tracking-wider">1. Masterlist</h4>
                <p className="text-[10px] text-gray-400 dark:text-gray-300 font-bold leading-tight">Track your order here. Seach your @username or #tag to see your order status.</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="glass rounded-2xl p-4 border-blue-100 dark:border-blue-900/30 flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <List size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-black uppercase text-blue-500 tracking-wider">2. Ongoing GOs</h4>
                <p className="text-[10px] text-gray-400 dark:text-gray-300 font-bold leading-tight">Check out new GOs available, join them and secure your claims!</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="glass rounded-2xl p-4 border-purple-100 dark:border-purple-900/30 flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <MapPin size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-black uppercase text-purple-500 tracking-wider">3. Postage</h4>
                <p className="text-[10px] text-gray-400 dark:text-gray-300 font-bold leading-tight">Items arrived to PA? That means your items are ready to be shipped! Click the Postage page to checkout for delivery.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter Section */}
      <div className="glass rounded-3xl p-5 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-sm font-bold text-pink-500 dark:text-pink-400 ml-1">Search Username or Tag</label>
            <form onSubmit={handleSearch} className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Search @username or #tag"
                className="w-full bg-pink-50/50 dark:bg-pink-900/10 border-2 border-pink-200 dark:border-pink-700/50 focus:border-pink-600 dark:focus:border-pink-500 outline-none focus:ring focus:ring-pink-200 dark:focus:ring-pink-900 focus:ring-opacity-50 rounded-2xl py-3 px-4 pr-12 text-gray-700 dark:text-gray-200 font-medium transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="group absolute right-2 bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-xl transition-all active:scale-95">
                <Search size={18} className="group-hover:rotate-12 transition-transform" />
              </button>
            </form>
          </div>
          {searchTerm && (
            <button onClick={() => {setSearchTerm(''); setSearchResults(orders);}} className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 shadow-sm"><X size={20} /></button>
          )}
        </div>

        {searchTerm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 border-t border-pink-100 dark:border-pink-900/30 flex flex-wrap gap-3">
            <div className="flex-1 min-w-[140px] space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-pink-400 ml-1">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-white dark:bg-pink-950/20 border border-pink-200 dark:border-pink-700/50 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-pink-400">
                <option value="all">All Statuses</option>
                {uniqueStatuses.map(s => <option key={s} value={s}>{toTitleCase(s)}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[140px] space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-pink-400 ml-1">Batch / GO</label>
              <select value={codeFilter} onChange={(e) => setCodeFilter(e.target.value)} className="w-full bg-white dark:bg-pink-950/20 border border-pink-200 dark:border-pink-700/50 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-pink-400">
                <option value="all">All Batches</option>
                {uniqueCodes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[140px] space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-pink-400 ml-1">Payment</label>
              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="w-full bg-white dark:bg-pink-950/20 border border-pink-200 dark:border-pink-700/50 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-pink-400">
                <option value="all">Any Payment</option>
                <option value="paid">Fully Paid</option>
                <option value="unpaid">Has Unpaid</option>
              </select>
            </div>
            <button onClick={resetFilters} className="self-end px-4 py-2 text-xs font-bold text-pink-500 hover:text-pink-600 transition-colors uppercase">Reset All</button>
          </motion.div>
        )}
      </div>

      {/* Summary Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {!searchTerm ? null : isBatchMode ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <div className="glass rounded-3xl p-5 flex flex-col items-center justify-center text-center space-y-1 border-pink-100 dark:border-pink-900/30">
                <span className="text-[10px] font-bold uppercase text-pink-400 tracking-wider">Current Status</span>
                <span className="text-xl font-black text-gray-800 dark:text-gray-100 leading-tight">{toTitleCase(searchResults[0]?.STATUS || 'Processing')}</span>
                <div className="w-8 h-1 bg-pink-100 dark:bg-pink-900/30 rounded-full" />
              </div>
              <div className="glass rounded-3xl p-5 border-blue-100 dark:border-blue-900/30 flex flex-col items-center justify-center text-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-blue-500 tracking-wider">Est. Shipment ✈️</span>
                <span className="text-xl font-black text-gray-800 dark:text-gray-100 leading-tight">{estShipment}</span>
              </div>
              <div className="glass rounded-3xl p-5 border-purple-100 dark:border-purple-900/30 flex flex-col items-center justify-center text-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-purple-500 tracking-wider">Est. Arrival 🏠</span>
                <span className="text-xl font-black text-gray-800 dark:text-gray-100 leading-tight">{estArrival}</span>
              </div>
            </div>
            {/* Arrival Progress Bar */}
            <div className="glass rounded-3xl p-6 border-pink-100 dark:border-pink-900/30 relative overflow-hidden group">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: `${arrivalProgress}%` }} 
                 className="absolute inset-y-0 left-0 bg-pink-500/10 dark:bg-pink-400/5 z-0 transition-colors group-hover:bg-pink-500/15"
               />
               <div className="flex justify-between items-end mb-4 relative z-10">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase text-pink-400 tracking-widest">Arrival Progress</h4>
                    <p className="text-2xl font-black text-pink-600 dark:text-pink-400">{arrivalProgress}% Complete</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{arrivedItems} of {totalItems} Items Arrived</span>
               </div>
               <div className="h-4 bg-pink-50 dark:bg-pink-900/20 rounded-full overflow-hidden relative border border-pink-100 dark:border-pink-900/50 z-10">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${arrivalProgress}%` }} className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-400 to-pink-600 dark:from-pink-500 dark:to-pink-700 shadow-sm" />
               </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="glass rounded-3xl p-4 md:p-5 flex flex-col items-center justify-center text-center space-y-1 border-pink-100 dark:border-pink-900/30">
               <span className="text-[10px] font-bold uppercase text-pink-400">Total Items</span>
               <span className="text-2xl md:text-3xl font-black text-gray-800 dark:text-gray-100">{totalItems}</span>
               <div className="w-6 h-1 bg-pink-100 dark:bg-pink-900/30 rounded-full" />
            </div>
            <div className="glass rounded-3xl p-4 md:p-5 flex flex-col items-center justify-center text-center space-y-1 border-blue-100 dark:border-blue-900/30">
               <span className="text-[10px] font-bold uppercase text-blue-500">On The Way ✈️</span>
               <span className="text-2xl md:text-3xl font-black text-gray-800 dark:text-gray-100">{otwItems}</span>
               <div className="w-6 h-1 bg-blue-100 dark:bg-blue-900/30 rounded-full" />
            </div>
            <div className="glass rounded-3xl p-4 md:p-5 flex flex-col items-center justify-center text-center space-y-1 border-green-100 dark:border-green-900/30">
               <span className="text-[10px] font-bold uppercase text-green-500">Arrived 🏠</span>
               <span className="text-2xl md:text-3xl font-black text-gray-800 dark:text-gray-100">{arrivedItems}</span>
               <div className="w-6 h-1 bg-green-100 dark:bg-green-900/30 rounded-full" />
            </div>
            <div className="glass rounded-3xl p-4 md:p-5 flex flex-col items-center justify-center text-center border-pink-100 dark:border-pink-900/30 relative overflow-hidden">
               <motion.div initial={{ height: 0 }} animate={{ height: `${arrivalProgress}%` }} className="absolute inset-x-0 bottom-0 bg-pink-500/10 dark:bg-pink-400/10 z-0" />
               <span className="text-[10px] font-bold uppercase text-pink-500 relative z-10">Progress</span>
               <span className="text-3xl font-black text-pink-600 relative z-10">{arrivalProgress}%</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 uppercase tracking-tight text-sm">
            <Box size={18} className="text-pink-500" />
            {searchTerm ? 'Search Results' : 'Welcome to the Masterlist 🎀'}
          </h3>
          {searchTerm && (
            <span className="text-[10px] font-bold text-pink-400 dark:text-pink-500 uppercase tracking-widest">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, displayedOrders.length)} of {displayedOrders.length}
            </span>
          )}
        </div>
        
        {isLoading ? (
          <div className="glass rounded-3xl p-12 flex flex-col items-center justify-center text-pink-400/50 dark:text-pink-400/30 animate-pulse"><Loader2 className="animate-spin mb-4" size={32} /><p className="font-black uppercase tracking-widest text-[10px]">Syncing Database...</p></div>
        ) : !searchTerm ? (
          <div className="glass rounded-3xl p-12 flex flex-col items-center justify-center text-center border-dashed border-pink-200 dark:border-pink-900/30 bg-pink-50/20 dark:bg-pink-900/5 h-64 gap-3">
             <Search size={36} className="text-pink-400/60 dark:text-pink-400/30 mb-2" />
             <h3 className="text-lg font-black uppercase tracking-widest text-pink-500 dark:text-pink-400">Search to View Orders</h3>
             <p className="font-bold text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500">Type your @username or #tag above to reveal your items! ✨</p>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="glass rounded-3xl p-10 flex flex-col items-center text-center text-gray-500 border-dashed border-pink-200 dark:border-pink-900/50"><SearchX size={32} className="text-pink-300 mb-4 opacity-50" /><p className="italic text-sm">No items match your search ✨</p></div>
        ) : (
          <div className="glass rounded-3xl shadow-xl shadow-pink-100/50 dark:shadow-none border border-pink-100 dark:border-pink-900/30 overflow-hidden flex flex-col">
            <div className="p-3 md:p-5 flex flex-col gap-6">
              <div className="overflow-x-auto rounded-2xl relative">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-pink-500 text-white text-[10px] uppercase font-black tracking-widest leading-none">
                      <th className="px-5 py-5 rounded-tl-2xl whitespace-nowrap">Tag</th>
                      <th className="px-5 py-5 whitespace-nowrap">User</th>
                      <th className="px-5 py-5 whitespace-nowrap">Specification</th>
                      <th className="px-5 py-5 text-center whitespace-nowrap">Qtt</th>
                      <th className="px-4 py-5 text-center whitespace-nowrap">1st</th>
                      <th className="px-4 py-5 text-center whitespace-nowrap">2nd</th>
                      <th className="px-5 py-5 text-center whitespace-nowrap">Status</th>
                      <th className="px-5 py-5 rounded-tr-2xl text-center whitespace-nowrap">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50/50 dark:divide-pink-900/10">
                    {currentItems.map((order, idx) => {
                      const isLC = (order.TAG || order.CODE)?.includes('LC');
                      const linkVal = order.REMARKS || order.FINAL_LINK || order.LINK || order.URL || order.TELEGRAM;
                      const hasLink = linkVal && (linkVal.startsWith('http') || linkVal.startsWith('t.me'));

                      return (
                        <tr key={idx} className="hover:bg-pink-50/50 dark:hover:bg-pink-900/10 transition-colors text-[12px]">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="font-bold text-pink-600 dark:text-pink-400">
                               {/* Change: Tag with Flag Logic! 🕵️‍♀️🎯 */}
                               {formatTagWithFlag(order.TAG || order.CODE)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap font-bold text-gray-700 dark:text-gray-200">{order.USERNAME?.startsWith('@') ? order.USERNAME : `@${order.USERNAME}`}</td>
                          <td className="px-4 py-4"><p className="text-gray-800 dark:text-gray-200 font-medium leading-tight">{toTitleCase(order.SPECIFICATION) || '—'}</p></td>
                          <td className="px-4 py-4 text-center font-bold text-gray-500 dark:text-gray-400">{order.QTT || '1'}</td>
                          <td className="px-3 py-4 text-center"><PaymentStatus status={order['1ST']} /></td>
                          <td className="px-3 py-4 text-center"><PaymentStatus status={order['2ND']} isLC={isLC} /></td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className={`px-2 py-0.5 rounded-xl text-[10px] font-black uppercase border shadow-sm whitespace-nowrap inline-block min-w-[100px] ${statusColors(order.STATUS)}`}>
                              {order.STATUS}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">{hasLink ? (<a href={linkVal.startsWith('t.me') ? `https://${linkVal}` : linkVal} target="_blank" rel="noopener noreferrer" className="group inline-flex p-1.5 bg-pink-50 dark:bg-pink-950/20 text-pink-500 rounded-lg hover:bg-pink-500 hover:text-white transition-all active:scale-90 shadow-sm"><ExternalLink size={14} className="group-hover:rotate-12 transition-transform" /></a>) : (<span className="text-gray-300">—</span>)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="bg-pink-50/50 dark:bg-pink-950/20 px-6 py-4 border-t border-pink-100 dark:border-pink-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black uppercase text-pink-400 tracking-widest">Per Page:</label>
                <select value={itemsPerPage} onChange={(e) => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}} className="bg-white dark:bg-pink-900/30 border border-pink-100 dark:border-pink-800 px-2 py-1 rounded-lg text-xs font-bold text-pink-500 outline-none">
                  {[10, 25, 50, 100].map(val => <option key={val} value={val}>{val}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-xl border border-pink-100 dark:border-pink-900/50 bg-white dark:bg-pink-900/20 text-pink-500 disabled:opacity-30 disabled:pointer-events-none hover:bg-pink-50 transition-all active:scale-90"><ChevronLeft size={16} /></button>
                <div className="px-4 py-1.5 bg-pink-500 text-white rounded-xl text-xs font-black shadow-md shadow-pink-200/50 dark:shadow-none">Page {currentPage} of {totalPages || 1}</div>
                <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-xl border border-pink-100 dark:border-pink-900/50 bg-white dark:bg-pink-900/20 text-pink-500 disabled:opacity-30 disabled:pointer-events-none hover:bg-pink-50 transition-all active:scale-90"><ChevronRight size={16} /></button>
              </div>
            </div>

            <div className="bg-pink-50/10 dark:bg-pink-950/30 px-6 py-3 border-t border-pink-100 dark:border-pink-900/30 flex flex-wrap items-center gap-4 text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">
               <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200/50 dark:shadow-none" /> Paid</div>
               <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm shadow-red-100/50 dark:shadow-none" /> Unpaid</div>
               <div className="ml-auto text-pink-400/80 flex items-center gap-1"><Info size={12} /> Live Sync Active</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
