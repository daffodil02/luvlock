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
    <motion.div // Animated container for the whole page content
      initial={{ opacity: 0, y: 10 }} // Starts faint and slightly lower
      animate={{ opacity: 1, y: 0 }} // Fades in and slides up to its final position
      exit={{ opacity: 0, y: -10 }} // Fades out and slides up when navigating away
      className="space-y-6" // Adds consistent vertical spacing between children
    >
      {/* Page Header: A colorful banner section */}
      <div className="bg-gradient-to-tr from-pink-500 to-rose-400 dark:from-pink-600 dark:to-rose-900 rounded-3xl p-8 text-white shadow-xl shadow-pink-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] opacity-10 text-8xl rotate-12">🛍️</div> {/* Subtle background icon */}
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
            Ongoing GOs <Sparkles className="fill-pink-200 text-pink-200" /> {/* Title with a sparkle icon */}
          </h1>
          <p className="text-pink-100 font-medium">Join our curated list of active group orders ✨</p> {/* Description text */}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-1"> {/* Grid layout for the order cards */}
        {loading ? ( // Conditional Rendering Case 1: Data is still loading
           <div className="glass rounded-3xl p-16 text-center space-y-4">
             <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" /> {/* Spinner */}
             <p className="text-gray-500 italic font-medium animate-pulse">Syncing with your spreadsheet... 🌸</p>
           </div>
        ) : ongoingOrders.length === 0 ? ( // Conditional Rendering Case 2: No data was found
          <div className="glass rounded-3xl p-16 text-center text-gray-500 italic">
            No group orders are currently listed. Check back soon! ⚽
          </div>
        ) : ongoingOrders.map((go, idx) => { // Conditional Rendering Case 3: We have data to display!
          
          // --- Robust Data Extraction Logic ---
          // This helper looks for a value by trying multiple possible header names (case-insensitive)
          // Essential because sometimes spreadsheets have slightly different column names (e.g., 'URL' vs 'Link')
          const getVal = (possibleKeys) => {
            const foundKey = Object.keys(go).find(k => 
              possibleKeys.some(pk => k.trim().toLowerCase() === pk.toLowerCase())
            );
            return foundKey ? go[foundKey] : null;
          };

          // Map spreadsheet columns to our clean internal variables
          const eventType = getVal(['Online/Offline event', 'EVENT', 'TYPE']) || 'Global';
          const brandName = getVal(['Store', 'Brand', 'Seller', 'Hosted by', 'HOST']) || 'Official Store';
          const goName = getVal(['Item', 'Name of the go', 'TITLE', 'NAME']) || 'Special Collection';
          const goLink = getVal(['Link', 'Link to the group order', 'URL']) || '#';

          return ( // Return a card for each Group Order
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} // Animation start state
              animate={{ opacity: 1, scale: 1 }} // Animation end state
              transition={{ delay: idx * 0.1 }} // Staggered animation: each card appears slightly after the previous one
              key={idx} // Unique key for React list rendering
              className="glass rounded-3xl p-6 relative overflow-hidden group hover:shadow-xl hover:shadow-pink-200/20 dark:hover:shadow-none transition-all border border-pink-100/50 dark:border-pink-900/40"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Badge showing if the event is Online or Offline with dynamic colors */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                      eventType?.toLowerCase().includes('online') 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-purple-500 text-white'
                    }`}>
                      {eventType}
                    </span>
                    {/* Brand or Seller name with an icon */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">
                      <ShoppingBag size={12} className="text-pink-400" /> {brandName}
                    </span>
                  </div>
                  
                  <div>
                    {/* Main title/item name of the Group Order */}
                    <h3 className="text-xl font-extrabold text-gray-800 dark:text-gray-100 leading-tight">
                      {goName}
                    </h3>
                  </div>
                </div>

                {/* Small, clean button for joining the order */}
                <a 
                  href={goLink} 
                  target="_blank" // Opens the link in a new browser tab
                  rel="noopener noreferrer" // Security best practice for external links
                  // Change: Reduced padding (px-5 py-2.5) and roundedness (rounded-xl) to make the button feel more proportional
                  className="w-full sm:w-auto self-stretch sm:self-center flex items-center justify-center gap-2 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300 hover:bg-pink-500 dark:hover:bg-pink-600 hover:text-white dark:hover:text-white border border-pink-200 dark:border-pink-800/50 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                >
                  Join Order <ExternalLink size={15} /> {/* Icon indicating an external link */}
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
