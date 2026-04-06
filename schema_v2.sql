-- 🚀 추가 사이트 (Link Manager) 테이블 생성
CREATE TABLE IF NOT EXISTS public.extra_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS 정책 설정 (누구나 읽기, 관리자는 비밀번호로 제어)
ALTER TABLE public.extra_links ENABLE ROW LEVEL SECURITY;

-- 기존 관리자 패턴과 동일하게 누구나 ALL 접근 가능하도록 설정 (비밀번호 1234로 프론트엔드 제어)
-- 실제 운영 환경에서는 서비스 역할 또는 인증된 사용자 기반 정책이 필요하지만, 현재 요구사항에 맞춰 단순화함
CREATE POLICY "extra_links_admin_manage" ON public.extra_links FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "extra_links_public_read" ON public.extra_links FOR SELECT USING (true);
