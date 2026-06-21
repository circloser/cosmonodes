# Supabase 연동 가이드 (백엔드 켜기)

이 데모는 지금 **브라우저 안(localStorage)** 에서만 동작합니다. 실제 로그인·여러 사람 간 매칭을
켜려면 무료 백엔드인 **Supabase**를 연결하면 됩니다. 코드는 이미 `DataProvider` 인터페이스로
분리되어 있어, 같은 규칙을 따르는 `SupabaseDataProvider` 하나만 추가하면 교체됩니다.

> 계정 생성과 키 발급은 **직접** 하셔야 합니다(보안상 대신 해드릴 수 없어요). 아래 순서를 그대로 따라오세요.

## 1. Supabase 프로젝트 만들기
1. https://supabase.com 가입 → **New project** 생성(무료 플랜).
2. 프로젝트가 만들어지면 **Project Settings → API**에서 두 값을 복사:
   - `Project URL`
   - `anon public` API key
3. `app/.env.local` 파일을 만들고 아래처럼 붙여넣습니다:
   ```
   VITE_SUPABASE_URL=복사한_Project_URL
   VITE_SUPABASE_ANON_KEY=복사한_anon_key
   ```

## 2. 구글 로그인 켜기 (선택)
1. Supabase **Authentication → Providers → Google** 활성화.
2. 안내에 따라 Google Cloud Console에서 OAuth 클라이언트 ID/시크릿을 발급해 입력.
3. 이메일+비밀번호 로그인은 별도 설정 없이 기본 동작합니다.

## 3. 데이터베이스 테이블 만들기
Supabase **SQL Editor**에 아래를 실행하세요(요약본 — 실제 컬럼은 `src/domain/types.ts`와 1:1):

```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text, bio text, one_line text, avatar_color text,
  created_at timestamptz default now()
);
create table nodes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles not null,
  label text not null, note text,
  matched_user_id uuid references profiles,
  created_at timestamptz default now()
);
create table edges (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles not null,
  from_node_id text not null, to_node_id text not null,
  strength text check (strength in ('pending','verified'))
);
create table matches (
  id uuid primary key default gen_random_uuid(),
  inviter_user_id uuid references profiles, inviter_node_id uuid references nodes,
  invitee_user_id uuid references profiles,
  invite_token text unique, status text check (status in ('invited','accepted')),
  created_at timestamptz default now(), accepted_at timestamptz
);
create table intro_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references profiles, target_node_id uuid references nodes,
  status text, created_at timestamptz default now()
);
create table consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles, type text, accepted_at timestamptz default now()
);
```

## 4. 보안 규칙 (RLS) — ⚠️ 가장 중요
타인 정보(`note`)가 새지 않도록 **행 수준 보안(RLS)**을 반드시 켭니다.

```sql
alter table nodes enable row level security;
alter table edges enable row level security;

-- 내 노드/엣지만 보고/수정 가능
create policy "own nodes" on nodes
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own edges" on edges
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
```

2-hop(희미한 먼 별)은 **RPC 함수**로만 노출하고, 거기서 `id, label`만 반환합니다(절대 `note` 금지):

```sql
create or replace function get_graph()
returns table (id uuid, label text, degree int)
language sql security definer as $$
  -- 내 노드 (degree 1)
  select n.id, n.label, 1 from nodes n where n.owner_id = auth.uid()
  union all
  -- 매칭된 상대의 노드 (degree 2) — label만, note 절대 미포함
  select far.id, far.label, 2
  from nodes mine
  join nodes far on far.owner_id = mine.matched_user_id
  where mine.owner_id = auth.uid() and mine.matched_user_id is not null;
$$;
```

> 핵심 불변식: 어떤 경로로도 비소유자가 타인의 `note`를 얻을 수 없어야 합니다.
> 현재 로컬 구현의 동일 규칙은 `src/data/DataProvider.test.ts`가 검증합니다 —
> Supabase 연동 후에는 위 RLS/RPC에 대해서도 같은 취지의 테스트를 추가하세요.

## 5. 코드 교체
1. `npm install @supabase/supabase-js`
2. `src/data/SupabaseDataProvider.ts` 를 만들고 `DataProvider` 인터페이스(`src/data/DataProvider.ts`)를 구현.
3. `src/store/useGraphStore.ts` 상단의
   ```ts
   const provider: DataProvider = new LocalStorageDataProvider()
   ```
   를
   ```ts
   const provider: DataProvider = new SupabaseDataProvider()
   ```
   로 바꾸면 끝입니다. UI/그래프 코드는 전혀 바꿀 필요가 없습니다.

## 6. 배포
- 프론트엔드: **Vercel**(또는 Netlify)에 `app` 폴더를 연결, 환경변수(`VITE_SUPABASE_*`) 등록 → 무료 배포.
- 백엔드: Supabase 무료 티어가 그대로 서버 역할을 합니다.
