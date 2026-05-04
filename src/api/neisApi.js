const API_KEY = import.meta.env.VITE_NEIS_API_KEY;
const ATPT_CODE = 'J10'; // 경기도교육청
const SCHUL_CODE = '7530126'; // 청명고등학교

/**
 * 나이스 API에서 특정 연도의 학사일정을 모두 가져옵니다.
 */
export const fetchNeisSchedules = async (year = new Date().getFullYear()) => {
  const url = `https://open.neis.go.kr/hub/SchoolSchedule?Type=json&ATPT_OFCDC_SC_CODE=${ATPT_CODE}&SD_SCHUL_CODE=${SCHUL_CODE}&AA_YMD_FROM=${year}0101&AA_YMD_TO=${year + 1}0228`;
  
  const finalUrl = API_KEY ? `${url}&KEY=${API_KEY}` : url;

  try {
    // 페이지당 100개씩, 2페이지까지 호출하여 총 200개의 일정을 가져옴 (2학기 유실 방지)
    const fetchPage = async (page) => {
      const pUrl = `${finalUrl}&pIndex=${page}&pSize=100`;
      const res = await fetch(pUrl);
      return await res.json();
    };

    const [data1, data2] = await Promise.all([fetchPage(1), fetchPage(2)]);
    
    let allRows = [];
    if (data1.SchoolSchedule) {
      console.log('NEIS Total Count:', data1.SchoolSchedule[0].head[0].list_total_count);
      allRows = [...allRows, ...data1.SchoolSchedule[1].row];
    }
    if (data2.SchoolSchedule) {
      allRows = [...allRows, ...data2.SchoolSchedule[1].row];
    }

    if (allRows.length > 0) {
      console.log(`Total NEIS rows merged from 2 pages: ${allRows.length}`);
      
      return allRows
        .filter(row => {
          const name = row.EVENT_NM || '';
          const dayOffType = row.SBTR_DD_SC_NM || '';
          const isFirstGrade = row.ONE_GRADE_EVENT_YN === 'Y';
          
          // 1. 제외 키워드: 지필평가(Supabase에서 관리), 방학
          const isExcluded = name.includes('지필') || name.includes('방학') || dayOffType.includes('방학');

          // 2. 사용자 요청 제외: 공휴일, 휴업일 (모의고사는 다시 포함)
          const isHoliday = dayOffType.includes('공휴일') || dayOffType.includes('휴업일') || name.includes('휴업');
          
          // 3. 주말 및 타 학년 제외
          const dateObj = new Date(formatDate(row.AA_YMD));
          const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
          const isOtherGradeOnly = (row.TW_GRADE_EVENT_YN === 'Y' || row.THREE_GRADE_EVENT_YN === 'Y') && !isFirstGrade;

          // 모든 필터 적용
          if (isExcluded || isOtherGradeOnly || isWeekend || isHoliday) return false;

          // 모의고사/학력평가 관련 키워드 확인 (분류를 위해)
          const isMock = name.includes('모의') || name.includes('연합') || name.includes('수능') || name.includes('평가');

          // 최종: 시험 관련(모의 포함)이거나 기타 학사 일정인 경우 통과
          return true;
        })
        .map(row => ({
          id: `neis-${row.AA_YMD}-${row.EVENT_NM}`,
          title: row.EVENT_NM || row.SBTR_DD_SC_NM,
          date: formatDate(row.AA_YMD),
          type: getScheduleType(row.EVENT_NM || row.SBTR_DD_SC_NM, row.SBTR_DD_SC_NM || ''),
          isOfficial: true,
          targetGrades: {
            1: row.ONE_GRADE_EVENT_YN === 'Y',
            2: row.TW_GRADE_EVENT_YN === 'Y',
            3: row.THREE_GRADE_EVENT_YN === 'Y'
          }
        }));
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch NEIS schedules:', error);
    return [];
  }
};

// YYYYMMDD -> YYYY-MM-DD 변환
const formatDate = (dateStr) => {
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
};

// 행사명 및 휴업일 여부에 따른 타입 분류
const getScheduleType = (name, dayOffType = '') => {
  if (name.includes('중간')) return '중간';
  if (name.includes('기말')) return '기말';
  if (name.includes('모의')) return '모의';
  if (name.includes('연합')) return '모의';
  if (name.includes('방학')) return '방학';
  if (name.includes('수능')) return '모의';
  if (dayOffType.includes('공휴일') || dayOffType.includes('휴업일') || name.includes('휴업')) return '공휴일';
  return '일반';
};
