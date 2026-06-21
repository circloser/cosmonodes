# Deep Interview Spec: Cosmonodes — 인간 관계 그래프뷰 SNS

## Metadata
- Interview ID: cosmonodes-2026-06-21
- Rounds: 5
- Final Ambiguity Score: 15%
- Type: greenfield (디자인 시스템 + HTML 목업 + 명세서 보유, 작동 코드 없음)
- Generated: 2026-06-21
- Threshold: 0.2
- Threshold Source: default
- Initial Context Summarized: no
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.92 | 0.40 | 0.368 |
| Constraint Clarity | 0.82 | 0.30 | 0.246 |
| Success Criteria | 0.80 | 0.30 | 0.240 |
| **Total Clarity** | | | **0.854** |
| **Ambiguity** | | | **0.146 (15%)** |

## Topology
| Component | Status | Description | Coverage / Deferral Note |
|-----------|--------|-------------|--------------------------|
| 3D→2D 그래프 뷰 | active | 나를 중심으로 한 force-directed 동적 그래프 시각화 | AC1–AC5 커버 |
| 노드 & 관계 관리 | active | 사람(별) 추가, 자기소개/타인정보 입력, 관계 정의 | AC6–AC8 커버 |
| 계정 & 매칭 | active | 이메일/구글 로그인 + 수락 기반 매칭 | AC9–AC11 커버 |
| 인맥 확장 / 우주 병합 | active | 매칭 시 1차 인맥을 '희미한 먼 별'로 2-hop 확장 | AC12–AC14 커버 |
| SNS 소셜 레이어 | active(축소) | 자기소개·한줄메시지·기본 표시 (댓글·채팅·알림은 post-MVP) | AC15 커버, 나머지 deferred |
| 결제 | deferred | 타인정보 열람 과금 (건당 $1) | 사용자 확인: "수익화 추후" |
| 관리자 페이지 | deferred | 운영 도구 | 사용자 확인: 이번 범위 제외 |
| 통계 / 대시보드 | deferred | 분석 | 사용자 확인: 이번 범위 제외 |

## Goal
**나(자기 노드)를 우주의 중심에 두고, 내가 추가한 사람들을 별(노드)로, 관계를 신축성 있는 링크로 표현하는 2D force-directed 동적 그래프 SNS를 만든다.** 노드는 처음엔 내가 입력하는 비공개 연락처 카드이며, 그 사람이 실제로 가입하고 연결을 수락하면 두 사람의 우주가 연결되어 상대의 1차 인맥이 '희미한 먼 별'로 내 우주에 확장된다. 최소한의 정보 입력과 강렬한 시각적 경험(별 생성 시 supernova 애니메이션)으로 SNS 피로도를 낮추고 인간관계를 한눈에 보고 관리하게 한다.

## Constraints
- **그래프 렌더링**: 2D force-directed로 충분 (3D 불필요). 확대/축소, 모든 노드 드래그 가능, 연결 노드가 신축성 있게 따라옴.
- **성능 합격선**: 동시 표시 ~300개 노드까지 부드럽게(목표 60fps), **모바일 포함**.
- **플랫폼**: 반응형 웹 (PC + 모바일), 별도 네이티브 앱 없음.
- **디자인**: 다크 테마, 흑백 기반 + Nebula Blue/Nova Violet 액센트, Minimalist-Glassmorphism (DESIGN.md 준수). ResearchRabbit 유사 감성.
- **인증**: 이메일+비밀번호, 구글 로그인. 휴대폰/신분 본인인증은 **MVP 후순위**.
- **배포**: 무료 호스팅 (예: Vercel/Netlify 프론트 + 무료 티어 백엔드/DB — 설계 단계에서 확정).
- **기술 스택**: 최신/인기 기술 (설계 단계에서 추천, 비개발자 친화적 설명 동반).
- **일정**: 6개월 내 사용화.
- **작업 방식**: 한 번에 한 단계씩, 전문용어는 쉽게, 최대한 자동 진행.
- **프라이버시**: 노드는 기본 비공개. 타인정보는 매칭/과금 전까지 상세 비노출. 타인 정보 입력에 대한 동의·고지 문구 필요(법적 리스크 완화).

## Non-Goals (이번 MVP 제외)
- 휴대폰/신분증 본인인증 시스템
- 결제 및 타인정보 열람 과금
- 댓글, 좋아요/북마크, 채팅/DM, 실시간 알림 (자기소개·한줄메시지 제외)
- 관리자 페이지, 통계/대시보드
- 사진/파일 업로드 (프로필 아바타 외 고급 업로드)
- 3D 렌더링

## Acceptance Criteria
- [ ] **AC1**: 로그인 후 나의 노드가 화면 중앙에 표시된다.
- [ ] **AC2**: 연결된 노드들이 force-directed 레이아웃으로 배치되어 부드럽게 움직인다.
- [ ] **AC3**: 임의 노드를 드래그하면, 연결된 노드들이 신축성 있는 링크로 따라온다.
- [ ] **AC4**: 그래프를 확대/축소(zoom)하고 이동(pan)할 수 있다.
- [ ] **AC5**: ~300개 노드에서 모바일 포함 끊김 없이(목표 60fps) 동작한다.
- [ ] **AC6**: 새 사람(별)을 추가할 수 있고, 추가 시 supernova 애니메이션이 재생된다.
- [ ] **AC7**: 노드 클릭 시 그 사람 정보(라벨·자기소개/내가 입력한 메모)를 카드로 본다.
- [ ] **AC8**: 노드 간 관계를 정의/편집/삭제할 수 있다.
- [ ] **AC9**: 이메일+비밀번호 및 구글로 회원가입/로그인한다.
- [ ] **AC10**: 내가 만든 비공개 노드에 초대(링크/이메일)를 보낼 수 있다.
- [ ] **AC11**: 초대받은 사람이 가입 후 연결을 **수락**하면 두 노드가 실제 매칭된다.
- [ ] **AC12**: 매칭 성립 시 상대의 1차 인맥이 '희미한 먼 별'로 내 우주에 나타난다.
- [ ] **AC13**: 희미한 먼 별은 상세정보가 숨겨지고, "한 다리 건너 존재"만 표시된다.
- [ ] **AC14**: 희미한 먼 별을 클릭하면 소개/연결 요청(IntroRequest)을 보낼 수 있다.
- [ ] **AC15**: 사용자는 자기소개와 한 줄 메시지를 작성/표시할 수 있다.

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| 노드 = 공개 신원 | 노드의 본질이 무엇인가? | **비공개 연락처 카드** → 가입·수락 시 실제 유저와 매칭 |
| 매칭 시 인맥 전체 공개 | 화면에 무엇이 보이나? | **2-hop**: 1차 인맥만 '희미한 먼 별', 상세 숨김 |
| MVP는 그래프 시각화만 | 합격선은? | 매칭/확장까지 동작해야 MVP |
| 본인인증 필요 (Contrarian) | 정말 MVP에 필요한가? | **수락 기반 매칭**으로 대체, 본인인증 후순위 |
| 3D 실시간 그래프 필수 | 몇 노드까지 부드러우면 합격? | **2D force-directed면 충분**, ~300노드 60fps 모바일 포함 |

## Technical Context
- **기존 자산**: `DESIGN.md` (완성도 높은 디자인 시스템 — 색상/타이포/글래스모피즘/Supernova 애니메이션 정의), `stitch_markdown_site_designer/` 내 HTML 목업 2종 (`universe_view_main_graph`, `star_profile_details`).
- **권장 방향** (설계 단계에서 확정):
  - 프론트: 모던 SPA 프레임워크 + 2D force-directed 그래프 라이브러리(예: D3-force, react-force-graph(2D), 또는 Pixi/Canvas 기반). Canvas/WebGL 렌더링으로 ~300노드 모바일 성능 확보.
  - 백엔드/DB: 무료 티어 BaaS(예: Supabase/Firebase) — 이메일+구글 인증, 노드/관계/매칭 데이터, 초대·수락 플로우 처리.
  - 호스팅: 정적 프론트는 Vercel/Netlify 무료, 백엔드는 BaaS 무료 티어.
- **성능 핵심**: force 시뮬레이션을 Canvas/WebGL로, 드래그 시 부분 재계산, 2-hop 별은 LOD(상세 숨김)로 렌더 비용 절감.

## Ontology (Key Entities)
| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| User | core domain | id, email, googleId, displayName, profile(자기소개), oneLineMessage, avatar | owns many Node; has one self-Node |
| Node (Star) | core domain | id, ownerUserId, label, note(타인정보 메모), matchedUserId?, isMatched, degree(1\|2) | belongs to User; connected by Edge; may match a User |
| Edge (Relationship) | core domain | id, fromNodeId, toNodeId, strength(pending\|verified), elasticLink | connects two Node |
| Universe (Graph) | supporting | ownerUserId, centerNodeId(self) | view composed of User's Node + Edge + 2-hop faint stars |
| Match | core domain | id, inviterNodeId, inviteeUserId, status(invited\|accepted) | links a Node to a real User via acceptance |
| IntroRequest | supporting | id, fromUserId, targetNodeId, status | created when clicking a 2-hop faint star |
| Profile | supporting | self info (공개), others' info (매칭/과금 전 비공개) | belongs to User/Node |

## Ontology Convergence
| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 6 | 6 | - | - | N/A |
| 2 | 7 | 1 (IntroRequest) | 0 | 6 | 86% |
| 3 | 7 | 0 | 0 | 7 | 100% |
| 4 | 7 | 0 | 0 | 7 | 100% |
| 5 | 7 | 0 | 1 (Edge +elasticLink) | 6 | 100% |

도메인 모델은 Round 3부터 수렴(동일 엔티티 3라운드 연속). Round 5의 변화는 Edge에 신축성 링크 속성 추가로, 개념 자체는 안정적.

## Interview Transcript
<details>
<summary>Full Q&A (5 rounds + Round 0)</summary>

### Round 0 — Topology
**Q:** 5개 최상위 구성요소(그래프뷰/노드·관계/계정·매칭/확장·병합/소셜레이어) 구분이 맞나요?
**A:** 맞아요, 이대로 진행. (결제·관리자·통계 deferred 확정)

### Round 1 — Node Ontology (Goal)
**Q:** 노드(별)는 본질적으로 무엇인가요?
**A:** 내 주소록(비공개) → 나중에 실제 유저와 매칭.
**Ambiguity:** 43% (Goal 0.75, Constraints 0.55, Criteria 0.35)

### Round 2 — Expansion (Goal)
**Q:** 매칭 순간 상대의 인맥이 어떻게 확장되어 보여야 하나?
**A:** 김철수의 1차 인맥까지 '희미한 먼 별'로 표시.
**Ambiguity:** 36% (Goal 0.85, Constraints 0.60, Criteria 0.40)

### Round 3 — MVP Bar (Success Criteria)
**Q:** 1차 출시(MVP)의 합격선은?
**A:** 그래프 + 매칭/확장까지 동작.
**Ambiguity:** 28% (Goal 0.88, Constraints 0.62, Criteria 0.60)

### Round 4 — Contrarian: Matching (Constraints)
**Q:** MVP에 정말 본인인증이 필요한가? 매칭은 어떻게 일어나면 충분한가?
**A:** 나중에 진짜 본인인증 — MVP는 수락 기반.
**Ambiguity:** 23% (Goal 0.90, Constraints 0.72, Criteria 0.65)

### Round 5 — Performance/Visual Bar (Success Criteria)
**Q:** 그래프 '부드러움' 합격선(동시 별 개수)은?
**A:** ~300개까지 부드럽게. 3D 불필요, 2D 역동적 확대/축소, 신축성 링크로 연동, 모든 노드 드래그 가능.
**Ambiguity:** 15% ✅ (Goal 0.92, Constraints 0.82, Criteria 0.80)

</details>
