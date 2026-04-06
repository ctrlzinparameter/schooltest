import React, { useState, useEffect } from 'react';
import { Utensils, Moon, Sun, Loader2, ChevronRight, AlertCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MealCard = () => {
  const [mealData, setMealData] = useState({ lunch: null, dinner: null });
  const [activeMeal, setActiveMeal] = useState('lunch'); // 'lunch' or 'dinner'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get today's date in YYYYMMDD format
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  // Clean NEIS meal text (remove allergy numbers and split <br/>)
  const cleanMealText = (text) => {
    if (!text) return [];
    // Remove (1.2.3.4.) pattern
    const cleaned = text.replace(/\([\d.]+\)/g, '').trim();
    return cleaned.split('<br/>').map(item => item.trim()).filter(item => item);
  };

  useEffect(() => {
    const fetchMeal = async () => {
      const API_KEY = import.meta.env.VITE_NEIS_API_KEY;
      const todayStr = getTodayStr();
      const ATPT_CODE = 'J10'; // Gyeonggi-do
      const SCHUL_CODE = '7530126'; // Cheongmyeong High School

      // Base URL without key parameter if key is missing (NEIS allows some free usage)
      let url = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&ATPT_OFCDC_SC_CODE=${ATPT_CODE}&SD_SCHUL_CODE=${SCHUL_CODE}&MLSV_YMD=${todayStr}`;
      if (API_KEY) {
        url += `&KEY=${API_KEY}`;
      }

      try {
        setLoading(true);
        const res = await fetch(url);
        const data = await res.json();

        if (data.mealServiceDietInfo) {
          const rows = data.mealServiceDietInfo[1].row;
          const extracted = { lunch: null, dinner: null };

          rows.forEach(row => {
            const menu = cleanMealText(row.DDISH_NM);
            if (row.MMEAL_SC_NM === '중식') extracted.lunch = menu;
            if (row.MMEAL_SC_NM === '석식') extracted.dinner = menu;
          });

          setMealData(extracted);
          // Default to lunch unless it's empty and dinner has data
          if (!extracted.lunch && extracted.dinner) {
            setActiveMeal('dinner');
          }
        } else {
          // No meal info found (likely weekend or holiday)
          setMealData({ lunch: null, dinner: null });
        }
      } catch (err) {
        console.error('NEIS API Error:', err);
        setError('급식 정보를 가져올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMeal();
  }, []);

  const currentMenu = activeMeal === 'lunch' ? mealData.lunch : mealData.dinner;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-3">
        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
           <Utensils size={18} className="text-indigo-600" /> 오늘의 급식
        </h2>
        <div className="flex p-1 bg-slate-100 rounded-xl">
           <button 
             onClick={() => setActiveMeal('lunch')}
             className={`px-3 py-1 text-[11px] font-black rounded-lg transition-all ${activeMeal === 'lunch' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
           >
             중식
           </button>
           <button 
             onClick={() => setActiveMeal('dinner')}
             className={`px-3 py-1 text-[11px] font-black rounded-lg transition-all ${activeMeal === 'dinner' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
           >
             석식
           </button>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-blue-400 rounded-[32px] opacity-0 group-hover:opacity-10 transition-opacity blur-sm" />
        <div className="relative rounded-[28px] bg-white p-6 shadow-soft border border-slate-100 overflow-hidden min-h-[180px] flex flex-col">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] scale-150 rotate-12">
             {activeMeal === 'lunch' ? <Sun size={120} /> : <Moon size={120} />}
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
               <Loader2 size={32} className="animate-spin text-indigo-200" />
               <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Fetching menu...</span>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
               <AlertCircle size={24} className="text-rose-400" />
               <p className="text-xs font-bold text-slate-400">{error}</p>
            </div>
          ) : !currentMenu ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
               <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200">
                  <Calendar size={24} />
               </div>
               <p className="text-[13px] font-black text-slate-300 italic">오늘은 급식이 없는 날입니다.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeMeal}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                   <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${activeMeal === 'lunch' ? 'bg-amber-50 text-amber-500 animate-pulse' : 'bg-indigo-50 text-indigo-500'}`}>
                      {activeMeal === 'lunch' ? <Sun size={20} /> : <Moon size={20} />}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] leading-none mb-1">
                        {activeMeal === 'lunch' ? 'Lunch Menu' : 'Dinner Menu'}
                      </span>
                      <h3 className="text-lg font-black text-slate-800 leading-none">
                        {activeMeal === 'lunch' ? '오늘의 중식' : '오늘의 석식'}
                      </h3>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {currentMenu.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[13px] font-bold text-slate-600 group/item">
                       <div className="h-1.5 w-1.5 rounded-full bg-indigo-200 group-hover/item:bg-indigo-500 group-hover/item:scale-125 transition-all" />
                       {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          <div className="mt-auto pt-6 flex items-center justify-between">
             <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                <AlertCircle size={10} /> Allergy data hidden for clarity
             </span>
             <div className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                <ChevronRight size={14} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealCard;
