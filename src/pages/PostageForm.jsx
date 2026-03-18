import { motion } from 'framer-motion'; // Import motion for adding entry and exit animations
import { ExternalLink, Mailbox } from 'lucide-react'; // Import visual icons for the page

export default function PostageForm() { // Define the Postage Form page component
  return ( // Start the JSX (the HTML-like code)
    <motion.div // A motion-enhanced div that animates when it appears on screen
      initial={{ opacity: 0, y: 10 }} // Starts transparent and 10 pixels down
      animate={{ opacity: 1, y: 0 }} // Fades in and moves up to its natural position
      exit={{ opacity: 0, y: -10 }} // Fades out and moves up when leaving the page
      className="space-y-6" // Adds vertical spacing between elements inside this div
    >
      {/* The main card container for the form information */}
      <div className="glass rounded-3xl p-8 text-center max-w-md mx-auto mt-10 shadow-xl shadow-pink-200/50 dark:shadow-none">
        {/* Large icon bubble at the top of the card */}
        <div className="w-20 h-20 bg-pink-100 dark:bg-pink-900/30 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mailbox size={40} /> {/* The mailbox icon from lucide-react */}
        </div>
        
        {/* Main heading for the page */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Postage Form 📮</h2>
        {/* Instructions for the user regarding when to fill the form */}
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Please fill out the postage form only when your items are showing as "Ready" in the tracking dashboard. We want to mail everything to you safely! 🎀
        </p>

        {/* The primary call-to-action button that links to the Google Form */}
        <a 
          href="" // The actual destination URL
          target="_blank" // This ensures the link opens in a new tab instead of closing our app
          rel="noopener noreferrer" // Security protocol to prevent the new tab from accessing our page
          className="inline-flex items-center justify-center gap-2 w-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-lg py-4 rounded-2xl transition-all shadow-md active:scale-[0.98]"
        >
          <span>Fill out Google Form</span> {/* Button text */}
          <ExternalLink size={20} /> {/* Small icon indicating it's an external link */}
        </a>

        {/* A small informative note or tip at the bottom of the card */}
        <div className="mt-6 p-4 bg-pink-50/80 dark:bg-pink-900/20 rounded-2xl border border-pink-100 dark:border-pink-900/50 text-sm text-pink-700 dark:text-pink-300">
          <p className="flex items-center justify-center gap-2">
            <span>⚽</span> Note: Tracking numbers will be sent via email later! 
          </p>
        </div>
      </div>
    </motion.div>
  ); // End of the JSX the function returns
} // End of the component function
