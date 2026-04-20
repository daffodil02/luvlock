import { useState, useEffect } from 'react'; // Import state and effect hooks from React for managing data and side effects
import { Routes, Route, Link, useLocation } from 'react-router-dom'; // Import routing components to handle page navigation
import { motion, AnimatePresence } from 'framer-motion'; // Import animation components for smooth transitions and effects
import { Heart, Search, Package, MapPin, List, Moon, Sun, Bell } from 'lucide-react'; // Import icons for the user interface
import Dashboard from './pages/Dashboard'; // Import the Dashboard page component
import OngoingGO from './pages/OngoingGO'; // Import the Ongoing GO (Group Orders) page component
import PostageForm from './pages/PostageForm'; // Import the Postage Form page component
import { fetchNotifications } from './data'; // Import the function to fetch notification data from our data file
import PriceCalculator from './PriceCalculator'; // Change: Importing the global Calculator component! 🕵️‍♀️🎯

// Change: Importing your beautiful new branding assets! 🕵️‍♀️🎯
import luvlockLogo from './assets/luvlock_logo.png'; 
import luvlockName from './assets/luvlock_name.png';

function App() { // Define the main App component function
  const location = useLocation(); // Hook to get the current URL path (e.g., '/', '/ongoing')
  const [isDark, setIsDark] = useState(false); // State to track if the app is in Dark Mode
  const [showNotifications, setShowNotifications] = useState(false); // State to track if the notification dropdown is open
  const [notifications, setNotifications] = useState([]); // State to store the list of notifications fetched from the data source

  useEffect(() => { // useEffect runs after the component renders to handle side effects
    // Change: Forcing the app to start in Light Mode by default for a consistent 'Pink Soccer' brand feel.
    setIsDark(false); // Ensure the local state is false (Light Mode)
    document.documentElement.classList.remove('dark'); // Explicitly remove any existing dark mode CSS classes
    
    // Fetch notifications from the data source (Google Sheet) when the app first loads
    fetchNotifications().then(data => setNotifications(data)); // Call the data function and update state
  }, []); // Empty dependency array [] means this effect runs only once on mount

  const toggleDarkMode = () => { // Function to switch between light and dark modes
    setIsDark(!isDark); // Flip the current boolean value of isDark
    document.documentElement.classList.toggle('dark'); // Add or remove the 'dark' class from the root HTML element
  };

  const navLinks = [ // Array of objects representing our main navigation links
    { name: 'Masterlist', path: '/', icon: Heart }, // Home/Masterlist link
    { name: 'Ongoing GOs', path: '/ongoing', icon: List }, // Ongoing Group Orders link
    { name: 'Postage', path: '/postage', icon: MapPin }, // Postage page link
  ];

  return ( // JSX start: This defines what will be rendered on the screen
    /* Change: Switched to 'max-w-3xl'—this is the 'Sweet Spot' width produced after testing! */
    <div className="max-w-3xl mx-auto min-h-screen px-2 sm:px-4 py-8 w-full overflow-x-hidden sm:overflow-x-visible"> {/* Responsive padding and max-width */}
      {/* Navbar Bubble: The sticky top navigation bar */}
      <nav className="glass sticky top-2 sm:top-4 z-50 rounded-full py-3 px-3 sm:py-3 sm:px-6 shadow-lg flex justify-between items-center mb-8 border-pink-100 relative">
        <div className="flex items-center text-pink-600 dark:text-pink-400 flex-shrink-0 gap-1 sm:gap-2"> {/* Branding section with a small gap */}
          {/* Change: Bouncing effect remains ONLY on the logo icon! 🧤✨ */}
          <motion.div 
            animate={{ y: [0, -6, 0] }} // Bouncing animation to make the logo feel alive
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} // Endless loop
            className="flex items-center justify-center flex-shrink-0"
          >
             <img src={luvlockLogo} alt="Luvlock Logo" className="h-8 sm:h-10 w-auto object-contain" /> 
          </motion.div>
          
          {/* Change: CLEAN Branding Cleanup! Removed the stray characters beside the comment. 🕵️‍♀️🎯 */}
          <div className="flex items-center justify-center flex-shrink-0">
             <img src={luvlockName} alt="Luvlock" className="pl-0.5 sm:pl-1 h-6 sm:h-8 w-auto object-contain" />
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-2"> {/* Navigation links container */}
          {navLinks.map((link) => { // Map through our navLinks array to create Link elements
            const Icon = link.icon; // Get the icon component for this link
            const isActive = location.pathname === link.path; // Check if this link matches the current URL path
            
            return ( // Return the Link component for each item in the array
              <Link 
                key={link.path} // Unique key needed for React list rendering
                to={link.path} // Destination path for the link
                className={`relative px-3 sm:px-3 py-2 sm:py-2 rounded-full text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/30'}`}
              >
                {isActive && ( // If active, show an animated background bubble
                  <motion.div 
                    layoutId="bubble" // layoutId allows the bubble to animate smoothly between different links
                    className="absolute inset-0 bg-pink-500 rounded-full -z-10 shadow-sm" // Styling for the active background
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} // Springy animation effect
                  />
                )}
                <span className="hidden sm:inline whitespace-nowrap">{link.name}</span> {/* Show link name on larger screens */}
                <span className="sm:hidden"><Icon size={18} className="sm:w-5 sm:h-5" /></span> {/* Show slightly larger icon on mobile */}
              </Link>
            )
          })}
        </div>

        {/* Action Icons: Notifications and Dark Mode toggle */}
        <div className="flex items-center gap-1 sm:gap-2 border-l border-pink-200 dark:border-pink-900/50 pl-2 sm:pl-2 ml-1 sm:ml-2">
          <button // Notification toggle button
            onClick={() => setShowNotifications(!showNotifications)} // Toggle the dropdown visibility
            className="p-1.5 sm:p-2 rounded-full text-pink-500 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors relative"
          >
            <Bell size={18} className="sm:w-[18px] sm:h-[18px]" /> {/* Bell icon */}
            {notifications.length > 0 && ( 
              <span className="absolute top-1 sm:top-1 right-1.5 sm:right-2 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-pink-500 rounded-full animate-ping"></span>
            )}
            {notifications.length > 0 && ( 
              <span className="absolute top-1 sm:top-1 right-1.5 sm:right-2 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-pink-500 rounded-full"></span>
            )}
          </button>
          <button // Dark mode toggle button
            onClick={toggleDarkMode} // Call the toggleDarkMode function on click
            className="p-1.5 sm:p-2 rounded-full text-pink-500 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors"
          >
            {isDark ? <Sun size={18} className="sm:w-[18px] sm:h-[18px]" /> : <Moon size={18} className="sm:w-[18px] sm:h-[18px]" />} {/* Switch between Sun and Moon icons */}
          </button>
        </div>

        {/* Notification Dropdown: Using AnimatePresence for exit animations */}
        <AnimatePresence>
          {showNotifications && ( // Only render if showNotifications state is true
            <motion.div // Animated container for the dropdown
              initial={{ opacity: 0, y: 10, scale: 0.95 }} // Start invisible and slightly below/smaller
              animate={{ opacity: 1, y: 0, scale: 1 }} // Fade in and move to final position
              exit={{ opacity: 0, y: 10, scale: 0.95 }} // Fade out and shrink when closed
              className="absolute top-full right-0 mt-4 w-72 glass rounded-2xl shadow-xl overflow-hidden z-50 border-pink-200 dark:border-pink-900"
            >
              <div className="bg-pink-500 text-white px-4 py-3 font-bold text-sm flex justify-between items-center uppercase tracking-widest">
                <span>Updates 🎀</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{notifications.length} New</span>
              </div>
              <div className="max-h-64 overflow-y-auto p-2"> {/* Scrollable list of notifications */}
                {notifications.length === 0 ? ( // Show a placeholder if no notifications
                  <div className="p-8 text-center text-gray-500 text-sm italic">No notifications yet 🌸</div>
                ) : ( // Map through notifications array to render each item
                  notifications.map((notif, i) => {
                    const getValByPossibleKeys = (possibleKeys) => {
                      const foundKey = Object.keys(notif).find(k => 
                        possibleKeys.some(pk => k.trim().toLowerCase() === pk.toLowerCase())
                      );
                      return foundKey ? notif[foundKey] : null;
                    };
                    const firstKeyName = Object.keys(notif)[0];
                    const title = getValByPossibleKeys(['title', 'Notification', 'Title', 'Label', 'Type']) || firstKeyName;
                    const message = getValByPossibleKeys(['message', 'Text', 'Message', 'Content', 'Description']) || (title !== firstKeyName ? firstKeyName : notif[firstKeyName]);
                    const date = getValByPossibleKeys(['date', 'Time', 'Date', 'Day']);

                    return (
                      <div key={i} className="p-3 border-b border-pink-100 dark:border-pink-900/30 last:border-0 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-xl transition-colors cursor-pointer group">
                        <p className="text-[13px] text-gray-700 dark:text-gray-200 font-bold leading-relaxed group-hover:text-pink-500 transition-colors uppercase">
                          {message || 'Check your dashboard for details! ✨'}
                        </p>
                        {date && <p className="text-[10px] text-pink-400 mt-1 font-bold tracking-tighter uppercase">{date}</p>}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content Area: Where the pages are rendered */}
      <main>
        <Routes> {/* Routes component looks at the current URL to decide which Route to show */}
          <Route path="/" element={<Dashboard />} /> {/* Shows Dashboard component for the path '/' */}
          <Route path="/ongoing" element={<OngoingGO />} /> {/* Shows OngoingGO component for '/ongoing' */}
          <Route path="/postage" element={<PostageForm />} /> {/* Shows PostageForm component for '/postage' */}
        </Routes>
      </main>
      
      {/* Footer: Bottom section of every page */}
      <footer className="mt-16 text-center text-sm text-pink-400 dark:text-pink-600 font-medium opacity-80 pb-8 flex flex-col items-center gap-2">
        <div>🌸 Built with love from luvlock</div> {/* Footer text */}
      </footer>

      {/* Global Price Calculator 🕵️‍♀️🎯 */}
      <PriceCalculator />
    </div>
  );
}

export default App; // Export the App component so main.jsx can use it
