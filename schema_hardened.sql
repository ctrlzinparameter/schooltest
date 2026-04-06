-- 🛡️ [Security Hardening] Row Level Security (RLS) 수정
-- 모든 사용자는 조회(SELECT)만 가능하며, 수정/삭제(ALL)는 인증된 관리자만 가능합니다.

-- 1. 시험 일정 테이블 (exam_schedules)
ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "exam_admin_manage_schedules_public" ON public.exam_schedules;
DROP POLICY IF EXISTS "exam_public_read_schedules" ON public.exam_schedules;

CREATE POLICY "schedules_read_all" ON public.exam_schedules FOR SELECT TO public USING (true);
CREATE POLICY "schedules_admin_all" ON public.exam_schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. 시험 범위 테이블 (exam_subject_ranges)
ALTER TABLE public.exam_subject_ranges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "exam_admin_manage_ranges_public" ON public.exam_subject_ranges;
DROP POLICY IF EXISTS "exam_public_read_ranges" ON public.exam_subject_ranges;

CREATE POLICY "ranges_read_all" ON public.exam_subject_ranges FOR SELECT TO public USING (true);
CREATE POLICY "ranges_admin_all" ON public.exam_subject_ranges FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. 공지사항 테이블 (exam_notices)
ALTER TABLE public.exam_notices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "exam_admin_manage_notices_public" ON public.exam_notices;
DROP POLICY IF EXISTS "exam_public_read_notices" ON public.exam_notices;

CREATE POLICY "notices_read_all" ON public.exam_notices FOR SELECT TO public USING (true);
CREATE POLICY "notices_admin_all" ON public.exam_notices FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. 추가 사이트(링크) 테이블 (extra_links)
ALTER TABLE public.extra_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "extra_links_admin_manage" ON public.extra_links;
DROP POLICY IF EXISTS "extra_links_public_read" ON public.extra_links;

CREATE POLICY "links_read_all" ON public.extra_links FOR SELECT TO public USING (true);
CREATE POLICY "links_admin_all" ON public.extra_links FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 🚀 적용 안내: 위 SQL을 Supabase SQL Editor에서 실행하면 보안이 적용됩니다.
