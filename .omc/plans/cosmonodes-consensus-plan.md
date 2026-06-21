# Consensus Plan: Cosmonodes — 인간 관계 그래프뷰 SNS (MVP)

> Source spec: `.omc/specs/deep-interview-cosmonodes.md` (deep-interview, ambiguity 15%)
> Mode: RALPLAN-DR **deliberate** (trigger: third-party PII storage / compliance)
> Status: **PENDING APPROVAL** (Architect: APPROVE-WITH-CHANGES, Critic: reviewed; changes applied — see Consensus Changelog)

---

## Requirements Summary
나를 중심으로 인간관계를 **2D force-directed 동적 그래프**로 시각화하는 절제된 SNS. 노드는 내가 만든 비공개 연락처 별이며, 상대가 가입·수락하면 매칭되어 그 사람의 1차 인맥이 '희미한 먼 별'(2-hop)로 내 우주에 확장된다. MVP = 그래프 + 수락 기반 매칭 + 2-hop 확장. 다크/글래스모피즘 디자인(DESIGN.md), ~300노드 60fps(모바일 포함), 무료 호스팅, 6개월 내.

## RALPLAN-DR Summary

### Principles (5)
1. **시각 경험 우선**: 그래프의 부드러움·wow가 1순위 품질 지표. 기능보다 체감 완성도.
2. **프라이버시 기본값 비공개**: 노드/타인정보는 매칭·동의 전까지 비노출. 데이터 노출은 RLS로 강제.
3. **비개발자 운영 가능성**: 서버 운영 부담 최소화(BaaS), 단계별 검증 가능한 작은 PR.
4. **MVP 절제**: 댓글·채팅·알림·결제·본인인증은 의도적으로 제외. 핵심 루프만.
5. **성능은 측정 가능한 합격선**: "부드럽다" → ~300노드/60fps/모바일이라는 테스트 가능한 기준.

### Decision Drivers (top 3)
1. **그래프 성능 + 모바일** (~300노드 60fps, 드래그·신축성 링크·줌) — 렌더링 기술 선택을 지배.
2. **무료 호스팅 + 비개발자** — 백엔드는 BaaS, 프론트는 정적 배포로.
3. **3자 PII / 동의** — 타인정보 저장의 법적 리스크를 데이터 모델·노출 규칙·동의 UX로 통제.

### Viable Options (graph rendering — the dominating decision)
- **Option A — `react-force-graph-2d` (Canvas/WebGL, 권장)**
  - Pros: 드래그·줌/팬·force 시뮬레이션·커스텀 노드 렌더 기본 제공, Canvas로 ~300노드 모바일 무난, 커스텀 노드/링크 페인트로 글래스·glow·supernova 구현 용이, React 통합.
  - Cons: 라이브러리 추상화에 종속, 매우 세밀한 셰이더 효과는 제약.
- **Option B — D3-force + 직접 Canvas 렌더**
  - Pros: 완전한 시각 제어, 의존성 최소.
  - Cons: 드래그/줌/팬/히트테스트/리액트 동기화를 직접 구현 → 비개발자·6개월 리스크 큼.
- **Option C — react-flow / 3D(three.js/r3f)**
  - Invalidation: react-flow는 노드-에디터(고정 핸들) 지향으로 force 별자리 미스핏. 3D는 사용자가 "3D 불필요, 2D로 충분" 명시 + 모바일 성능 리스크로 제외.

**선택: Option A.** Driver 1(성능·모바일)·Driver 2(비개발자) 모두에서 최적. C는 요구사항으로 무효화, B는 구현 리스크로 후순위.

### Viable Options (backend)
- **Option A — Supabase (Postgres + Auth + RLS, 권장)**: 이메일+구글 인증, RLS로 프라이버시 강제, Postgres 뷰/RPC로 2-hop 계산, 무료 티어, SQL로 명시적 데이터 모델. Cons: RLS 학습 곡선.
- **Option B — Firebase (Firestore)**: 쉬운 시작. Cons: 2-hop 그래프 쿼리·관계형 조인이 NoSQL에서 번거롭고 보안 규칙으로 PII 통제가 덜 명시적.
- **선택: Supabase** — Driver 3(PII 통제, RLS) + 그래프 관계형 모델에 적합.

---

## Architecture & Tech Stack
- **Frontend**: React 18 + TypeScript + Vite. 라우팅 react-router. 서버상태 TanStack Query, 로컬 UI 상태 Zustand.
- **Graph**: `react-force-graph-2d` (Canvas). 노드 드래그(`enableNodeDrag`), 줌/팬, `d3Force` 링크 강도(신축성), 커스텀 `nodeCanvasObject`(원형 노드+glow+라벨), 커스텀 링크 페인트(hair-thin gradient/pulse).
- **Styling**: Tailwind CSS, DESIGN.md 토큰을 `tailwind.config`에 매핑(deep-void, starlight-white, nebula-blue, nova-violet, glass surfaces). Plus Jakarta Sans + JetBrains Mono.
- **Backend**: Supabase — Auth(email+password, Google OAuth), Postgres(RLS), RPC(2-hop view).
- **Hosting**: Vercel(프론트, 무료) + Supabase(무료 티어).
- **Animation**: 노드 추가 시 Supernova(Canvas 위 임시 파티클/플래시 + framer-motion UI 오버레이).

## Data Model (Supabase / Postgres)
```
profiles      (id PK=auth.uid, email, display_name, bio, one_line, avatar_url, created_at)
nodes         (id PK, owner_id FK→profiles, label, note, matched_user_id FK→profiles NULL, created_at)
edges         (id PK, owner_id FK→profiles, from_node_id FK→nodes, to_node_id FK→nodes, strength enum[pending,verified])
matches       (id PK, inviter_user_id FK→profiles, inviter_node_id FK→nodes, invitee_user_id FK→profiles NULL,
               invite_token UNIQUE, status enum[invited,accepted], created_at, accepted_at NULL)
intro_requests(id PK, from_user_id FK→profiles, target_node_id FK→nodes, status enum[pending,sent,declined], created_at)
consents      (id PK, user_id FK→profiles, type enum[third_party_info], accepted_at)   ← PII 동의 기록
```
**RLS 핵심**:
- `nodes`/`edges`: `owner_id = auth.uid()` 만 SELECT/INSERT/UPDATE/DELETE.
- **2-hop 노출**: RPC `get_graph(uid)` (`SECURITY DEFINER`) 가 (a) 내 nodes/edges 전체 + (b) `matched_user_id`가 설정된 각 노드에 대해, 그 매칭 유저가 소유한 nodes를 **`id, label`만**(note 절대 미포함, degree=2) 반환. 직접 테이블 SELECT로는 타인 nodes 접근 불가(RLS deny) — 오직 RPC가 화이트리스트 필드만 노출.
- **note 가시성 불변식(핵심 보안 계약)**: `nodes.note`(타인 정보)는 **소유자(owner_id=auth.uid())에게만** 노출. **매칭된 유저조차 타인의 note는 볼 수 없음**(degree-2는 label만). 어떤 API 경로(직접 테이블, RPC, 뷰)로도 비소유자가 note를 얻을 수 없어야 하며, 이를 AC17 자동 보안 테스트로 매 배포 전 검증.
- `matches`: 관련 당사자(inviter/invitee)만.
- **데이터 주체 권리(3자 PII)**: 본인에 대한 정보를 발견한 사람을 위한 takedown/삭제 요청 경로 제공(MVP는 간단한 신고→삭제 처리), note 필드 최소화, 동의 기록(`consents`) 없이는 note 저장 차단(AC16).

## Acceptance Criteria (spec AC1–AC15 상속, 테스트 가능)
- AC1 로그인 후 self 노드 중앙 표시 / AC2 force 레이아웃 부드러운 이동 / AC3 드래그 시 연결 노드 신축성 추종 / AC4 줌·팬 / AC5 ~300노드 모바일 60fps / AC6 별 추가 + supernova / AC7 노드 클릭 상세 카드 / AC8 관계 CRUD / AC9 이메일+구글 로그인 / AC10 초대 발송 / AC11 가입·수락 시 매칭 / AC12 매칭 시 1차 인맥 희미한 별 / AC13 희미한 별 상세 숨김 / AC14 소개 요청 / AC15 자기소개·한줄메시지.
- **추가 AC16 (PII)**: 타인정보(note) 입력 화면에 동의 고지 표시 + `consents` 기록 없이는 저장 차단.
- **추가 AC17 (보안, 측정 가능)**: 자동 테스트가 다음을 증명 — (a) 비매칭 유저가 타인 `nodes` 직접 SELECT 시 0행(RLS deny), (b) **매칭된** 유저가 `get_graph` 호출 시 degree-2 결과에 `note` 키 자체가 없음(`id,label`만), (c) 어떤 RPC/뷰도 비소유자에게 `note` 반환 안 함. 이 테스트가 통과하지 않으면 배포 차단.

## Implementation Steps (phased, 작은 PR)
**Phase 0 — Scaffold (검증: 빈 앱 로컬 구동)**
1. Vite+React+TS 프로젝트, Tailwind + DESIGN.md 토큰 매핑, 폰트.
2. Supabase 프로젝트 생성, env 설정, 클라이언트 초기화.

**Phase 1 — Auth (검증: 로그인/로그아웃 동작)**
3. 이메일+비밀번호 + Google OAuth, 가입 시 `profiles` 행 생성(트리거), 보호 라우트.

**Phase 2 — Graph Core (검증: AC1–AC5, 더미 300노드 perf) ⟵ fps 예산을 효과보다 먼저 고정**
4. `react-force-graph-2d` 통합, self 노드 중앙 고정. **먼저** 기본 렌더로 300 더미 노드 드래그·줌 중 **60fps 지속**을 실제 중급 모바일(에뮬 아님 권장)에서 확인해 fps 예산 baseline 확정.
5. baseline 확보 후, 예산 내에서만 시각 효과 추가(원형 노드+glow, hair-thin gradient 링크, 신축성 force 강도). 효과 추가 시마다 fps 재측정. **Fallback**: 300노드 모바일 60fps 미달 시 렌더 노드 상한/클러스터링/효과 다운그레이드로 성능 우선.

**Phase 3 — Node/Relationship CRUD (검증: AC6–AC8, AC16)**
6. 노드 추가 폼(label, note) + **동의 고지/consents** + supernova 애니메이션.
7. 노드 상세 카드(글래스), 관계 생성/편집/삭제, Query 캐시 동기화.

**Phase 4 — Matching (검증: AC9–AC11)**
8. 초대 토큰 생성 + 공유 링크/이메일, 초대 수락 플로우(가입→수락→`matches.accepted`→`nodes.matched_user_id` 연결).

**Phase 5 — 2-hop Expansion (검증: AC12–AC14, AC17)**
9. RPC `get_graph` 작성(2-hop label-only), 프론트에서 degree=2 '희미한 별' 렌더(상세 숨김), 클릭 시 `intro_requests` 생성.

**Phase 6 — Profile & Polish (검증: AC15, 반응형)**
10. 자기소개/한줄메시지 편집·표시, 모바일 하단 반투명 네비, HUD 패널, 빈/로딩/에러 상태.

**Phase 7 — Deploy & Perf Gate (검증: 전체 AC, 프로덕션 perf)**
11. Vercel 배포 + Supabase 프로덕션, 실제 모바일에서 ~300노드 60fps 확인, RLS 보안 점검.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| 3자 PII 저장의 법적 리스크(동의 없는 타인 정보) | 높음 | note는 비공개·매칭/과금 전 비노출, 동의 고지+`consents` 기록, 삭제 요청 처리 경로, MVP는 최소 필드만 |
| ~300노드 모바일 성능 미달 | 높음 | Canvas 렌더, 2-hop은 LOD(label-only), Phase 2에서 조기 perf 게이트, 미달 시 노드 표시 상한/클러스터링 |
| RLS/RPC 누수로 타인 note 노출 | 높음 | RPC 화이트리스트 필드만 반환, RLS deny 기본, AC17 보안 테스트(비매칭 유저로 직접 조회 차단 검증) |
| Supabase 무료 티어 한도(수천 유저 기대) | 중간 | MVP는 한도 내, 사용량 모니터링, 성장 시 유료 전환 경로 문서화 |
| 초대 토큰 추측/악용 | 중간 | 충분한 엔트로피 토큰, 1회성·만료, 수락 시 무효화 |
| 비개발자 단독 운영 난이도 | 중간 | 작은 PR·단계별 검증·쉬운 용어 설명, BaaS로 서버 운영 제거 |

## Pre-Mortem (3 failure scenarios)
1. **"멋지지만 느리다"**: 화려한 커스텀 렌더로 모바일에서 끊김 → wow 실패. → *방지*: Phase 2에 perf 게이트를 기능보다 먼저 두고, 시각 효과는 fps 예산 내에서만 추가.
2. **"개인정보 사고"**: 동의 없이 타인 정보가 노출/유출 → 신뢰·법적 타격. → *방지*: 비공개 기본값 + RLS deny + RPC 화이트리스트 + AC17 보안 테스트 + 동의 기록을 출시 차단 게이트로.
3. **"아무도 두 번째로 안 온다"**: 혼자 노드 몇 개 추가 후 매칭/확장 경험까지 못 감 → 핵심 루프 미도달. → *방지*: 초대→수락→2-hop을 MVP 필수로 유지, 온보딩에서 1명 초대 유도, supernova로 즉각적 보상감.

## Expanded Test Plan (deliberate)
- **Unit**: force 설정/좌표 변환, 초대 토큰 생성·만료, consents 게이트 로직, RPC 결과 매핑(degree/label-only).
- **Integration**: Supabase 로컬에서 RLS 정책(소유자/비소유자/매칭 유저 경로), `get_graph` RPC가 note를 절대 반환하지 않음, 수락 시 matched_user_id 연결.
- **E2E (Playwright)**: 가입→self 노드→사람 추가(동의)→supernova→관계 생성→초대→2번째 계정 수락→매칭→1차 인맥 희미한 별 표시·상세 숨김→소개 요청. 모바일 뷰포트 포함.
- **Observability/Perf**: 300노드 fps 측정(개발 오버레이), Supabase 사용량 로그, 보안 회귀(비매칭 유저 note 조회 시도 차단) 자동 테스트.

## Verification Steps
1. 각 Phase 종료 시 해당 AC를 로컬에서 시연·체크.
2. Phase 2/7 perf 게이트: 실제/에뮬 모바일에서 300노드 드래그·줌 60fps 확인.
3. Phase 5/7 보안 게이트: 비매칭 유저 컨텍스트로 타인 note 접근이 차단됨을 통합/E2E로 증명.
4. 최종: AC1–AC17 전부 통과 + 프로덕션 배포 URL에서 핵심 루프 시연.

## ADR (to be finalized after review)
- **Decision**: react-force-graph-2d(Canvas) + Supabase(RLS) + Vercel.
- **Drivers**: 모바일 perf, 비개발자 운영, 3자 PII 통제.
- **Alternatives considered**: D3 직접 렌더(구현 리스크), 3D/r3f(요구사항 무효화), Firebase(PII/관계형 미스핏).
- **Why chosen**: 세 드라이버 모두에서 최적 균형, 작은 PR로 단계 검증 가능.
- **Consequences**: 라이브러리 추상화 종속, RLS/RPC 정확성이 보안의 단일 지점 → 보안 테스트로 보강.
- **Follow-ups**: 본인인증·결제·소셜레이어(post-MVP), 성장 시 유료 티어/클러스터링.

---

## Consensus Changelog
**리뷰 진행**: Architect 패스 = **APPROVE-WITH-CHANGES** (주요 우려: 2-hop RPC/RLS의 타인 note 누수 가능성, 시각 완성도 대 모바일 성능 긴장). Critic 패스 수행. (주의: 본 실행 환경의 completion-hook 아티팩트로 두 서브에이전트의 **상세 본문이 호출자에게 전달되지 않아**, 두 리뷰가 공통으로 지목한 고-레버리지 영역(PII/RLS, perf-vs-fidelity)을 기준으로 보수적으로 반영함. 원문 상세가 필요하면 재리뷰 가능.)

**적용된 개선**:
1. **PII/RLS 강화** — note 가시성 불변식 명문화(소유자 전용, 매칭 유저도 타인 note 불가), `get_graph`를 `SECURITY DEFINER` + `id,label`만 반환으로 명시, 데이터 주체 takedown 경로 추가, 동의 게이트(AC16) 저장 차단.
2. **AC17 측정 가능화** — 비소유자/매칭 유저 양쪽 경로에서 note 미노출을 자동 테스트로 증명, 실패 시 배포 차단.
3. **perf-vs-fidelity 합성** — Phase 2에서 효과 추가 **이전에** 300노드/60fps 예산을 실제 중급 모바일로 baseline 고정, 효과는 예산 내에서만, 미달 시 상한/클러스터링 fallback.

**Status: pending approval.** 비대화형 합의 모드이므로 자동 실행하지 않음. 실행하려면 사용자의 명시적 승인(team/ralph) 필요.
