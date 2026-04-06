-- 학생회 이벤트 테이블 생성
CREATE TABLE IF NOT EXISTS student_council_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    event_date DATE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 정책 설정 (공개 읽기, 관리자만 쓰기/수정/삭제 가능하도록)
ALTER TABLE student_council_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for student_council_events" 
ON student_council_events FOR SELECT USING (true);

-- 관리자(Supabase Auth 사용자)만 쓰기 가능
CREATE POLICY "Allow authenticated users to manage student_council_events" 
ON student_council_events FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');
