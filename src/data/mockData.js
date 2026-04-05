export const EXAM_DATA = {
  id: 1,
  name: "2024학년도 1학기 지필평가 (중간)",
  date: "2024-04-20",
  subjects: [
    { id: 'kr', name: "국어", range: "1단원. 문학의 감상 ~ 3단원. 언어의 세계 (p.10~124)", teacher: "김철수" },
    { id: 'math', name: "수학", range: "I. 다항식 ~ II. 방정식과 부등식 (p.8~96)", teacher: "이영희" },
    { id: 'en', name: "영어", range: "Lesson 1 ~ Lesson 3, 3월 모의고사 변형문제 10문항", teacher: "Park S." },
    { id: 'sci', name: "과학", range: "I. 물질의 규칙성과 결합 (p.12~78)", teacher: "최민수" },
    { id: 'his', name: "한국사", range: "추후 공지 예정", teacher: "박한나" },
  ]
};

export const ACADEMIC_SCHEDULE = [
  { id: 1, title: "현장체험학습 (에버랜드)", date: "2024-04-12", type: "event" },
  { id: 2, title: "1학기 중간고사 개시", date: "2024-04-20", type: "exam" },
  { id: 3, title: "축제 (청명제) 준비 기간", date: "2024-05-02", type: "event" },
  { id: 4, title: "개교기념일", date: "2024-03-30", type: "holiday", past: true },
];

export const NOTICES = [
  { id: 1, title: "시험 기간 내 도서관 연장 운영 안내", date: "2024-04-01" },
  { id: 2, title: "급식 메뉴 변경 안내 (4월 15일)", date: "2024-04-03" },
];
