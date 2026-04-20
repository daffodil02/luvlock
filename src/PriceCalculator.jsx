import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, X } from "lucide-react";
import { fetchExchangeRates } from "./data";

export default function PriceCalculator() {
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [allRates, setAllRates] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  useEffect(() => {
    fetchExchangeRates().then((rates) => {
      setAllRates(rates);
      if (rates.length > 0) {
        const defaultRate = rates.find(r => r.Currency?.toUpperCase() === 'KRW') || rates[0];
        setSelectedCurrency(defaultRate);
      }
    });
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isCalcOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
            className="glass p-6 rounded-[2rem] border-pink-100 dark:border-pink-900/50 shadow-2xl w-[280px] md:w-[320px] overflow-hidden relative group"
          >
            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-pink-500/10 blur-3xl rounded-full" />
            
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-200 dark:shadow-none animate-pulse">
                  <Calculator size={16} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-pink-500">Price Conversion Tool</h3>
              </div>
              <button 
                onClick={() => setIsCalcOpen(false)}
                className="p-1.5 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded-lg text-gray-400 hover:text-pink-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-pink-400 tracking-widest ml-1">Select Currency</label>
                <select 
                  value={selectedCurrency?.Currency} 
                  onChange={(e) => setSelectedCurrency(allRates.find(r => r.Currency === e.target.value))}
                  className="w-full bg-pink-50/50 dark:bg-pink-900/20 border-2 border-pink-100 dark:border-pink-800 rounded-2xl py-2 px-4 text-xs font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-pink-500 transition-all cursor-pointer appearance-none"
                >
                  {allRates.map((r, i) => (
                    <option key={i} value={r.Currency}>{r.Currency} ({r.Rate})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-black uppercase text-pink-400 tracking-widest">Input {selectedCurrency?.Currency || 'Amount'}</label>
                  <span className="text-[9px] font-bold text-gray-400">
                    {selectedCurrency?.Currency === 'KRW' ? 'South Korea 🇰🇷' : 
                     selectedCurrency?.Currency === 'JPY' ? 'Japan 🇯🇵' :
                     selectedCurrency?.Currency === 'YUAN' ? 'China 🇨🇳' :
                     selectedCurrency?.Currency === 'BAHT' ? 'Thailand 🇹🇭' :
                     selectedCurrency?.Currency === 'USD' ? 'USA 🇺🇸' :
                     selectedCurrency?.Currency === 'SGD' ? 'Singapore 🇸🇬' : 'International 🌏'}
                  </span>
                </div>
                <div className="relative group">
                  <input 
                    type="number" 
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-pink-50/50 dark:bg-pink-900/20 border-2 border-pink-100 dark:border-pink-800 rounded-2xl py-3 px-4 text-xl font-black text-gray-700 dark:text-gray-100 outline-none focus:border-pink-500 transition-all shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-300 font-bold">
                     {selectedCurrency?.Currency === 'KRW' ? '₩' : 
                      selectedCurrency?.Currency === 'JPY' ? '¥' :
                      selectedCurrency?.Currency === 'YUAN' ? '¥' :
                      selectedCurrency?.Currency === 'USD' ? '$' : 
                      selectedCurrency?.Currency === 'SGD' ? '$' : '•'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-2">
                <div className="h-px bg-pink-100 dark:bg-pink-900/30 flex-1" />
                <div className="flex items-center gap-1.5 bg-pink-50 dark:bg-pink-900/40 px-3 py-1 rounded-full border border-pink-100 dark:border-pink-800">
                  <span className="text-[8px] font-black text-pink-400">×</span>
                  <span className="text-[10px] font-black text-pink-600 dark:text-pink-300 tracking-wider">
                    {selectedCurrency?.Rate || '0.00'}
                  </span>
                </div>
                <div className="h-px bg-pink-100 dark:bg-pink-900/30 flex-1" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-black uppercase text-pink-400 tracking-widest">Result MYR</label>
                  <span className="text-[9px] font-bold text-gray-400">Malaysia 🇲🇾</span>
                </div>
                <div className="w-full bg-gradient-to-br from-pink-500 to-pink-600 p-5 rounded-2xl shadow-xl shadow-pink-200 dark:shadow-none flex flex-col relative overflow-hidden group/card">
                  <div className="absolute top-[-20%] right-[-10%] text-7xl opacity-10 rotate-12 group-hover/card:scale-110 transition-transform">🇲🇾</div>
                  <span className="text-[9px] font-black uppercase text-white/70 tracking-widest leading-none mb-1">Total Estimated</span>
                  <div className="flex items-baseline gap-1 text-white">
                    <span className="text-sm font-bold opacity-80 uppercase leading-none">RM</span>
                    <span className="text-3xl font-black tracking-tight">{(parseFloat(amount || 0) * (parseFloat(selectedCurrency?.Rate) || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCalcOpen(!isCalcOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isCalcOpen ? 'bg-pink-600 rotate-[360deg]' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-200 dark:shadow-none'}`}
      >
        {isCalcOpen ? <X size={24} /> : <Calculator size={24} />}
      </motion.button>
    </div>
  );
}
