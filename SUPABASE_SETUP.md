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
- `client_id`는 브라우저의 `localStorage`에 저장되는 익명 ID입니다. 같은 브라우저로 공연을 끝까지 이용하면
  `song_reactions`와 `audience_surveys`에 같은 `client_id`가 저장되어, 반응 참여량과 설문 응답을 연결해 분석할 수 있습니다.

## 5. 만족도 조사 테이블

마지막 페이지의 관객 만족도 조사 응답을 저장하려면 Supabase SQL Editor에서 아래 SQL도 실행하세요.

```sql
create table if not exists public.audience_surveys (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  ratings jsonb not null,
  feature_ratings jsonb not null,
  interaction_ratings jsonb not null default '{}'::jsonb,
  most_impressive text[] not null,
  memorable_moment text,
  improvement text,
  created_at timestamptz not null default now()
);

alter table public.audience_surveys enable row level security;

grant insert on public.audience_surveys to anon;
grant insert on public.audience_surveys to authenticated;

create policy "Allow public insert surveys"
on public.audience_surveys
for insert
to anon, authenticated
with check (true);
```

기존 `audience_surveys` 테이블을 이미 만든 상태라면 아래 마이그레이션을 추가로 실행하세요.

```sql
alter table public.audience_surveys
add column if not exists interaction_ratings jsonb not null default '{}'::jsonb;

alter table public.audience_surveys
alter column most_impressive type text[]
using case
  when most_impressive is null then array[]::text[]
  else array[most_impressive]
end;
```

저장 구조는 다음과 같습니다.

- `client_id`: 기존 페이지 반응과 같은 localStorage 기반 id입니다. `song_reactions.client_id`와 연결해 분석할 수 있습니다.
- `ratings`: 전반 만족도, 흐름, 공간 구도 편안함 등 공통 문항 점수입니다.
- `interaction_ratings`: 인터렉션 문항을 `projection`, `web_page`, `physical_touch`별로 나눠 저장합니다.
- `most_impressive`: 복수 선택 결과가 `text[]` 배열로 저장됩니다.

분석 시에는 `ratings`의 1-5점 척도 평균으로 전체 만족도, 몰입도, 능동적 참여감,
재관람 의향 등을 계산하고, `feature_ratings`에서 `0`은 “경험하지 못했다”로 분리해서 평균에서 제외하면 됩니다.
`client_id`를 기준으로 `song_reactions`와 조인하면 관객별 이모지 반응 수와 만족도 점수를 함께 볼 수 있습니다.
