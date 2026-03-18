import { useState, useEffect } from 'react'; // Import React hooks for managing local state and side effects
import { motion, AnimatePresence } from 'framer-motion'; // Import animation components for smooth UI transitions
import { Search, Loader2, SearchX, Box, Star, AlertCircle, Info, Filter, X, ExternalLink } from 'lucide-react'; // Import icons from Lucide library
import { fetchOrders } from '../data'; // Import our custom data fetching function

export default function Dashboard() { // Main Dashboard component
  const [searchTerm, setSearchTerm] = useState(''); // State for the search box input text
  const [orders, setOrders] = useState([]); // State to store the full list of orders from the sheet
  const [searchResults, setSearchResults] = useState(null); // State for orders matching the username search
  const [displayedOrders, setDisplayedOrders] = useState([]); // State for orders after applying secondary filters
  const [isLoading, setIsLoading] = useState(true); // State to show/hide the loading spinner

  // Filter States: These track the currently selected options in the dropdown menus
  const [statusFilter, setStatusFilter] = useState('all'); // Filter for order status (e.g., Shipped)
  const [codeFilter, setCodeFilter] = useState('all'); // Filter for specific Group Order codes
  const [paymentFilter, setPaymentFilter] = useState('all'); // Filter for payment status (Paid/Unpaid)

  useEffect(() => { // This effect runs once when the page first loads
    fetchOrders().then((data) => { // Call our data fetcher
      setOrders(data); // Save the fetched data to our 'orders' state
      setIsLoading(false); // Stop showing the loading spinner
    });
  }, []); // [] means no dependencies, so it only runs on mount

  // When search results or filters change, recalculate what to display in the table
  useEffect(() => {
    if (!searchResults) { // If the user hasn't searched for a username yet
      setDisplayedOrders([]); // Show nothing in the display table
      return;
    }

    let filtered = [...searchResults]; // Start with a fresh copy of the search results

    // Apply Status Filter if it's not set to 'all'
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.STATUS?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Apply Code Filter if it's not set to 'all'
    if (codeFilter !== 'all') {
      filtered = filtered.filter(o => o.CODE === codeFilter);
    }

    // Apply Payment Filter logic
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(o => {
        const p1 = o['1ST']?.toUpperCase() === 'PAID'; // Check if 1st payment is done
        const p2 = o['2ND']?.toUpperCase() === 'PAID'; // Check if 2nd payment is done
        const isLC = o.CODE?.includes('LC'); // 'LC' items usually don't have a 2nd payment
        
        if (paymentFilter === 'unpaid') {
          // Unpaid if 1st is not paid OR (2nd is not paid AND it's not an LC item)
          return !p1 || (!p2 && !isLC);
        }
        if (paymentFilter === 'paid') {
          // Fully paid if 1st is paid AND (2nd is paid OR it's an LC item)
          return p1 && (p2 || isLC);
        }
        return true;
      });
    }

    setDisplayedOrders(filtered); // Update the state with our final filtered list
  }, [searchResults, statusFilter, codeFilter, paymentFilter]); // Re-run whenever any of these values change

  const handleSearch = (e) => { // Triggered when user submits the search form
    e.preventDefault(); // Prevent the browser from reloading the page
    if (!searchTerm.trim()) { // If the search box is empty
      setSearchResults(null); // Clear search results
      resetFilters(); // Reset all dropdowns
      return;
    }
    // --- Requirement #2: Switch between User and Batch search mode ---
    const isBatchSearch = searchTerm.trim().startsWith('#'); // Check if the user is searching for a tag (e.g., #JMEE15)
    
    // Perform the filter based on either USERNAME or batch CODE
    const results = orders.filter((order) => {
      const term = searchTerm.toLowerCase().trim();
      if (isBatchSearch) return order.CODE?.toLowerCase().includes(term); // Batch match
      return order.USERNAME?.toLowerCase().includes(term); // Username match
    });

    setSearchResults(results); // Save the matches to results state
    resetFilters(); // Reset dropdowns whenever a new search is performed
  };

  const resetFilters = () => { // Reset all filter dropdowns to their default 'all' state
    setStatusFilter('all');
    setCodeFilter('all');
    setPaymentFilter('all');
  };

  // Generate lists of unique Statuses and Codes from the current search results for the dropdown menus
  const uniqueStatuses = searchResults ? [...new Set(searchResults.map(o => o.STATUS).filter(Boolean))] : [];
  const uniqueCodes = searchResults ? [...new Set(searchResults.map(o => o.CODE).filter(Boolean))] : [];

  // Helper: Capitalizes the first letter of every word (e.g., 'ready for postage' -> 'Ready For Postage')
  const toTitleCase = (str) => {
    if (!str) return '';
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  // Mapping of order status text to specific Tailwind CSS color classes
  const statusColors = {
    'ready for postage': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    'secured': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    'arrived pa': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'arrived wh': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'shipped': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  };

  // --- Requirement #1: Summary Stats Calculation ---
  // These variables calculate the "BAAM!" numbers for the summary cards
  const totalItems = searchResults ? searchResults.reduce((sum, o) => sum + parseInt(o.QTT || 1), 0) : 0; // Sum up all item quantities
  const arrivedItems = searchResults ? searchResults.filter(o => {
    const s = o.STATUS?.toLowerCase() || '';
    return s.includes('arrived pa') || s.includes('ready') || s.includes('shipped'); // Items that reached the PA or further
  }).reduce((sum, o) => sum + parseInt(o.QTT || 1), 0) : 0;
  
  const otwItems = totalItems - arrivedItems; // Anything not arrived is considered OTW (On The Way)
  const arrivalProgress = totalItems > 0 ? Math.round((arrivedItems / totalItems) * 100) : 0; // Calculate progress percentage

  // Determination: Are we currently looking at a Batch or a User?
  const isBatchMode = searchTerm.trim().startsWith('#') && searchResults;

  // Small internal component to render a color-coded dot for payment status
  const PaymentStatus = ({ status, isLC }) => {
    if (isLC) return <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto opacity-50" title="Not applicable" />; // Gray for N/A
    
    const isPaid = status?.toUpperCase() === 'PAID'; // Check if status equals 'PAID'
    return (
      <div 
        // Green dot for Paid, Red dot for Unpaid
        className={`w-3 h-3 rounded-full mx-auto shadow-sm ${isPaid ? 'bg-green-500 shadow-green-200' : 'bg-red-400 shadow-red-200'}`}
        title={status || 'Unpaid'} // Native tooltip on hover
      />
    );
  };

  return (
    <motion.div // Animated wrapper for the entire page
      initial={{ opacity: 0, y: 10 }} // Starts invisible and slightly down
      animate={{ opacity: 1, y: 0 }} // Fades in and slides up
      className="space-y-6" // Adds spacing between child elements
    >
      {/* Header Banner: Decorative top section */}
      <div className="bg-pink-500 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-pink-200/80 relative overflow-hidden">
        {/* Decorative background icons (Hearts and Locks) to match your new logo theme */}
        <div className="absolute top-[-10%] right-[-5%] opacity-15 text-9xl transform rotate-12">🔒</div>
        <div className="absolute bottom-[-10%] left-[-5%] opacity-15 text-9xl transform -rotate-12">💖</div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2">Masterlist 🎀</h1>
          <p className="text-pink-100 mb-4 font-medium max-w-sm">Track your orders via @username or #tag ✨</p>
          {/* Important notice badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold">
            <AlertCircle size={14} /> <span>Please checkout items asap when ready!</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Section: Where the user interacts with the data */}
      <div className="glass rounded-3xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">Search User or Tag</label>
            <form onSubmit={handleSearch} className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Search @username or #tag"
                // Interactive styling for the search input
                className="w-full bg-pink-50/50 dark:bg-pink-900/10 border-2 border-pink-200 dark:border-pink-900/50 focus:border-pink-400 dark:focus:border-pink-500 focus:ring focus:ring-pink-200 dark:focus:ring-pink-900 focus:ring-opacity-50 rounded-2xl py-3 px-4 pr-12 text-gray-700 dark:text-gray-200 font-medium transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Update state as the user types
              />
              <button type="submit" className="absolute right-2 bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-xl transition-colors">
                <Search size={18} /> {/* Search icon button */}
              </button>
            </form>
          </div>
          
          {/* Show a clear button only if there are search results active */}
          {searchResults && (
            <button 
              onClick={() => {setSearchTerm(''); setSearchResults(null);}} // Clear both search input and results
              className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Clear Search"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Secondary filters: Only visible after a search is performed */}
        {searchResults && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-4 border-t border-pink-100 dark:border-pink-900/30 flex flex-wrap gap-3"
          >
            {/* Status Dropdown Filter */}
            <div className="flex-1 min-w-[140px] space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-pink-400 ml-1">Status</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/50 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-pink-400"
              >
                <option value="all">All Statuses</option>
                {/* Change: Using 'toTitleCase' so your spreadsheet data looks beautiful in the dropdown list! */}
                {uniqueStatuses.map(s => <option key={s} value={s}>{toTitleCase(s)}</option>)}
              </select>
            </div>

            {/* Batch/Code Dropdown Filter */}
            <div className="flex-1 min-w-[140px] space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-pink-400 ml-1">Batch / GO</label>
              <select 
                value={codeFilter}
                onChange={(e) => setCodeFilter(e.target.value)}
                className="w-full bg-white dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/50 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-pink-400"
              >
                <option value="all">All Batches</option>
                {/* Dynamically build options from unique codes found in the results */}
                {uniqueCodes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Payment Dropdown Filter */}
            <div className="flex-1 min-w-[140px] space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-pink-400 ml-1">Payment</label>
              <select 
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full bg-white dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/50 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-pink-400"
              >
                <option value="all">Any Payment</option>
                <option value="paid">Fully Paid</option>
                <option value="unpaid">Has Unpaid</option>
              </select>
            </div>
            
            {/* Reset Filters Text Button */}
            <button 
              onClick={resetFilters}
              className="self-end px-4 py-2 text-xs font-bold text-pink-500 hover:text-pink-600 transition-colors"
            >
              Reset All
            </button>
          </motion.div>
        )}

        {/* --- Active Filter Bubbles Section --- */}
        {/* We only show this section if at least one filter is active (not set to 'all') */}
        {searchResults && (statusFilter !== 'all' || codeFilter !== 'all' || paymentFilter !== 'all') && (
          <div className="flex flex-wrap gap-2 pt-2">
            <AnimatePresence>
              {/* Status Filter Bubble */}
              {statusFilter !== 'all' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-3 py-1.5 rounded-full text-[11px] font-bold border border-pink-200 dark:border-pink-800"
                >
                  <span className="opacity-60 uppercase">Status:</span> {toTitleCase(statusFilter)} {/* Change: Title Case status bubbles */}
                  <button onClick={() => setStatusFilter('all')} className="hover:text-pink-900 dark:hover:text-pink-100 transition-colors">
                    <X size={14} />
                  </button>
                </motion.div>
              )}

              {/* Batch/Code Filter Bubble */}
              {codeFilter !== 'all' && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.8 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   exit={{ opacity: 0, scale: 0.8 }}
                   className="inline-flex items-center gap-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-3 py-1.5 rounded-full text-[11px] font-bold border border-pink-200 dark:border-pink-800"
                >
                  <span className="opacity-60 uppercase">Batch:</span> {codeFilter}
                  <button onClick={() => setCodeFilter('all')} className="hover:text-pink-900 dark:hover:text-pink-100 transition-colors">
                    <X size={14} />
                  </button>
                </motion.div>
              )}

              {/* Payment Filter Bubble */}
              {paymentFilter !== 'all' && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.8 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   exit={{ opacity: 0, scale: 0.8 }}
                   className="inline-flex items-center gap-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-3 py-1.5 rounded-full text-[11px] font-bold border border-pink-200 dark:border-pink-800"
                >
                  <span className="opacity-60 uppercase">Payment:</span> {paymentFilter === 'unpaid' ? 'Has Unpaid' : 'Fully Paid'}
                  <button onClick={() => setPaymentFilter('all')} className="hover:text-pink-900 dark:hover:text-pink-100 transition-colors">
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* --- Requirement #1 & #3: Summary Dashboard Section --- */}
      <AnimatePresence>
        {searchResults && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Batch mode gets a special 'miumiu-style' layout with 3 top cards and a big progress bar below */}
            {isBatchMode ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  {/* Card 1: Current Batch Status */}
                  <div className="glass rounded-3xl p-5 flex flex-col items-center justify-center text-center space-y-1 border-pink-100 dark:border-pink-900/30">
                    <span className="text-[10px] font-bold uppercase text-pink-400 tracking-wider">Current Status</span>
                    <span className="text-xl font-black text-gray-800 dark:text-gray-100 leading-tight">
                      {toTitleCase(searchResults[0]?.STATUS || 'Processing')}
                    </span>
                    <div className="w-8 h-1 bg-pink-100 dark:bg-pink-900/30 rounded-full" />
                  </div>

                  {/* Card 2: Estimated Shipment (Requirement #3) */}
                  <div className="glass rounded-3xl p-5 flex flex-col items-center justify-center text-center space-y-1 border-blue-100 dark:border-blue-900/30">
                    <span className="text-[10px] font-bold uppercase text-blue-500 tracking-wider">Est. Shipment ✈️</span>
                    <span className="text-xl font-black text-gray-800 dark:text-gray-100 leading-tight">
                      {/* Change: Looking for an 'EST SHIPMENT' column in your sheet, or showing 'TBA' if not found yet */}
                      {searchResults[0]?.['EST SHIPMENT'] || 'TBA 🗓️'}
                    </span>
                    <div className="w-8 h-1 bg-blue-100 dark:bg-blue-900/30 rounded-full" />
                  </div>

                  {/* Card 3: Estimated Arrival (Requirement #3) */}
                  <div className="glass rounded-3xl p-5 flex flex-col items-center justify-center text-center space-y-1 border-purple-100 dark:border-purple-900/30">
                    <span className="text-[10px] font-bold uppercase text-purple-500 tracking-wider">Est. Arrival 🏠</span>
                    <span className="text-xl font-black text-gray-800 dark:text-gray-100 leading-tight">
                       {/* Change: Looking for an 'EST ARRIVAL' column in your sheet */}
                      {searchResults[0]?.['EST ARRIVAL'] || 'TBA 🗓️'}
                    </span>
                    <div className="w-8 h-1 bg-purple-100 dark:bg-purple-900/30 rounded-full" />
                  </div>
                </div>

                {/* --- Large Progress Section --- */}
                <div className="glass rounded-3xl p-6 border-pink-100 dark:border-pink-900/30 relative overflow-hidden">
                   <div className="flex justify-between items-end mb-4 relative z-10">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase text-pink-400 tracking-widest">Arrival Progress</h4>
                        <p className="text-2xl font-black text-pink-600 dark:text-pink-400">
                          {arrivalProgress}% Complete
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {arrivedItems} of {totalItems} Items Arrived
                      </span>
                   </div>
                   {/* Modern Chunky Progress Bar */}
                   <div className="h-4 bg-pink-50 dark:bg-pink-900/20 rounded-full overflow-hidden relative border border-pink-100 dark:border-pink-900/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${arrivalProgress}%` }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-400 to-pink-600 shadow-lg shadow-pink-200/50"
                      />
                   </div>
                   <p className="text-[9px] mt-3 text-gray-400 font-medium italic text-center">
                     Estimated dates are subject to changes based on courier & warehouse processing 📦
                   </p>
                </div>
              </>
            ) : (
              // --- Standard User Mode (Keep original 4 cards) ---
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="glass rounded-3xl p-4 md:p-5 flex flex-col items-center justify-center text-center space-y-1 border-pink-100 dark:border-pink-900/30">
                  <span className="text-[10px] font-bold uppercase text-pink-400 tracking-wider">Total Orders</span>
                  <span className="text-3xl font-black text-gray-800 dark:text-gray-100">{totalItems}</span>
                  <div className="w-8 h-1 bg-pink-100 dark:bg-pink-900/30 rounded-full" />
                </div>
                <div className="glass rounded-3xl p-4 md:p-5 flex flex-col items-center justify-center text-center space-y-1 border-green-100 dark:border-green-900/30">
                  <span className="text-[10px] font-bold uppercase text-green-500 tracking-wider">Arrived PA 🚚</span>
                  <span className="text-3xl font-black text-gray-800 dark:text-gray-100">{arrivedItems}</span>
                  <div className="w-8 h-1 bg-green-100 dark:bg-green-900/30 rounded-full" />
                </div>
                <div className="glass rounded-3xl p-4 md:p-5 flex flex-col items-center justify-center text-center space-y-1 border-blue-100 dark:border-blue-900/30">
                  <span className="text-[10px] font-bold uppercase text-blue-500 tracking-wider">On The Way ✈️</span>
                  <span className="text-3xl font-black text-gray-800 dark:text-gray-100">{otwItems}</span>
                  <div className="w-8 h-1 bg-blue-100 dark:bg-blue-900/30 rounded-full" />
                </div>
                <div className="glass rounded-3xl p-4 md:p-5 flex flex-col items-center justify-center text-center space-y-2 border-pink-100 dark:border-pink-900/30 relative overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${arrivalProgress}%` }}
                    className="absolute inset-0 bg-pink-500/5 dark:bg-pink-500/10 pointer-events-none"
                  />
                  <span className="text-[10px] font-bold uppercase text-pink-500 tracking-wider relative z-10">Delivery Progress</span>
                  <span className="text-3xl font-black text-pink-600 dark:text-pink-400 relative z-10">{arrivalProgress}%</span>
                  <p className="text-[9px] font-bold text-gray-400 uppercase relative z-10">Complete</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section: The list or table of actual order data */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Box size={18} className="text-pink-500" />
            {searchResults ? 'Order Results' : 'Recent Updates'}
          </h3>
          {/* Result counter: Only visible during active search */}
          {searchResults && (
            <span className="text-xs font-bold text-pink-400">
              Showing {displayedOrders.length} of {searchResults.length}
            </span>
          )}
        </div>
        
        {/* State 1: Data is still loading from the server */}
        {isLoading ? (
          <div className="glass rounded-3xl p-12 flex flex-col items-center justify-center text-pink-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="font-medium animate-pulse">Fetching records...</p>
          </div>
        ) : !searchResults ? ( // State 2: No search has been performed yet
          <div className="glass rounded-3xl p-10 flex flex-col items-center text-center text-gray-500 dark:text-gray-400 border border-dashed border-pink-200 dark:border-pink-900/50">
            <div className="bg-pink-100 dark:bg-pink-900/30 p-4 rounded-full text-pink-400 mb-4">
              <Search size={32} />
            </div>
            <p className="font-medium text-lg text-gray-600 dark:text-gray-300">Start by searching your @username</p>
            <p className="text-sm mt-1 max-w-xs">Your personalized order table will appear here 🎁</p>
          </div>
        ) : displayedOrders.length === 0 ? ( // State 3: Search performed but filters returned no results
          <div className="glass rounded-3xl p-10 flex flex-col items-center text-center text-gray-500 dark:text-gray-400 border border-dashed border-pink-200 dark:border-pink-900/50">
            <SearchX size={32} className="text-pink-300 mb-4" />
            <p className="font-medium text-lg text-gray-600">No items match these filters</p>
            <p className="text-sm mt-1">Try resetting your filters or adjusting your search ✨</p>
          </div>
        ) : ( // State 4: We have filtered results to display in the table
          <div className="glass rounded-3xl overflow-hidden shadow-lg border border-pink-100 dark:border-pink-900/30">
            <div className="overflow-x-auto"> {/* Enable horizontal scroll for small screens */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-pink-500 text-white text-[10px] uppercase tracking-wider font-bold">
                    <th className="px-4 py-4">Tag</th>
                    {/* Change: Added 'User' column header only when searching by batch tag! */}
                    {isBatchMode && <th className="px-4 py-4">User</th>}
                    <th className="px-4 py-4">Specification</th>
                    <th className="px-4 py-4 text-center">Qty</th>
                    <th className="px-3 py-4 text-center">1st</th>
                    <th className="px-3 py-4 text-center">2nd</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100 dark:divide-pink-900/30">
                  <AnimatePresence>
                    {displayedOrders.map((order, idx) => { // Render each order as a table row
                      const isLC = order.CODE?.includes('LC'); // Detect if item is 'LC' (different payment structure)
                      // Try multiple possible column names for the link
                      const linkVal = order.FINAL_LINK || order.LINK || order.URL || order.TELEGRAM;
                      // Validate if the value looks like a legitimate link
                      const hasLink = linkVal && (linkVal.startsWith('http') || linkVal.startsWith('t.me'));

                      return ( // Return the row component
                        <motion.tr 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          key={idx} // Index used as key (temporary; better to have unique IDs)
                          className="hover:bg-pink-50/50 dark:hover:bg-pink-900/10 transition-colors text-sm"
                        >
                          {/* Tag Column: Order Code */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="font-bold text-pink-600 dark:text-pink-400">{order.CODE}</span>
                          </td>
                          {/* Change: Showing the Username cell only during a #batch search. We also remove extra '@' symbols if the data already includes them! */}
                          {isBatchMode && (
                            <td className="px-4 py-4 whitespace-nowrap text-xs font-bold text-gray-700 dark:text-gray-200">
                              {order.USERNAME?.startsWith('@') ? order.USERNAME : `@${order.USERNAME}`}
                            </td>
                          )}
                           {/* Specification Column: What was ordered */}
                          <td className="px-4 py-4 min-w-[150px]">
                            {/* Change: Applying toTitleCase to your item specifications so they always look clean and pretty! */}
                            <p className="text-gray-800 dark:text-gray-200 font-medium">{toTitleCase(order.SPECIFICATION) || '—'}</p>
                          </td>
                          {/* Item Quantity */}
                          <td className="px-4 py-4 text-center font-bold text-gray-500">{order.QTT || '1'}</td>
                          {/* 1st Payment Dot */}
                          <td className="px-3 py-4 text-center">
                            <PaymentStatus status={order['1ST']} />
                          </td>
                          {/* 2nd Payment Dot (Disabled for LC) */}
                          <td className="px-3 py-4 text-center">
                            <PaymentStatus status={order['2ND']} isLC={isLC} />
                          </td>
                          {/* Order Status Badge */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColors[order.STATUS?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'}`}>
                              {order.STATUS}
                            </span>
                          </td>
                          {/* Action Links Button */}
                          <td className="px-4 py-4 text-center">
                            {hasLink ? (
                              <a 
                                href={linkVal.startsWith('t.me') ? `https://${linkVal}` : linkVal} // Handle telegram links
                                target="_blank" // Open in new tab
                                rel="noopener noreferrer" // Security best practice
                                className="inline-flex p-1.5 bg-pink-50 dark:bg-pink-900/30 text-pink-500 rounded-lg hover:bg-pink-500 hover:text-white transition-all shadow-sm"
                                title="Open Link"
                              >
                                <ExternalLink size={14} />
                              </a>
                            ) : (
                              <span className="text-gray-300 dark:text-gray-700">—</span>
                            )}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            
            {/* Table Legend: Explains what the dots mean */}
            <div className="bg-pink-50/50 dark:bg-pink-900/10 px-6 py-4 border-t border-pink-100 dark:border-pink-900/30 flex flex-wrap items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
               <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /> Paid</div>
               <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /> Unpaid</div>
               <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-700" /> N/A (LC)</div>
               <div className="ml-auto text-pink-400 flex items-center gap-1"><Info size={12} /> Total Found: {displayedOrders.length}</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
