import React, { useState, useEffect } from 'react';
import { Home, Book, Calendar, Bell, ChevronRight, Menu, RefreshCw as Loader2, Settings, Shield, AlertTriangle, X, MessageCircle as Instagram, HelpCircle as Info, Bell as Megaphone, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DDayHero from './components/DDayHero';
import ScheduleCard from './components/ScheduleCard';
import ExamRangeSection from './components/ExamRangeSection';
import AdminPanel from './components/AdminPanel';
import { fetchAllSchedules, fetchNotices, fetchExtraLinks } from './api/examApi';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [schedules, setSchedules] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extraLinks, setExtraLinks] = useState([]);
  const [error, setError] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [expandedScheduleId, setExpandedScheduleId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // 모든 데이터를 병렬로 병합 로드
        const [scheduleData, noticeData, linkData] = await Promise.all([
          fetchAllSchedules(),
          fetchNotices(),
          fetchExtraLinks()
        ]);

        if (scheduleData) {
          const sorted = [...scheduleData].sort((a, b) => new Date(a.date) - new Date(b.date));
          setSchedules(sorted);
        }
        if (noticeData) {
          setNotices(noticeData);
        }
        if (linkData) {
          setExtraLinks(linkData);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAdminAccessAttempt = () => {
    setIsAdminModalOpen(true);
  };

  const confirmAdminAccess = () => {
    setIsAdminModalOpen(false);
    setActiveTab('admin');
  };

  const handleScheduleClick = (id) => {
    if (activeTab === 'schedule') {
      setExpandedScheduleId(expandedScheduleId === id ? null : id);
    }
  };

  // 오늘 날짜 기준 (시간 정보 제거하여 정확한 날짜 비교)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 미래 일정만 필터링 (홈 화면 및 D-Day용)
  const upcomingOnly = schedules.filter(s => new Date(s.date) >= today);
  
  // 메인 시험 타겟팅: 미래 일정 중 중간, 기말, 모의 중 가장 가까운 것
  const mainExam = upcomingOnly.find(s => ['중간', '기말', '모의'].includes(s.type)) || upcomingOnly[0] || null;
  
  // 홈 화면용 최근 2개 일정 (미래 일정 기준)
  const homeSchedules = upcomingOnly.slice(0, 2);

  const subjects = mainExam?.exam_subject_ranges?.map(r => ({
    id: r.id,
    name: r.subject,
    range: r.content || '추후 공지 예정',
    teacher: '담당 교사' 
  })) || [];

  // 텍스트 내의 URL을 감지하여 클릭 가능한 링크로 변환하는 함수
  const renderContentWithLinks = (content) => {
    if (!content) return '공지 내용이 없습니다.';
    
    // URL을 찾는 정규표현식
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 underline decoration-indigo-200 underline-offset-4 hover:text-indigo-800 transition-colors break-all"
            onClick={(e) => e.stopPropagation()} // 카드 클릭 이벤트와 충돌 방지
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 font-sans text-slate-900 pb-32">
      {/* Custom Admin Warning Modal */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-xs bg-white rounded-[40px] overflow-hidden shadow-2xl relative"
            >
              <div className="bg-indigo-600 p-8 flex flex-col items-center text-center text-white relative">
                <div className="absolute top-4 right-4 cursor-pointer opacity-60 hover:opacity-100 transition-opacity" onClick={() => setIsAdminModalOpen(false)}>
                  <X size={20} />
                </div>
                <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/30">
                  <AlertTriangle size={40} className="text-white" />
                </div>
                <h3 className="text-xl font-black tracking-tight leading-tight mb-2">ACCESS<br/>WARNING</h3>
              </div>
              
              <div className="p-8 text-center">
                <p className="text-slate-500 text-sm font-bold leading-relaxed mb-8">
                  주의: 관리자 모드 액세스를 시도하고 있습니다. <span className="text-indigo-600 font-black">관리자가 아니라면</span> 즉시 돌아가십시오.
                </p>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={confirmAdminAccess}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform"
                  >
                    본인은 관리자입니다
                  </button>
                  <button 
                    onClick={() => setIsAdminModalOpen(false)}
                    className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl text-sm font-black active:scale-95 transition-transform"
                  >
                    돌아가기
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto flex w-full max-w-md flex-col overflow-hidden bg-transparent">
        
        <header className="flex h-20 items-center justify-between px-6 bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-100/50">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-600/30 group-active:scale-90 transition-transform">CM</div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tighter text-indigo-900 leading-none">Cheongmyeong</h1>
              <span className="text-[10px] opacity-30 font-black uppercase tracking-widest leading-none mt-0.5">Exam System</span>
            </div>
          </div>
          <button 
            onClick={handleAdminAccessAttempt} 
            className={`rounded-2xl p-3 transition-all ${activeTab === 'admin' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100'}`}
          >
            <Shield size={22} />
          </button>
        </header>

        <main className="flex flex-col gap-6 px-4 pt-6">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-8"
              >
                {/* Hero Section */}
                {mainExam ? (
                  <DDayHero 
                    examName={mainExam.title} 
                    targetDate={mainExam.date} 
                    endDate={mainExam.end_date}
                  />
                ) : (
                  <div className="rounded-[40px] bg-white border-2 border-dashed border-slate-100 h-56 flex flex-col items-center justify-center text-slate-300 font-black px-8 text-center italic">
                    <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                      <Calendar size={32} className="opacity-30" />
                    </div>
                    등록된 시험 일정이 없습니다.
                  </div>
                )}

                {/* 실시간 공지 게시판 (Status Report 대체) */}
                <section className="flex flex-col gap-4">
                  <div className="flex items-center justify-between px-3">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                       <Megaphone size={18} className="text-indigo-600" /> 공지사항
                    </h2>
                  </div>
                  <div className="flex flex-col gap-3">
                    {notices.length > 0 ? (
                      notices.map(notice => (
                        <motion.div 
                          key={notice.id}
                          whileHover={{ x: 4 }}
                          onClick={() => setActiveTab('notice')}
                          className="rounded-[28px] bg-white p-6 shadow-soft border border-slate-100 group relative overflow-hidden cursor-pointer"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex items-center justify-between mb-1">
                             <h4 className="text-[14px] font-black text-slate-800">{notice.title}</h4>
                             <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <p className="text-[12px] font-bold text-slate-400 line-clamp-1 leading-relaxed">
                            {notice.content || '공지 내용이 없습니다.'}
                          </p>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-[10px] font-black bg-indigo-50 text-indigo-500 px-2.5 py-1 rounded-lg uppercase tracking-tighter">Official Notice</span>
                            <span className="text-[10px] font-bold text-slate-300 italic">{new Date(notice.created_at).toLocaleDateString()}</span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="rounded-[32px] bg-indigo-900/5 p-8 text-indigo-900/30 text-center italic font-black border-2 border-dashed border-indigo-900/10">
                        현재 등록된 공지사항이 없습니다.
                      </div>
                    )}
                  </div>
                </section>

                <section className="flex flex-col gap-4">
                  <div className="flex items-center justify-between px-3">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">예정된 학사 일정</h2>
                    <button 
                      onClick={() => setActiveTab('schedule')} 
                      className="flex items-center text-[11px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl uppercase tracking-tighter shadow-sm hover:bg-indigo-100 transition-colors"
                    >
                      전체보기 <ChevronRight size={14} className="ml-1" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {homeSchedules.length > 0 ? (
                      homeSchedules.map(schedule => (
                        <ScheduleCard 
                          key={schedule.id} 
                          schedule={schedule} 
                          onClick={() => {
                            setActiveTab('schedule');
                            setExpandedScheduleId(schedule.id);
                          }}
                        />
                      ))
                    ) : (
                      <p className="text-center text-xs text-slate-400 py-10 font-bold italic opacity-60">진행 중인 일정이 없습니다.</p>
                    )}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'links' && (
              <motion.div 
                key="links"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                <div className="px-3">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">추가<br/>사이트</h2>
                  <div className="h-1 w-12 bg-indigo-600 rounded-full mb-4" />
                  <p className="text-sm font-bold text-slate-400 leading-tight">개발자가 제작한 다른 유용한 사이트들입니다.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {extraLinks.length > 0 ? (
                    extraLinks.map((link) => (
                      <a 
                        key={link.id} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group rounded-[32px] bg-white p-6 shadow-soft border border-slate-100 flex items-center justify-between hover:border-indigo-200 transition-all active:scale-98"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Globe size={24} />
                          </div>
                          <div className="flex flex-col">
                            <h3 className="text-sm font-black text-slate-800">{link.title}</h3>
                            <p className="text-[11px] font-bold text-slate-400 line-clamp-1">{link.description || link.url}</p>
                          </div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                          <ChevronRight size={18} />
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="py-20 text-center flex flex-col items-center gap-4">
                      <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                        <Globe size={40} />
                      </div>
                      <p className="text-slate-300 font-black italic">등록된 사이트가 없습니다.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'notice' && (
              <motion.div 
                key="notice"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                <div className="px-3">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">중요<br/>공지사항</h2>
                  <div className="h-1 w-12 bg-indigo-600 rounded-full mb-4" />
                  <p className="text-sm font-bold text-slate-400 leading-tight">학교에서 전해드리는 최신 소식입니다.</p>
                </div>
                
                <div className="flex flex-col gap-4">
                  {notices.length > 0 ? (
                    notices.map((notice) => (
                      <div key={notice.id} className="rounded-[32px] bg-white p-8 shadow-soft border border-slate-100 flex flex-col gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                           <Megaphone size={60} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Official News</span>
                          <h3 className="text-xl font-black text-slate-800 leading-tight">{notice.title}</h3>
                          <span className="text-[11px] font-bold text-slate-300 italic">{new Date(notice.created_at).toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-slate-50 w-full" />
                        <p className="text-[14px] font-bold text-slate-500 leading-relaxed whitespace-pre-wrap">
                          {renderContentWithLinks(notice.content)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <p className="text-slate-300 font-black italic">표시할 공지사항이 없습니다.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'range' && (
              <motion.div 
                key="range"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                <div className="px-3">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">과목별<br/>시험 범위</h2>
                  <div className="h-1 w-12 bg-indigo-600 rounded-full mb-4" />
                  <p className="text-sm font-bold text-slate-400 leading-tight">
                    {mainExam ? `${mainExam.title} (${mainExam.date})` : '선택된 시험 정보가 없습니다.'}
                  </p>
                </div>
                <ExamRangeSection subjects={subjects} />
              </motion.div>
            )}

            {activeTab === 'schedule' && (
              <motion.div 
                key="schedule"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4"
              >
                <h2 className="text-3xl font-black text-slate-900 px-3 tracking-tighter">전체 일정</h2>
                <p className="text-sm font-bold text-slate-400 px-3 mb-4">과거와 미래의 모든 일정을 확인할 수 있습니다.</p>
                <div className="flex flex-col gap-3">
                   {schedules.map((s) => (
                     <ScheduleCard 
                        key={s.id} 
                        schedule={s} 
                        isExpanded={expandedScheduleId === s.id}
                        onClick={() => handleScheduleClick(s.id)}
                     />
                   ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'admin' && (
              <motion.div 
                key="admin"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col gap-6"
              >
                <AdminPanel />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Area */}
          <footer className="mt-12 mb-8 px-6 flex flex-col items-center text-center gap-6 border-t border-slate-100 pt-10 pb-8">
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-[13px] font-black text-slate-800 leading-tight">
                  이 사이트는 청명고등학교 공식 홈페이지가 아닙니다.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="h-px w-4 bg-slate-200" />
                  <p className="text-[11px] font-bold text-slate-400">made by parameter(강한결)</p>
                  <span className="h-px w-4 bg-slate-200" />
                </div>
              </div>
              
              <a href="https://instagram.com/rodotsian_pro" target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl group hover:bg-indigo-50 transition-all border border-slate-100 hover:border-indigo-100">
                <div className="h-6 w-6 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                  <Instagram size={14} />
                </div>
                <span className="text-[11px] font-black text-slate-500 group-hover:text-indigo-600 transition-colors">
                  문의·오류신고·요청사항: @rodotsian_pro
                </span>
              </a>
            </div>
            
            <div className="flex flex-col gap-1 max-w-[240px]">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full inline-block mx-auto">
                이 사이트는 아직 초기버전 입니다
              </p>
            </div>
            <p className="text-[9px] font-medium text-slate-300">&copy; 2026 Cheongmyeong Dev Team.</p>
          </footer>
        </main>
      </div>

      {/* Modern Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 flex h-24 w-full max-w-md -translate-x-1/2 items-center justify-around bg-white/70 backdrop-blur-2xl border-t border-slate-100/50 px-4 pb-6 z-[100] shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.05)]">
        {[
          { id: 'home', icon: Home, label: '홈' },
          { id: 'notice', icon: Megaphone, label: '공지' },
          { id: 'links', icon: Globe, label: '링크' },
          { id: 'range', icon: Book, label: '범위' },
          { id: 'schedule', icon: Calendar, label: '일정' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-col items-center justify-center transition-all p-3 rounded-2xl ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-3xl -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} className={`${activeTab === tab.id ? 'animate-bounce' : ''}`} />
            <span className={`mt-1 text-[10px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'opacity-100' : 'opacity-40'}`}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
