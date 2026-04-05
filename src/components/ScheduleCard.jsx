import React from 'react';
import { CalendarDays, Flag, PartyPopper, ArrowRight, Sparkles, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScheduleCard = ({ schedule, isExpanded, onClick }) => {
  const isPast = new Date(schedule.date) < new Date().setHours(0,0,0,0);

  const getIcon = (type) => {
    switch (type) {
      case '중간':
      case '기말': 
        return <Flag className="text-rose-500" size={20} strokeWidth={2.5} />;
      case '모의': 
        return <Sparkles className="text-indigo-500" size={20} strokeWidth={2.5} />;
      case '방학': 
        return <CalendarDays className="text-emerald-500" size={20} strokeWidth={2.5} />;
      default: 
        return <CalendarDays className="text-slate-400" size={20} strokeWidth={2.5} />;
    }
  };

  const hasSubjects = schedule.exam_subject_ranges && schedule.exam_subject_ranges.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <motion.div 
        layout
        onClick={onClick}
        whileHover={!isPast ? { y: -4, scale: 1.01 } : {}}
        whileTap={!isPast ? { scale: 0.98 } : {}}
        className={`relative flex items-center gap-5 rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all duration-300 group cursor-pointer ${
          isPast ? 'opacity-50 grayscale pointer-events-none border-slate-100' : 
          isExpanded ? 'border-indigo-400 ring-4 ring-indigo-50 shadow-indigo-100/50' : 'border-slate-100/80 hover:shadow-[0_15px_40px_rgba(79,70,229,0.08)] hover:border-indigo-100 hover:bg-slate-50/50'
        }`}
      >
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] transition-all duration-500 ${
          isPast ? 'bg-slate-100' : 'bg-indigo-50 group-hover:bg-indigo-100 group-hover:rotate-6'
        }`}>
          {getIcon(schedule.type)}
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <h4 className={`text-[15px] font-black tracking-tight ${isPast ? 'text-slate-500' : 'text-slate-800'}`}>
            {schedule.title}
          </h4>
          <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 mt-1">
            <span className="bg-slate-100 px-2 py-0.5 rounded-lg">{schedule.date}</span>
            {schedule.end_date && (
              <>
                <ArrowRight size={12} className="text-slate-300" />
                <span className="bg-slate-100 px-2 py-0.5 rounded-lg">{schedule.end_date}</span>
              </>
            )}
          </div>
        </div>

        <div className="ml-auto shrink-0 flex items-center gap-3">
          {hasSubjects && (
            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-600' : 'text-slate-300'}`}>
               <ChevronDown size={20} strokeWidth={3} />
            </div>
          )}
          {!isPast && !isExpanded && (
            <div className="rounded-full bg-indigo-600/10 px-3 py-1 text-[10px] font-black uppercase text-indigo-600 tracking-tighter border border-indigo-200/30">
              Active
            </div>
          )}
        </div>
      </motion.div>

      {/* Expanded Subject List */}
      <AnimatePresence>
        {isExpanded && hasSubjects && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="overflow-hidden mx-2"
          >
            <div className="bg-indigo-50/50 rounded-[28px] p-6 border border-indigo-100 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={16} className="text-indigo-600" />
                <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Exam Subjects & Ranges</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {schedule.exam_subject_ranges.map((range, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100/50 flex flex-col gap-1">
                     <span className="text-xs font-black text-indigo-600">{range.subject}</span>
                     <p className="text-[13px] font-bold text-slate-600 leading-relaxed">
                        {range.content || '추후 공지 예정'}
                     </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScheduleCard;
