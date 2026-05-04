import { supabase } from '../lib/supabase';

/**
 * 1. 현재 날짜 기준 가장 가까운 미래 일정 2개 가져오기 (각 일정의 시험 범위 포함)
 * - 테이블명: exam_schedules, exam_subject_ranges
 */
/**
 * 1. 현재 날짜 기준 미래 일정들 가져오기
 * @param {number} fetchLimit - 불러올 개수 (기본 2개)
 */
export const fetchUpcomingSchedules = async (fetchLimit = 10) => {
  const { data, error } = await supabase
    .from('exam_schedules')
    .select(`
      *,
      exam_subject_ranges (*)
    `)
    .gte('date', new Date().toISOString().split('T')[0]) 
    .order('date', { ascending: true }) 
    .limit(fetchLimit);

  if (error) {
    console.error('Error fetching upcoming schedules:', error);
    return null;
  }
  return data;
};

/**
 * 2. 모든 일정 가져오기
 */
export const fetchAllSchedules = async () => {
  const { data, error } = await supabase
    .from('exam_schedules')
    .select(`
      *,
      exam_subject_ranges (*)
    `)
    .order('date', { ascending: true }); // 날짜순 정렬

  if (error) {
    console.error('Error fetching all schedules:', error);
    return null;
  }
  return data;
};

/**
 * 3. 지난 일정 가져오기
 */
export const fetchPastSchedules = async () => {
  const { data, error } = await supabase
    .from('exam_schedules')
    .select('*')
    .lt('date', new Date().toISOString().split('T')[0]) // 현재 날짜 이전 (오늘 제외)
    .order('date', { ascending: false }); // 최신순 (최근 지난 일정부터)

  if (error) {
    console.error('Error fetching past schedules:', error);
    return null;
  }
  return data;
};

/**
 * 3. 특정 과목의 시험 범위 텍스트 업데이트 (Admin 전용)
 * @param {string} rangeId - exam_subject_ranges 테이블의 ID
 * @param {string} newContent - 업데이트할 시험 범위 텍스트
 */
export const updateExamRange = async (rangeId, updates) => {
  const { data, error } = await supabase
    .from('exam_subject_ranges')
    .update(updates)
    .eq('id', rangeId)
    .select(); // 업데이트된 결과 반환

  if (error) {
    console.error('Error updating exam range:', error);
    throw error;
  }
  return data;
};
/**
 * 4. 새로운 시험 일정 추가
 * @param {object} schedule - { title, date, type }
 */
export const createSchedule = async (schedule) => {
  const { data, error } = await supabase
    .from('exam_schedules')
    .insert([schedule])
    .select();

  if (error) {
    console.error('Error creating schedule:', error);
    throw error;
  }
  return data[0];
};

/**
 * 5. 시험 일정 삭제
 * @param {string} scheduleId
 */
export const deleteSchedule = async (scheduleId) => {
  const { error } = await supabase
    .from('exam_schedules')
    .delete()
    .eq('id', scheduleId);

  if (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
  return true;
};

/**
 * 6. 새로운 과목 범위 추가
 * @param {object} range - { subject, content, schedule_id }
 */
export const createExamRange = async (range) => {
  const { data, error } = await supabase
    .from('exam_subject_ranges')
    .insert([{
      subject: range.subject,
      content: range.content,
      schedule_id: range.schedule_id,
      exam_date: range.exam_date,
      material_url: range.material_url // 추가된 필드
    }])
    .select();

  if (error) {
    console.error('Error creating exam range:', error);
    throw error;
  }
  return data[0];
};

/**
 * 7. 공지사항 가져오기
 */
export const fetchNotices = async () => {
  const { data, error } = await supabase
    .from('exam_notices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notices:', error);
    return null;
  }
  return data;
};

/**
 * 8. 공지사항 추가
 */
export const createNotice = async (title, content) => {
  const { data, error } = await supabase
    .from('exam_notices')
    .insert([{ title, content }])
    .select();

  if (error) {
    console.error('Error creating notice:', error);
    throw error;
  }
  return data[0];
};

/**
 * 9. 공지사항 삭제
 */
export const deleteNotice = async (id) => {
  const { error } = await supabase
    .from('exam_notices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting notice:', error);
    throw error;
  }
  return true;
};

/**
 * 10. 추가 사이트(링크) 가져오기
 */
export const fetchExtraLinks = async () => {
  const { data, error } = await supabase
    .from('extra_links')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching extra links:', error);
    return null;
  }
  return data;
};

/**
 * 11. 추가 사이트(링크) 추가
 */
export const createExtraLink = async (title, url, description = '') => {
  const { data, error } = await supabase
    .from('extra_links')
    .insert([{ title, url, description }])
    .select();

  if (error) {
    console.error('Error creating extra link:', error);
    throw error;
  }
  return data[0];
};

/**
 * 12. 추가 사이트(링크) 삭제
 */
export const deleteExtraLink = async (id) => {
  const { error } = await supabase
    .from('extra_links')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting extra link:', error);
    throw error;
  }
  return true;
};

/**
 * 13. 학생회 이벤트 가져오기
 */
export const fetchStudentEvents = async () => {
  const { data, error } = await supabase
    .from('student_council_events')
    .select('*')
    .order('event_date', { ascending: true }); // 날짜순 정렬

  if (error) {
    console.error('Error fetching student events:', error);
    return null;
  }
  return data;
};

/**
 * 14. 학생회 이벤트 추가
 */
export const createStudentEvent = async (eventData) => {
  const { data, error } = await supabase
    .from('student_council_events')
    .insert([eventData])
    .select();

  if (error) {
    console.error('Error creating student event:', error);
    throw error;
  }
  return data[0];
};

/**
 * 15. 학생회 이벤트 삭제
 */
export const deleteStudentEvent = async (id) => {
  const { error } = await supabase
    .from('student_council_events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting student event:', error);
    throw error;
  }
  return true;
};

/**
 * 16. 일정 추가 요청 웹후크 전송
 * @param {object} requestData - { studentInfo, content }
 */
export const sendScheduleRequest = async (requestData) => {
  const WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL; 
  
  if (!WEBHOOK_URL) {
    console.warn('Webhook URL is not defined.');
    return { success: false, message: '웹후크 URL이 설정되지 않았습니다.' };
  }

  const payload = {
    embeds: [{
      title: '📅 일정 추가 요청',
      color: 5814783, // Indigo color
      fields: [
        { name: '👤 신청인 (학번이름)', value: requestData.studentInfo, inline: true },
        { name: '📝 요청 내용', value: requestData.content }
      ],
      timestamp: new Date().toISOString(),
      footer: { text: 'Cheongmyeong Exam System' }
    }]
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return { success: true };
    } else {
      throw new Error('Webhook request failed');
    }
  } catch (error) {
    console.error('Error sending schedule request:', error);
    return { success: false, message: '전송 중 오류가 발생했습니다.' };
  }
};
