# Cosmonodes — 경쟁/유사 서비스 조사 & 개선 방향

> 작성일: 2026-06 · 대상: 비개발자 오너 · 목적: 경쟁 지형 파악 + 다음 개선 우선순위 도출
> 한 줄 결론: **"인간관계를 별자리/우주로 시각화하는 소비자용 그래프 SNS"** 라는 칸은 직접 경쟁자가 거의 없는 **공백**입니다. 인접 영역(개인 CRM, 네트워크 시각화 도구, 논문 그래프, 워밍-인트로)에서 각각의 강점을 빌려와 합치는 것이 기회입니다.

---

## 1. 경쟁 지형 (5개 인접 카테고리)

### A. 개인 CRM (관계 관리) — *기능의 표준을 정의*
| 서비스 | 핵심 | Cosmonodes와의 차이 / 빌려올 점 |
|--------|------|-------------------------------|
| **Monica** | 오픈소스·자체호스팅, 프라이버시 중심. "어떻게 만났나/음식 취향/선물 아이디어" 필드 | 우리의 프라이버시-우선 철학과 동일. **관계 메타데이터 필드**를 차용 |
| **Clay** | 이메일·캘린더·LinkedIn을 AI로 통합, 관계 인사이트·메시지 초안 | **상호작용 기반 관계 강도** 자동 추정 아이디어 |
| **Dex** | LinkedIn 인맥 동기화 + 케어 리마인더 | **"다음 연락 리마인더"** 패턴 |
| **Folk** | 협업형 주소록, 태그·공유·권한 | 태그/그룹 관리 UX |

> 공통 한계: **리스트/주소록 중심, 비즈니스 톤**. 시각적 와우·소비자 감성이 약함. → Cosmonodes의 그래프-우선 + 감성은 분명한 차별점.

### B. 네트워크 시각화 도구 — *그래프 기술의 레퍼런스*
- **Kumu.io / Gephi / Polinode / SocNetV / Flourish / InfraNodus** : 노드=사람, 엣지=관계의 인터랙티브 그래프, 커뮤니티 탐지·중심성 등 분석.
- 한계: **연구자·기업·분석가용 도구**. 데이터 수기 입력, 학습곡선 높음, SNS 아님.
- 빌려올 점: **네트워크 분석 인사이트**(허브/브로커, 끊긴 연결, 커뮤니티)를 *소비자 친화적으로* 번역하면 강력한 차별 기능.

### C. 논문 그래프 (시각적 영감의 원천) — *기획서가 참조한 ResearchRabbit*
- **ResearchRabbit / Connected Papers / Litmaps** : 입력 논문의 인용·참조 연결로 관련 논문을 2D force 그래프로 확장. 색 농도=최신성, 근접=유사도. "이 논문을 인용한 논문" = **우리의 2-hop 확장과 직접 대응**.
- 빌려올 점: **반복적 체이닝(iterative chaining)** UX — 한 노드에서 한 걸음씩 우주를 넓혀가는 탐색 흐름.

### D. 워밍-인트로 / 친구의 친구 — *2-hop 확장 메커니즘의 비즈니스판*
- **AskScout** (Gmail/캘린더로 관계 강도 가중 그래프), **Vieu**, **Bridge**(더블 옵트-인 인트로 링크), **OpenVC Intro Finder**(상호 연결 경로 표시).
- 한계: **B2B/세일즈/VC 전용, 차갑고 도구적**. 일반 사용자·감성 없음.
- 데이터 포인트: 콜드 이메일 응답 1–3% vs 워밍 인트로 20–40%. → **소개의 가치는 실증됨**. Bridge의 "더블 옵트-인" 패턴을 우리 소개 요청에 차용.

### E. 안티피드 / 느린 관계 트렌드 — *시장 타이밍 검증*
- **Noplace** (시간순·미니멀·텍스트), 비공개 close-friends 공간으로의 이동(비공개 상호작용이 공개보다 3–7배).
- **"슬로우 프렌드십"**: 많은 지인보다 소수의 깊은 관계. **커뮤니티 > 리치**("1,000 진성 팬 > 10,000 침묵 팔로워").
- → Cosmonodes의 "절제된 SNS / SNS 피로도 낮추기" 포지셔닝과 **트렌드가 정확히 일치**.

---

## 2. 포지셔닝 — 어디에 비어 있나

```
            시각적·감성적  ◀────────────▶  분석적·도구적
소비자 SNS  │  ★ Cosmonodes (공백)        │  (없음)
            │  안티피드(Noplace) 인접      │
개인 CRM    │  (리스트 중심)               │  Monica/Clay/Dex/Folk
분석 도구   │                              │  Kumu/Gephi/InfraNodus
연구 도구   │  ResearchRabbit(영감)        │  Connected Papers
```

- **"친구를 별로, 인간관계를 우주로" + 소비자 SNS + 2-hop 인맥 확장**의 교집합은 사실상 비어 있습니다(직접 검색 시 소셜 앱 경쟁자 미발견 — 별/우주 키워드는 천문 앱만).
- 해자(moat) 후보: ① 시각적 완성도(와우), ② 2-hop 우주 병합이라는 **바이럴 루프**, ③ 프라이버시-우선 신뢰.

---

## 3. 위협 / 리스크
1. **콜드스타트**: 빈 우주는 외롭다 — 첫 10분 안에 별이 충분히 차야 함.
2. **노벨티 함정**: 시각화는 신기하지만 *재방문 이유*가 약하면 1회성. → 관계 관리의 *실용 가치*가 붙어야 retention.
3. **3자 PII**: 타인 정보 입력의 동의·법적 리스크(이미 동의 게이트·비공개 불변식으로 대응 중).
4. **모방 리스크**: 거대 SNS가 "그래프 뷰"를 베끼기 쉬움 → 속도 + 감성 + 커뮤니티로 선점.
5. **모바일 성능**: 노드 증가 시 60fps 유지(현재 ~300 기준 / LOD·클러스터링 필요).

---

## 4. 향후 개선 방향 (우선순위 로드맵)

### 단기 — 현재 코드 위에서 (다음 1~2 스프린트)
1. **관계 인텔리전스 필드**(개인 CRM 표준): 노드에 *마지막 연락일·다음 연락 리마인더·생일·어떻게 만났나·관심사*. → 그래프가 "예쁜 그림"에서 "관리 도구"로. *재방문 이유 #1.*
2. **그룹 고도화**(방금 추가한 기능 확장): 그룹 편집/삭제, 기존 별의 그룹 변경, **그룹을 클러스터로 묶어 보기**, 관계 강도=선 굵기/거리.
3. **검색·필터**: 이름/그룹/태그로 별 찾기 — 노드 수십 개만 넘어도 필수.
4. **콜드스타트 완화**: 연락처 가져오기 또는 *빠른 다중 추가*(이름만 줄줄이) → 첫 우주를 5분 안에 채우기.

### 중기 — 백엔드(Supabase) 연결 후
5. **실매칭 + 워밍 인트로**: 더블 옵트-인 소개(Bridge 패턴), 2-hop "한 다리 건너" 소개 요청 실동작.
6. **관계 강도 자동화(옵션·프라이버시 우선)**: 상호작용 기반 가중치(Clay/AskScout식)지만, 기기 내/동의 기반으로.
7. **느린 SNS 케이던스**: 근황·한줄 메시지를 *피드가 아니라 별의 미세 변화*(펄스·색 변화·궤도)로 표현 — 안티피드 트렌드 반영, 피로도↓.

### 장기 — 차별화·해자
8. **관계 인사이트**(InfraNodus/Kumu를 소비자용으로 번역): "오래 연락 안 한 별 환기", "두 친구를 이어줄까?", "내 우주의 허브/브로커". 관계의 *와우 + 실용*.
9. **수익화**: ① 기획대로 *타인이 입력한 내 정보 열람 과금*(건당), ② 프리미엄(무제한 노드·고급 분석·테마/스킨).
10. **성장 루프**: 초대→수락→우주 병합 자체가 바이럴. "합쳐진 우주" 공유 이미지/영상(별 생성 supernova) → SNS 확산.

---

## 5. 다음에 바로 착수할 백로그 (현재 빌드 기준)
- [ ] 노드 상세에 *마지막 연락일 + 다음 연락 리마인더* 필드 추가 (단기 #1)
- [ ] 기존 별의 그룹 변경 + 그룹 편집/삭제 (단기 #2)
- [ ] 이름/그룹 검색 바 (단기 #3)
- [ ] "빠른 추가"(여러 이름 한 번에) 온보딩 (단기 #4)
- [ ] 관계 강도(친밀도) 슬라이더 → 선 굵기/거리 반영 (중기 #6 준비)

---

## 출처 (Sources)
- 개인 CRM: [OnePageCRM](https://www.onepagecrm.com/blog/best-personal-crm/), [crm.org](https://crm.org/crmland/personal-crm), [folk.app](https://www.folk.app/articles/why-you-need-personal-crm)
- 네트워크 시각화: [Visible Network Labs](https://visiblenetworklabs.com/2024/02/14/social-network-analysis-tools-for-mapping-relationships/), [Kumu.io](https://kumu.io/), [Polinode](https://www.polinode.com/guides/social-network-analysis-tools-10-options-for-relationship-mapping), [InfraNodus](https://infranodus.com/use-case/visualize-knowledge-graphs-pkm)
- 논문 그래프: [ResearchRabbit 가이드](https://www.researchrabbit.ai/articles/guide-to-using-researchrabbit), [ResearchRabbit 2025 개편](https://aarontay.substack.com/p/researchrabbits-2025-revamp-iterative), [Litmaps vs RR vs Connected Papers](https://effortlessacademic.com/litmaps-vs-researchrabbit-vs-connected-papers-the-best-literature-review-tool-in-2025/)
- 워밍 인트로: [askscout.ai](https://askscout.ai/blog/what-is-a-warm-introduction), [Bridge](https://get.brdg.app/), [Vieu](https://try.vieu.com/blog/warm-intro)
- 안티피드/트렌드: [Hootsuite 신규 앱](https://blog.hootsuite.com/new-social-media-apps-platforms/), [2026 우정 트렌드](https://www.topteny.com/friendship-trends/), [마이크로 커뮤니티 트렌드](https://mmmake.com/en/blog/social-media-trends-2026-from-micro-communities-to-social-seo/)
- 친구 앱/워밍: [Introvrs 2026](https://www.introvrs.com/blog/best-friendship-apps-2026)
