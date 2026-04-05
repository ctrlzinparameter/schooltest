import React, { useState } from 'react';
import { BookOpen, AlertCircle, Search, User, ChevronRight, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ExamRangeSection = ({ subjects }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Premium Search Bar */}
      <div className="relative group mx-2">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search size={20} className="text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="찾으시는 과목이 있나요?" 
          className="block w-full rounded-[24px] border border-slate-100 bg-white p-5 pl-14 text-[15px] font-bold shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none placeholder:text-slate-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((s, idx) => (
              <motion.div 
                key={s.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative overflow-hidden rounded-[32px] bg-white p-6 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-indigo-100 hover:shadow-[0_20px_50px_rgba(79,70,229,0.08)] transition-all"
              >
                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 h-32 w-32 bg-indigo-50/50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors" />
                
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-[18px] bg-indigo-600 p-3 shadow-lg shadow-indigo-600/30 text-white group-hover:rotate-6 transition-transform">
                        <BookOpen size={22} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">{s.name}</h3>
                        <div className="flex items-center gap-1.5 opacity-60">
                           <User size={12} className="text-slate-500 font-bold" />
                           <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider">
                             {s.teacher || '미지정'}
                           </span>
                        </div>
                      </div>
                    </div>
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                       <ChevronRight size={18} />
                    </div>
                  </div>
                  
                  <div className={`rounded-3xl p-5 ${s.range === "추후 공지 예정" ? 'bg-slate-50 border border-dashed border-slate-200' : 'bg-indigo-50/30 border border-indigo-100/50'}`}>
                    {s.range === "추후 공지 예정" ? (
                      <div className="flex items-center gap-2.5 text-slate-400">
                        <AlertCircle size={18} />
                        <span className="text-sm font-black italic tracking-tight">공지 확인 후 업데이트 예정입니다.</span>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                           <Hash size={16} className="text-indigo-400" />
                        </div>
                        <p className="text-[14px] font-bold leading-relaxed text-slate-600 tracking-tight">
                          {s.range}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="h-24 w-24 bg-slate-100 rounded-[40px] flex items-center justify-center mb-4 text-slate-300">
                <Search size={48} strokeWidth={1} />
              </div>
              <p className="text-lg font-black text-slate-300 italic tracking-widest uppercase">No Results Found</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExamRangeSection;
