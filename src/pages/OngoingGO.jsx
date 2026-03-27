import { useState, useEffect } from 'react'; // Import standard React hooks for state and lifecycle management
import { motion } from 'framer-motion'; // Import motion for easy-to-use animations
import { Sparkles, ShoppingBag, Globe, User, ExternalLink } from 'lucide-react'; // Import icons for a better UI
import { fetchOngoingGOs } from '../data'; // Import the function that gets Group Order data from our CSV/Sheet

export default function OngoingGO() { // Define the component for the 'Ongoing Group Orders' page
  const [ongoingOrders, setOngoingOrders] = useState([]); // State to store the list of group orders
  const [loading, setLoading] = useState(true); // State to show a loading spinner while fetching data

  useEffect(() => { // Hook that runs once when the component is first added to the screen
    fetchOngoingGOs().then(data => { // Fetch the data from the Google Sheet
      setOngoingOrders(data); // Save the result to our local state
      setLoading(false); // Turn off the loading spinner
    });
  }, []); // Empty array [] ensures this effect only runs once on mount

  return ( // Start of the JSX layout
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      className="space-y-6"
    >
      {/* Page Header: Banner matched exactly with Dashboard! */}
      <div className="bg-pink-500 rounded-3xl p-8 text-white shadow-xl shadow-pink-200/80 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] opacity-15 text-9xl transform rotate-12">🛍️</div>
        <div className="relative z-10">
          {/* Header Font Applied via 'font-header' in base styles */}
          <h1 className="text-3xl font-extrabold mb-3 flex items-center gap-3">
            Ongoing GOs ✨
          </h1>
          <p className="text-pink-100 font-medium text-xs uppercase tracking-wider opacity-90">Check out our list of active group orders </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-1"> 
        {loading ? (
           <div className="glass rounded-3xl p-16 text-center space-y-4">
             <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
             <p className="text-pink-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing Database...</p>
           </div>
        ) : ongoingOrders.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center text-gray-500 dark:text-gray-400 italic">
            No group orders are currently listed. Check back soon! 🌸
          </div>
        ) : ongoingOrders.map((go, idx) => { 
          const getVal = (possibleKeys) => {
            const foundKey = Object.keys(go).find(k => 
              possibleKeys.some(pk => k.trim().toLowerCase() === pk.toLowerCase())
            );
            return foundKey ? go[foundKey] : null;
          };

          const eventType = getVal(['Online/Offline event', 'EVENT', 'TYPE']) || 'Global';
          const brandName = getVal(['Store', 'Brand', 'Seller', 'Hosted by', 'HOST']) || 'Official Store';
          const goName = getVal(['Item', 'Name of the go', 'TITLE', 'NAME']) || 'Special Collection';
          const goLink = getVal(['Link', 'Link to the group order', 'URL']) || '#';
          const dueDate = getVal(['Due Date', 'DUE', 'DEADLINE']) || 'TBA';

          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: idx * 0.1 }}
              key={idx}
              className="glass rounded-3xl p-6 relative overflow-hidden group hover:shadow-xl hover:shadow-pink-100/30 dark:hover:shadow-none transition-all border border-pink-100/50 dark:border-pink-900/40"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Badge: Added Dark Mode Soft-Glow variants! 🕵️‍♀️🎯 */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm ${
                      eventType?.toLowerCase().includes('online') 
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' 
                      : 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300'
                    }`}>
                      {eventType}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-200 uppercase tracking-widest leading-none">
                      <ShoppingBag size={12} className="text-pink-400" /> {brandName}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-800 dark:text-gray-100 leading-tight">
                      {goName}
                    </h3>
                    <div className="mt-2 text-pink-500 dark:text-pink-400">
                      <span className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest bg-pink-50 dark:bg-pink-950/30 px-3 py-1.5 rounded-xl  shadow-sm border border-pink-100/50 dark:border-pink-900/30 uppercase">
                        Deadline: {dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button - Standardized & Mobile Ready! */}
                <a 
                  href={goLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group self-stretch sm:self-center w-full sm:w-auto flex items-center justify-center gap-3 bg-pink-500 hover:bg-pink-600 text-white font-bold text-[12px] py-3 rounded-xl transition-all shadow-md dark:shadow-none active:scale-95 border border-pink-400/30 tracking-tight px-8 whitespace-nowrap uppercase"
                >
                  <span>Join Order</span> 
                  <ExternalLink size={14} className="group-hover:rotate-12 transition-transform" /> 
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
