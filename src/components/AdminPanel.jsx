import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, RefreshCw as Loader2, CheckCircle2, AlertCircle, Lock, Calendar, BookOpen, ArrowRight, Settings, Bell as Megaphone, ChevronDown, ChevronUp, Clock, HelpCircle as Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  fetchAllSchedules, 
  updateExamRange, 
  createSchedule, 
  deleteSchedule,
  createExamRange,
  fetchNotices,
  createNotice,
  deleteNotice
} from '../api/examApi';

const AdminPanel = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Toggles for forms
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [expandedScheduleForms, setExpandedScheduleForms] = useState({});

  const [newExam, setNewExam] = useState({ title: '', date: '', end_date: '', type: '중간' });
  const [newNotice, setNewNotice] = useState({ title: '', content: '' });

  useEffect(() => {
    // 세션 체크
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        loadAllData();
      }
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadAllData();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const [scheduleData, noticeData] = await Promise.all([
      fetchAllSchedules(),
      fetchNotices()
    ]);
    if (scheduleData) setSchedules(scheduleData);
    if (noticeData) setNotices(noticeData);
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      setMessage({ type: 'success', text: '인증되었습니다.' });
    } catch (error) {
      setMessage({ type: 'error', text: '로그인 실패: ' + (error.message === 'Invalid login credentials' ? '계정 정보가 올바르지 않습니다.' : error.message) });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      const payload = { ...newExam };
      if (!payload.end_date) delete payload.end_date;
      await createSchedule(payload);
      setMessage({ type: 'success', text: '일정이 추가되었습니다.' });
      setShowAddSchedule(false);
      setNewExam({ title: '', date: '', end_date: '', type: '중간' });
      await loadAllData();
    } catch (error) {
      console.error('Error adding schedule:', error);
      setMessage({ type: 'error', text: '일정 추가 중 오류가 발생했습니다.' });
    } finally {
      setProcessing(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!newNotice.title) return;
    try {
      setProcessing(true);
      await createNotice(newNotice.title, newNotice.content);
      setMessage({ type: 'success', text: '공지가 등록되었습니다.' });
      setShowAddNotice(false);
      setNewNotice({ title: '', content: '' });
      await loadAllData();
    } catch (error) {
      console.error('Error adding notice:', error);
      setMessage({ type: 'error', text: '공지 등록 실패' });
    } finally {
      setProcessing(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      setProcessing(true);
      await deleteSchedule(id);
      await loadAllData();
      setMessage({ type: 'success', text: '일정이 삭제되었습니다.' });
    } catch (error) {
      setMessage({ type: 'error', text: '삭제 실패' });
    } finally {
      setProcessing(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('공지를 삭제하시겠습니까?')) return;
    try {
      setProcessing(true);
      await deleteNotice(id);
      await loadAllData();
      setMessage({ type: 'success', text: '공지가 삭제되었습니다.' });
    } catch (error) {
      setMessage({ type: 'error', text: '삭제 실패' });
    } finally {
      setProcessing(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleAddSubject = async (scheduleId, subjectName, examDate) => {
    if (!subjectName || !examDate) return;
    try {
      setProcessing(true);
      await createExamRange({ 
        subject: subjectName, 
        content: '', 
        schedule_id: scheduleId,
        exam_date: examDate 
      });
      await loadAllData();
      setMessage({ type: 'success', text: '과목이 추가되었습니다.' });
      toggleSubjectForm(scheduleId);
    } catch (error) {
      setMessage({ type: 'error', text: '과목 추가 실패' });
    } finally {
      setProcessing(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    }
  };

  const toggleSubjectForm = (id) => {
    setExpandedScheduleForms(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleUpdateContent = async (rangeId, content) => {
    try {
      setProcessing(true);
      await updateExamRange(rangeId, content);
      setMessage({ type: 'success', text: '내용이 저장되었습니다.' });
    } catch (error) {
      setMessage({ type: 'error', text: '저장 실패' });
    } finally {
      setProcessing(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
        <div className="w-full max-w-sm rounded-[40px] bg-white p-10 shadow-2xl border border-slate-100 text-center">
          <div className="h-20 w-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-8 mx-auto shadow-inner">
            <Lock size={36} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">관리자 로그인</h2>
          <p className="text-[13px] font-bold text-slate-400 mb-8 italic">인증된 관리자만 접근 가능합니다.</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Admin Email</label>
              <input 
                type="email" required
                placeholder="admin@school.com"
                className="w-full rounded-2xl bg-slate-50 p-4 text-[14px] font-bold outline-none border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-inner"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5 text-left mb-2">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Password</label>
              <input 
                type="password" required
                placeholder="••••••••"
                className="w-full rounded-2xl bg-slate-50 p-4 text-[14px] font-bold outline-none border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-inner"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button disabled={processing} className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50">
              {processing ? '인증 중...' : '로 그 인'}
            </button>
          </form>
          {message.type === 'error' && <p className="mt-6 text-[11px] font-black text-rose-500 uppercase tracking-widest break-keep">{message.text}</p>}
          <p className="mt-8 text-[10px] font-black text-slate-300">
             * 대시보드에서 관리자 계정을 생성해야 합니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-2 pb-32 h-full overflow-y-auto scrollbar-hide">
      <header className="flex items-center justify-between sticky top-0 py-4 bg-slate-50/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tighter">
            <Settings className="text-indigo-600" size={24} /> 관리 센터
          </h2>
          {loading && <Loader2 size={20} className="animate-spin text-slate-300" />}
        </div>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-slate-200 text-slate-600 text-[11px] font-black hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
        >
          LOGOUT
        </button>
      </header>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 rounded-2xl px-5 py-4 text-[13px] font-black shadow-lg ${
          message.type === 'success' ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 'bg-rose-500 text-white shadow-rose-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </motion.div>
      )}

      {/* --- 공지사항 관리 섹션 --- */}
      <section className="flex flex-col gap-4 bg-white rounded-[32px] p-6 shadow-soft border border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 lowercase tracking-tighter">
            <Megaphone size={20} className="text-indigo-600" /> announce manager
          </h3>
          <button 
            onClick={() => setShowAddNotice(!showAddNotice)}
            className={`rounded-xl p-2 transition-all ${showAddNotice ? 'bg-slate-100 text-slate-400 rotate-45' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'}`}
          >
            <Plus size={20} />
          </button>
        </div>

        <AnimatePresence>
          {showAddNotice && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreateNotice} 
              className="flex flex-col gap-4 overflow-hidden"
            >
              <div className="h-px bg-slate-50 w-full mb-2" />
              <input required
                placeholder="공지 제목"
                className="w-full rounded-2xl bg-slate-50 p-4 text-[13px] font-bold outline-none border border-transparent focus:border-indigo-100 focus:bg-white transition-all"
                value={newNotice.title} onChange={e => setNewNotice({...newNotice, title: e.target.value})}
              />
              <textarea
                placeholder="공지 상세 내용 (선택사항)"
                className="w-full rounded-2xl bg-slate-50 p-4 text-[13px] font-bold outline-none border border-transparent focus:border-indigo-100 focus:bg-white transition-all min-h-[100px] resize-none"
                value={newNotice.content} onChange={e => setNewNotice({...newNotice, content: e.target.value})}
              />
              <button disabled={processing} className="py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm hover:shadow-xl active:scale-95 transition-all">
                {processing ? 'Processing...' : '공지 올리기'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-3 mt-2">
          {notices.map(notice => (
            <div key={notice.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-black text-slate-700">{notice.title}</span>
                <span className="text-[10px] font-bold text-slate-300">{new Date(notice.created_at).toLocaleDateString()}</span>
              </div>
              <button onClick={() => handleDeleteNotice(notice.id)} className="p-2 text-slate-200 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {notices.length === 0 && <p className="text-center text-[11px] font-bold text-slate-300 py-4 italic">No active notices.</p>}
        </div>
      </section>

      {/* --- 일정 추가 섹션 --- */}
      <section className="flex flex-col gap-4">
        <button 
          onClick={() => setShowAddSchedule(!showAddSchedule)}
          className={`w-full flex items-center justify-between bg-white rounded-[28px] p-6 shadow-soft border border-slate-100 group transition-all ${showAddSchedule ? 'border-indigo-400 ring-4 ring-indigo-50' : 'hover:border-indigo-200'}`}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
               <Calendar size={20} />
            </div>
            <span className="font-black text-slate-800 tracking-tighter">새로운 일정 추가하기</span>
          </div>
          {showAddSchedule ? <ChevronUp size={20} className="text-indigo-400" /> : <ChevronDown size={20} className="text-slate-300" />}
        </button>

        <AnimatePresence>
          {showAddSchedule && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="rounded-[32px] bg-white p-7 shadow-xl border-2 border-indigo-100 overflow-hidden"
            >
              <form onSubmit={handleCreateSchedule} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Event Title</label>
                  <input required
                    className="rounded-2xl bg-slate-50 p-4 text-[14px] font-black outline-none border-2 border-transparent focus:border-indigo-50 focus:bg-white transition-all shadow-inner"
                    placeholder="예: 2학기 지필평가"
                    value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Start Date</label>
                    <input required type="date"
                      className="rounded-2xl bg-slate-50 p-4 text-[13px] font-black outline-none border-2 border-transparent focus:border-indigo-50 transition-all font-mono"
                      value={newExam.date} onChange={e => setNewExam({...newExam, date: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">End Date</label>
                    <input type="date"
                      className="rounded-2xl bg-slate-50 p-4 text-[13px] font-black outline-none border-2 border-transparent focus:border-indigo-50 transition-all font-mono"
                      value={newExam.end_date} onChange={e => setNewExam({...newExam, end_date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Type Category</label>
                  <select 
                    className="rounded-2xl bg-slate-50 p-4 text-[13px] font-black outline-none border-2 border-transparent focus:border-indigo-50 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%20fill%3D%22none%22%20stroke%3D%22%236366f1%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:18px] bg-[right_1.2rem_center] bg-no-repeat"
                    value={newExam.type} onChange={e => setNewExam({...newExam, type: e.target.value})}
                  >
                    <option value="중간">중간고사</option>
                    <option value="기말">기말고사</option>
                    <option value="모의">모의고사</option>
                    <option value="방학">방학/기타</option>
                  </select>
                </div>
                <button disabled={processing} className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-sm hover:shadow-2xl hover:bg-black transition-all active:scale-95 mt-2">
                  {processing ? 'Processing...' : '저 장 완 료'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* --- 기존 일정 리스트 --- */}
      <div className="flex flex-col gap-12 mt-6">
        <h3 className="text-xl font-black text-slate-800 px-2 tracking-tighter lowercase">existing schedules</h3>
        {schedules.map(exam => {
          const sortedRanges = [...(exam.exam_subject_ranges || [])].sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));
          const isAddingSubject = expandedScheduleForms[exam.id];
          
          return (
            <div key={exam.id} className="flex flex-col gap-6 relative">
              <div className="flex items-start justify-between px-3">
                <div className="flex flex-col">
                   <h4 className="text-[18px] font-black text-slate-800 leading-tight">{exam.title}</h4>
                   <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300 mt-2">
                      <span className="bg-indigo-50 text-indigo-500 px-2.5 py-0.5 rounded-full uppercase tracking-tighter text-[9px] font-black">{exam.type}</span>
                      <span>{exam.date}</span>
                      {exam.end_date && <><ArrowRight size={10} className="opacity-40" /><span>{exam.end_date}</span></>}
                   </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button onClick={() => handleDeleteSchedule(exam.id)} className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4 px-1">
                {sortedRanges.map(range => (
                  <div key={range.id} className="rounded-[28px] bg-white p-6 shadow-soft border border-slate-100 flex flex-col gap-3 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="h-2 w-2 rounded-full bg-indigo-500" />
                         <span className="text-[13px] font-black text-indigo-600">{range.subject}</span>
                         <span className="text-[10px] font-bold text-slate-300">{range.exam_date}</span>
                      </div>
                      <button className="text-slate-200 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition-all">
                         <Trash2 size={16} />
                      </button>
                    </div>
                    <textarea 
                      className="w-full text-[13px] font-bold text-slate-500 outline-none resize-none bg-slate-50/30 p-3 rounded-2xl border border-transparent focus:border-slate-100 focus:bg-white min-h-[80px] transition-all leading-relaxed"
                      defaultValue={range.content || ''}
                      onBlur={(e) => handleUpdateContent(range.id, e.target.value)}
                      placeholder="시험 범위를 입력하세요."
                    />
                  </div>
                ))}

                {/* 과목 추가 폼 (아코디언) */}
                <div className={`rounded-[32px] overflow-hidden transition-all duration-500 ${isAddingSubject ? 'bg-indigo-50/30 border-2 border-indigo-100 shadow-lg' : 'bg-white border-2 border-dashed border-slate-100'}`}>
                   <button 
                     onClick={() => toggleSubjectForm(exam.id)}
                     className="w-full flex items-center justify-center gap-2 p-5 text-center transition-all group"
                   >
                     {isAddingSubject ? (
                        <>
                          <X size={16} className="text-indigo-400" />
                          <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Cancel adding subject</span>
                        </>
                     ) : (
                        <>
                          <Plus size={16} className="text-slate-300 group-hover:text-indigo-500 transition-all" />
                          <span className="text-[11px] font-black text-slate-400 group-hover:text-slate-600 tracking-widest uppercase">new subject</span>
                        </>
                     )}
                   </button>

                   <AnimatePresence>
                     {isAddingSubject && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-6 pb-6"
                        >
                          <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1 px-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Subject Name</label>
                                <input 
                                  placeholder="과목명"
                                  className="rounded-[18px] bg-white p-4 text-[13px] font-black border border-slate-100 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/10"
                                  id={`subj-name-${exam.id}`}
                                />
                              </div>
                              <div className="flex flex-col gap-1 px-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Exam Date</label>
                                <input 
                                  type="date"
                                  min={exam.date}
                                  max={exam.end_date || exam.date}
                                  defaultValue={exam.date}
                                  className="rounded-[18px] bg-white p-4 text-[13px] font-black border border-slate-100 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/10"
                                  id={`subj-date-${exam.id}`}
                                />
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                const name = document.getElementById(`subj-name-${exam.id}`).value;
                                const date = document.getElementById(`subj-date-${exam.id}`).value;
                                handleAddSubject(exam.id, name, date);
                              }}
                              className="w-full py-4 rounded-[20px] bg-indigo-600 text-white font-black text-xs hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                            >
                              Add This Subject
                            </button>
                          </div>
                        </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPanel;
