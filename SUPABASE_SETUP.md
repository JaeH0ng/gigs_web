# Supabase Setup

이 프로젝트는 곡 페이지에서 `like`, `clap`, `wave`, `spark` 반응을 보내면 같은 곡을 보고 있는 다른 관객 화면에도 실시간으로 이펙트가 뜨도록 설계되어 있습니다.

## 1. 환경변수

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 넣으세요.

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-anon-key
```

## 2. 테이블 생성

Supabase SQL Editor에서 아래 SQL을 실행하세요.

```sql
create table if not exists public.song_reactions (
  id uuid primary key default gen_random_uuid(),
  song_id text not null,
  reaction_type text not null check (reaction_type in ('like', 'clap', 'wave', 'spark')),
  client_id text not null,
  created_at timestamptz not null default now()
);

alter table public.song_reactions enable row level security;

grant select, insert on public.song_reactions to anon;
grant select, insert on public.song_reactions to authenticated;

create policy "Allow public read reactions"
on public.song_reactions
for select
to anon, authenticated
using (true);

create policy "Allow public insert reactions"
on public.song_reactions
for insert
to anon, authenticated
with check (true);
```

## 3. Realtime 활성화

Supabase Dashboard에서 `Database` -> `Replication` 또는 관련 Realtime 설정으로 이동해서
`public.song_reactions` 테이블을 `supabase_realtime` publication에 추가하세요.

SQL로 하려면:

```sql
alter publication supabase_realtime add table public.song_reactions;
```

## 4. 동작 방식

- 관객이 `like`, `clap`, `wave`, `spark` 버튼 중 하나를 누르면 `song_reactions`에 한 건이 insert 됩니다.
- 같은 `song_id`를 보고 있는 다른 사용자들은 Realtime 구독으로 insert 이벤트를 받고,
  화면에 해당 타입의 이펙트가 떠오릅니다.
- 본인이 누른 반응도 즉시 애니메이션으로 보입니다.
