import React, { useState, useEffect } from 'react';
import { Calendar, Timer, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const DDayHero = ({ examName, targetDate, endDate }) => {
  const [dDay, setDDay] = useState(0);

  useEffect(() => {
    const calculateDDay = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(targetDate);
      target.setHours(0, 0, 0, 0);
      
      const diff = target.getTime() - today.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDDay(days);
    };

    calculateDDay();
    const timer = setInterval(calculateDDay, 1000 * 60 * 60); // Update every hour
    return () => clearInterval(timer);
  }, [targetDate]);

  const isDDayDone = dDay <= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-500 p-6 text-white shadow-xl"
    >
      {/* Background patterns */}
      <div className="absolute top-[-20px] right-[-20px] h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-[-10px] left-[10%] h-24 w-24 rounded-full bg-white/5 blur-xl" />

      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-xs font-bold backdrop-blur-md">
          <Calendar size={14} />
          <span>{targetDate}</span>
          {endDate && (
            <>
              <ArrowRight size={10} className="mx-0.5 opacity-60" />
              <span>{endDate}</span>
            </>
          )}
        </div>
        
        <h2 className="mt-4 text-center text-lg font-black tracking-tight">{examName}</h2>
        
        <div className="flex items-baseline gap-2">
          {isDDayDone ? (
            <span className="text-6xl font-black tracking-tighter drop-shadow-md">
              D-DAY
            </span>
          ) : (
             <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black opacity-80 uppercase tracking-tighter">D-</span>
                <span className="text-7xl font-black tracking-tighter drop-shadow-md">{dDay}</span>
             </div>
          )}
        </div>

        <p className="mt-4 text-[13px] font-bold opacity-80 flex items-center gap-1.5 bg-black/10 px-4 py-1.5 rounded-full">
          <Timer size={14} className="animate-pulse" />
          마지막까지 최선을 다하세요!
        </p>
      </div>
    </motion.div>
  );
};

export default DDayHero;
