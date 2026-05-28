# 공연 이후 관객 리액션 및 설문 결과 분석

생성일: 2026-05-29

## 데이터 개요

| 항목 | 값 | 의미 |
| --- | --- | --- |
| 설문 응답 | 5명 | 공연 후 만족도/상호작용 평가 |
| 리액션 이벤트 | 100건 | 공연 중 웹 아이콘 인터랙션 로그 |
| 추정 특수 인터랙션 | 10건 | 원자료 로그가 아니라 녹화 기반으로 보정한 천둥 버튼 추정치 |
| 리액션 참여 클라이언트 | 6명 | 리액션을 1회 이상 남긴 익명 클라이언트 |
| 리액션 발생 곡 | 11곡 | Psyche 제외 11곡에서 리액션 기록 |
| 설문-리액션 매칭 | 4/5명 | 설문 응답자의 80%가 리액션 로그와 연결 |
| 설문만 있음 | 1명 | 설문은 제출했지만 리액션 로그 없음 |
| 리액션만 있음 | 2명 | 리액션은 있으나 설문 제출 없음 |

## 읽는 순서

1. 핵심 해석 요약에서 전체 결론을 먼저 봅니다.
2. ID 연결 분석에서 같은 client_id로 묶인 "실제 참여 행동"과 "사후 평가"의 관계를 확인합니다.
3. 설문 응답, 상호작용 평가, 인상 깊었던 요소, 서술형 응답을 보며 왜 그런 결과가 나왔는지 확인합니다.
4. 곡별 리액션과 리액션 타입별 집계에서 공연 중 실제 행동 분포를 봅니다.
5. 질문 및 답변 형식, 원자료 수치표는 검산용 부록처럼 사용합니다.

## 핵심 해석 요약

이 레포트는 두 종류의 데이터를 함께 봅니다. 첫째, 공연 후 설문 응답은 관객이 공연을 어떻게 평가했는지 보여줍니다. 둘째, 공연 중 웹사이트 리액션 로그는 관객이 실제로 어느 곡에서 얼마나 참여했는지 보여줍니다. 두 데이터는 같은 client_id로 연결되어 있으므로, 익명 응답자 단위로 "실제 참여 행동"과 "사후 평가"를 함께 해석할 수 있습니다.

| 핵심 발견 | 근거 수치 | 해석 |
| --- | --- | --- |
| 공간/곡 분위기 결합은 가장 강하게 긍정 평가됨 | 공간 적합도 평균 5점, 5점 응답 5/5명 | 공연의 장소성과 곡 분위기는 관객에게 명확하게 전달된 것으로 볼 수 있습니다. |
| 물리적 관람 환경은 개선 여지가 큼 | 바닥 착석 편안함 평균 3.4점, 4-5점 비율 40% | 콘텐츠보다 바닥 착석, 시야, 방석, 동선 같은 환경 설계가 다음 개선 우선순위입니다. |
| 웹 페이지는 분위기 이해에는 강하지만 몰입감은 상대적으로 낮음 | 분위기 이해 - 웹 페이지 평균 4.8점 / 참여 몰입 - 웹 페이지 평균 3.8점 | 웹 인터랙션이 곡 이해에는 도움이 되었지만, 참여 몰입을 높이는 방식은 더 다듬을 여지가 있습니다. |
| 가장 기억에 남은 요소는 천장 프로젝션 | 천장 프로젝션 4/5명 선택(80%) | 관객의 사후 기억에 가장 강하게 남은 시각적 장치로 볼 수 있습니다. |
| 리액션은 일부 곡에 집중됨 | 부둣가 16건, Knock Knock 15건, 대동제 11건 | 상위 곡은 곡의 장면 전환이나 인터랙션 구조가 관객 행동을 더 잘 유도했을 가능성이 있습니다. |
| Knock Knock의 천둥 버튼은 별도 추정치로 반영됨 | 이모지 리액션 15건 + 천둥 버튼 추정 10건 = 보정 총 25건 | 천둥 버튼은 Supabase 리액션 로그에 저장되지 않아 녹화 청취 기반 추정치로 분리 표기했습니다. |
| 참여 폭과 만족도 사이에 탐색적 관계가 보임 | 리액션한 곡 수 ↔ 전반적 만족도, Pearson r=0.922, N=5 | 여러 곡에 걸쳐 리액션을 남긴 관객일수록 전반 만족도도 높게 나타났습니다. 단, 표본이 작아 인과관계가 아니라 경향으로 해석해야 합니다. |

주의할 점은 표본이 작다는 것입니다. 따라서 이 결과는 "증명"이라기보다, 공연에서 어떤 참여 경험이 긍정적 평가와 함께 나타났는지 보여주는 탐색적 근거로 해석하는 것이 안전합니다.

## ID 연결 분석

설문과 공연 중 웹 인터렉션은 같은 client_id를 사용하므로, 익명 응답자 단위로 실제 행동량과 사후 평가를 연결해 볼 수 있습니다. 단, 설문 응답자가 5명으로 적기 때문에 상관계수는 결론이라기보다 탐색적 단서로 해석해야 합니다.

이 섹션에서 얻을 수 있는 의미 있는 값은 세 가지입니다. 첫째, 설문 응답자 중 실제 리액션 로그와 연결되는 사람이 몇 명인지입니다. 이번 데이터에서는 5명 중 4명(80%)이 연결됩니다. 둘째, 각 응답자가 공연 중 얼마나 넓게 참여했는지입니다. 응답자 4는 11곡에서 리액션을 남겼고, 총 65건의 리액션을 기록했습니다. 셋째, 참여 행동과 사후 평가가 같은 방향으로 움직이는지입니다. 이번 데이터에서는 리액션한 곡 수와 전반적 만족도의 상관이 가장 크게 나타났습니다.

### 응답자별 행동-설문 요약

| 응답자 | 리액션 로그 | 총 리액션 | 추정 천둥 | 보정 총합 | 리액션한 곡 수 | 1곡당 리액션 | 최다 리액션 곡 | 주 리액션 | 전체 설문 평균 | 전반 만족 | 능동 참여 | 재관람 | 상호작용 평균 | 인상 요소 수 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 응답자 1 | yes | 10 | 2 | 12 | 6 | 1.67 | Knock Knock | 반짝임 | 3.71 | 4 | 3 | 4 | 4.33 | 3 |
| 응답자 2 | no | 0 | 0 | 0 | 0 | 0 |  |  | 3.14 | 3 | 4 | 3 | 3.11 | 1 |
| 응답자 3 | yes | 7 | 1 | 8 | 4 | 1.75 | 날 좀 봐줘요, 좀 봐줘요 | 박수 | 4.43 | 4 | 5 | 4 | 4.56 | 2 |
| 응답자 4 | yes | 65 | 4 | 69 | 11 | 5.91 | 부둣가 | 좋아요 | 5 | 5 | 5 | 5 | 5 | 3 |
| 응답자 5 | yes | 3 | 0 | 3 | 2 | 1.5 | 새벽두시 | 좋아요 | 4.29 | 4 | 5 | 5 | 4.67 | 5 |

![리액션 수와 설문 평균](charts/joined_reactions_vs_avg_rating.svg)

![리액션한 곡 수와 전반적 만족도](charts/joined_active_songs_vs_satisfaction.svg)

해석: 응답자 4는 원자료 기준 총 리액션 65건, 리액션한 곡 수 11곡으로 가장 적극적인 참여자입니다. 추정 천둥 버튼까지 포함하면 보정 총합은 69건입니다. 이 응답자의 전체 설문 평균은 5점, 전반 만족도는 5점입니다. 반대로 리액션 로그가 없는 설문 응답자는 1명이며, 응답자 2의 전체 설문 평균은 3.14점입니다. 이 비교는 "참여 행동이 많은 관객이 더 긍정적으로 평가했는가"를 볼 수 있게 해줍니다.

### 탐색적 상관

| 행동 지표 | 설문 지표 | N | Pearson r | 비고 |
| --- | --- | --- | --- | --- |
| 리액션한 곡 수 | 전반적 만족도 | 5 | 0.922 | 표본이 작아 탐색적 지표로만 해석 |
| 총 리액션 수 | 전반적 만족도 | 5 | 0.848 | 표본이 작아 탐색적 지표로만 해석 |
| 리액션한 곡 수 | 전체 설문 평균 | 5 | 0.744 | 표본이 작아 탐색적 지표로만 해석 |
| 총 리액션 수 | 전체 설문 평균 | 5 | 0.729 | 표본이 작아 탐색적 지표로만 해석 |
| 리액션한 곡 수 | 상호작용 평가 평균 | 5 | 0.725 | 표본이 작아 탐색적 지표로만 해석 |
| 리액션한 곡 수 | 재관람 의향 | 5 | 0.595 | 표본이 작아 탐색적 지표로만 해석 |
| 총 리액션 수 | 상호작용 평가 평균 | 5 | 0.583 | 표본이 작아 탐색적 지표로만 해석 |
| 총 리액션 수 | 흐름/몰입도 | 5 | 0.572 | 표본이 작아 탐색적 지표로만 해석 |

해석: Pearson r은 -1에서 1 사이의 값이며, 1에 가까울수록 두 지표가 함께 높아지는 경향이 강합니다. 이번 데이터에서 리액션한 곡 수와 전반적 만족도의 r=0.922로 가장 큽니다. 따라서 단순히 버튼을 많이 누른 횟수뿐 아니라, 여러 곡에 걸쳐 꾸준히 참여한 폭이 만족도와 함께 나타났다고 해석할 수 있습니다. 다만 N=5이므로 인과관계로 단정하지 않고 탐색적 경향으로만 보는 것이 적절합니다.

### 설문 없이 리액션만 있는 클라이언트

| 참여자 | 총 리액션 | 리액션한 곡 수 | 최다 리액션 곡 | 최다 곡 리액션 수 | 주 리액션 | 주 리액션 수 |
| --- | --- | --- | --- | --- | --- | --- |
| 리액션만 1 | 8 | 3 | Knock Knock | 4 | 박수 | 4 |
| 리액션만 2 | 7 | 6 | 스물여덟 | 2 | 반짝임 | 3 |

해석: 이 표는 공연 중 리액션은 남겼지만 설문을 제출하지 않은 참여자를 보여줍니다. 이들은 설문 평가와 연결할 수는 없지만, 실제 공연 중 참여 총량을 해석할 때는 포함해야 합니다. 즉, 곡별 리액션 총량과 리액션 타입별 총량은 이 참여자들의 행동도 포함한 전체 현장 반응입니다.

## 설문 응답 요약

각 척도형 문항은 점수 분포를 파이차트로 표시했습니다. 서술형 문항은 수치화 요약 뒤에 원문 응답을 그대로 표시했습니다.

가장 높은 평균은 공간 적합도(5)이고, 가장 낮은 평균은 바닥 착석 편안함(3.4)입니다.

해석: 공간 적합도 항목이 가장 높다는 것은 공연의 컨셉과 공간 분위기가 관객에게 잘 전달되었음을 시사합니다. 바닥 착석 편안함 항목이 가장 낮다는 것은 관객 경험의 불편이 콘텐츠 자체보다 착석 방식이나 물리적 환경에서 발생했을 가능성을 보여줍니다. 따라서 다음 개선 방향은 음악/인터랙션 컨셉을 바꾸는 것보다 관람 자세, 방석, 시야, 참여 동선 같은 환경 설계에 우선순위를 둘 수 있습니다.

### 전반적 만족도

질문: 오늘 공연에 전반적으로 만족했다.  
Question: Overall, I was satisfied with today’s performance.  
답변 방식: 5점 리커트 척도 단일 선택  
답변 선택지: 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree)  
응답 분포: 1점 0명, 2점 0명, 3점 1명, 4점 3명, 5점 1명

응답 5명, 평균 4, 중앙값 4, 4-5점 80%

![전반적 만족도 점수분포](charts/survey_overall_satisfaction.svg)

### 흐름/몰입도

질문: 공연의 흐름이 자연스럽고 몰입하기 좋았다.  
Question: The flow of the performance felt natural and immersive.  
답변 방식: 5점 리커트 척도 단일 선택  
답변 선택지: 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree)  
응답 분포: 1점 0명, 2점 0명, 3점 2명, 4점 1명, 5점 2명

응답 5명, 평균 4, 중앙값 4, 4-5점 60%

![흐름/몰입도 점수분포](charts/survey_flow_immersion.svg)

### 공간 적합도

질문: 공연 공간의 분위기가 곡과 잘 어울렸다.  
Question: The atmosphere of the venue matched the songs well.  
답변 방식: 5점 리커트 척도 단일 선택  
답변 선택지: 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree)  
응답 분포: 1점 0명, 2점 0명, 3점 0명, 4점 0명, 5점 5명

응답 5명, 평균 5, 중앙값 5, 4-5점 100%

![공간 적합도 점수분포](charts/survey_space_fit.svg)

### 바닥 착석 편안함

질문: 돗자리에 앉아 인터렉션에 참여하는 공연장의 공간 구도가 편안했다.  
Question: The floor-seating layout for participating in the interactions felt comfortable.  
답변 방식: 5점 리커트 척도 단일 선택  
답변 선택지: 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree)  
응답 분포: 1점 0명, 2점 1명, 3점 2명, 4점 1명, 5점 1명

응답 5명, 평균 3.4, 중앙값 3, 4-5점 40%

![바닥 착석 편안함 점수분포](charts/survey_floor_seating_comfort.svg)

### 능동적 참여도

질문: 기존의 일반적인 공연보다 더 능동적으로 참여한다고 느꼈다.  
Question: Compared with a typical concert, I felt more actively involved.  
답변 방식: 5점 리커트 척도 단일 선택  
답변 선택지: 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree)  
응답 분포: 1점 0명, 2점 0명, 3점 1명, 4점 1명, 5점 3명

응답 5명, 평균 4.4, 중앙값 5, 4-5점 80%

![능동적 참여도 점수분포](charts/survey_active_participation.svg)

### 예술적 적합도

질문: 인터렉션 요소가 공연의 예술적 완성도를 해치지 않고 자연스럽게 어울렸다.  
Question: The interactive elements felt natural and did not weaken the artistic quality.  
답변 방식: 5점 리커트 척도 단일 선택  
답변 선택지: 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree)  
응답 분포: 1점 0명, 2점 1명, 3점 1명, 4점 1명, 5점 2명

응답 5명, 평균 3.8, 중앙값 4, 4-5점 60%

![예술적 적합도 점수분포](charts/survey_artistic_fit.svg)

### 재관람 의향

질문: 다시 비슷한 형식의 공연을 관람하고 싶다.  
Question: I would like to attend a similar performance again.  
답변 방식: 5점 리커트 척도 단일 선택  
답변 선택지: 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree)  
응답 분포: 1점 0명, 2점 0명, 3점 1명, 4점 2명, 5점 2명

응답 5명, 평균 4.2, 중앙값 4, 4-5점 80%

![재관람 의향 점수분포](charts/survey_revisit_intent.svg)


![설문 척도 문항 평균](charts/survey_ratings_average.svg)

## 상호작용 평가

상위 질문: 인터렉션 경험을 영역별로 평가해 주세요.  
Parent question: Please rate each type of interaction separately.

해석: 상호작용 평가는 "어떤 매체가 곡의 감정 이해, 참여 몰입, 사용 편안함에 도움이 되었는지"를 나눠서 봅니다. 최고 평균은 분위기 이해 - 웹 페이지 4.8점이고, 최저 평균은 참여 몰입 - 웹 페이지 3.8점입니다. 낮은 항목은 해당 매체가 관객의 주의를 음악에서 분산시켰거나, 참여 방식이 충분히 직관적으로 느껴지지 않았을 가능성을 점검하는 지점입니다.

### 분위기 이해 - 빔프로젝터

질문: 곡의 감정이나 분위기를 이해하는 데 도움이 되었다. - 빔프로젝터  
Question: It helped me understand the emotion or mood of the songs. - Projection  
답변 방식: 영역별 5점 리커트 척도 단일 선택  
답변 선택지: 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree)  
응답 분포: 1점 0명, 2점 0명, 3점 0명, 4점 2명, 5점 3명

응답 5명, 평균 4.6, 중앙값 5, 4-5점 100%

![분위기 이해 - 빔프로젝터 점수분포](charts/interaction_mood_understanding-projection.svg)

### 분위기 이해 - 웹 페이지

질문: 곡의 감정이나 분위기를 이해하는 데 도움이 되었다. - 웹 페이지  
Question: It helped me understand the emotion or mood of the songs. - Web page  
답변 방식: 영역별 5점 리커트 척도 단일 선택  
답변 선택지: 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree)  
응답 분포: 1점 0명, 2점 0명, 3점 0명, 4점 1명, 5점 4명

응답 5명, 평균 4.8, 중앙값 5, 4-5점 100%

![분위기 이해 - 웹 페이지 점수분포](charts/interaction_mood_understanding-web_page.svg)

### 분위기 이해 - 실물 터치

질문: 곡의 감정이나 분위기를 이해하는 데 도움이 되었다. - 실물 터치  
Question: It helped me understand the emotion or mood of the songs. - Physical touch  
답변 방식: 영역별 5점 리커트 척도 단일 선택  
답변 선택지: 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree)  
응답 분포: 1점 0명, 2점 1명, 3점 0명, 4점 2명, 5점 2명

응답 5명, 평균 4, 중앙값 4, 4-5점 80%

![분위기 이해 - 실물 터치 점수분포](charts/interaction_mood_understanding-physical_touch.svg)

### 참여 몰입 - 빔프로젝터

질문: 공연에 참여하고 몰입하고 있다는 느낌을 주었다. - 빔프로젝터  
Question: It made me feel involved and immersed in the performance. - Projection  
답변 방식: 영역별 5점 리커트 척도 단일 선택  
답변 선택지: 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree)  
응답 분포: 1점 0명, 2점 0명, 3점 2명, 4점 1명, 5점 2명

응답 5명, 평균 4, 중앙값 4, 4-5점 60%

![참여 몰입 - 빔프로젝터 점수분포](charts/interaction_participation_immersion-projection.svg)

### 참여 몰입 - 웹 페이지

질문: 공연에 참여하고 몰입하고 있다는 느낌을 주었다. - 웹 페이지  
Question: It made me feel involved and immersed in the performance. - Web page  
답변 방식: 영역별 5점 리커트 척도 단일 선택  
답변 선택지: 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree)  
응답 분포: 1점 0명, 2점 1명, 3점 1명, 4점 1명, 5점 2명

응답 5명, 평균 3.8, 중앙값 4, 4-5점 60%

![참여 몰입 - 웹 페이지 점수분포](charts/interaction_participation_immersion-web_page.svg)

### 참여 몰입 - 실물 터치

질문: 공연에 참여하고 몰입하고 있다는 느낌을 주었다. - 실물 터치  
Question: It made me feel involved and immersed in the performance. - Physical touch  
답변 방식: 영역별 5점 리커트 척도 단일 선택  
답변 선택지: 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree)  
응답 분포: 1점 0명, 2점 0명, 3점 1명, 4점 1명, 5점 3명

응답 5명, 평균 4.4, 중앙값 5, 4-5점 80%

![참여 몰입 - 실물 터치 점수분포](charts/interaction_participation_immersion-physical_touch.svg)

### 상호작용 편안함 - 빔프로젝터

질문: 참여 방식이 직관적이고 부담스럽지 않았다. - 빔프로젝터  
Question: The way of participating felt intuitive and comfortable. - Projection  
답변 방식: 영역별 5점 리커트 척도 단일 선택  
답변 선택지: 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree)  
응답 분포: 1점 0명, 2점 1명, 3점 1명, 4점 0명, 5점 3명

응답 5명, 평균 4, 중앙값 5, 4-5점 60%

![상호작용 편안함 - 빔프로젝터 점수분포](charts/interaction_interaction_comfort-projection.svg)

### 상호작용 편안함 - 웹 페이지

질문: 참여 방식이 직관적이고 부담스럽지 않았다. - 웹 페이지  
Question: The way of participating felt intuitive and comfortable. - Web page  
답변 방식: 영역별 5점 리커트 척도 단일 선택  
답변 선택지: 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree)  
응답 분포: 1점 0명, 2점 0명, 3점 0명, 4점 2명, 5점 3명

응답 5명, 평균 4.6, 중앙값 5, 4-5점 100%

![상호작용 편안함 - 웹 페이지 점수분포](charts/interaction_interaction_comfort-web_page.svg)

### 상호작용 편안함 - 실물 터치

질문: 참여 방식이 직관적이고 부담스럽지 않았다. - 실물 터치  
Question: The way of participating felt intuitive and comfortable. - Physical touch  
답변 방식: 영역별 5점 리커트 척도 단일 선택  
답변 선택지: 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree)  
응답 분포: 1점 0명, 2점 0명, 3점 0명, 4점 1명, 5점 4명

응답 5명, 평균 4.8, 중앙값 5, 4-5점 100%

![상호작용 편안함 - 실물 터치 점수분포](charts/interaction_interaction_comfort-physical_touch.svg)


![상호작용 평가 평균](charts/interaction_ratings_heatmap.svg)

## 인상 깊었던 요소

질문: 이번 공연에서 가장 인상 깊었던 요소는 무엇인가요? 복수 선택이 가능합니다.  
Question: What were the most memorable elements of this performance? You may select multiple options.  
답변 방식: 복수 선택형 체크박스

복수 선택 문항이라 각 선택지 비율의 합이 100%가 아닐 수 있습니다.

해석: 이 문항은 평균 점수가 아니라 기억에 남은 요소의 빈도를 봅니다. 천장 프로젝션이 가장 많이 선택되었으므로, 공연 이후 관객 기억에 가장 강하게 남은 장치로 볼 수 있습니다. 선택 수가 낮은 요소는 반드시 실패했다기보다, 관객이 공연을 회상할 때 상대적으로 덜 먼저 떠올린 요소라고 해석하는 편이 안전합니다.

| 요소 | Answer | 선택 수 | 응답자 대비 % |
| --- | --- | --- | --- |
| 음악 | Music | 3 | 60 |
| 공간 연출 | Spatial direction | 1 | 20 |
| 천장 프로젝션 | Ceiling projection | 4 | 80 |
| 웹 이모지 반응 | Web emoji reactions | 0 | 0 |
| 천둥 버튼 | Thunder button | 3 | 60 |
| 손 모양 마네킹 인터렉션 | Hand mannequin interaction | 1 | 20 |
| 관객들과 함께 참여하는 분위기 | The shared audience atmosphere | 2 | 40 |

![인상 깊었던 요소 선택 비중](charts/most_impressive_pie.svg)

![인상 깊었던 요소 선택 수](charts/most_impressive_counts.svg)

## 서술형 응답

| 문항 | 응답 수 | 응답률 % | 평균 글자 수 | 최소 | 최대 |
| --- | --- | --- | --- | --- | --- |
| 기억에 남는 순간 | 4 | 80 | 81 | 32 | 138 |
| 개선점 | 3 | 60 | 168.7 | 16 | 262 |

해석: 서술형 응답은 수치보다 이유를 설명해 줍니다. 기억에 남는 순간에서는 손/기타/드럼스틱/천둥/공동 참여처럼 직접 참여하거나 감각적으로 강한 장면이 반복해서 언급됩니다. 개선점에서는 방석, 장비 인식, 프로젝션이 음악 감상 집중을 나누는 문제, 이모지 반응의 실시간 시각화 같은 제안이 나옵니다. 즉, 긍정 경험은 "참여가 음악 경험을 강화할 때" 발생했고, 개선 요구는 "참여가 음악 감상을 방해하거나 피드백이 충분히 보이지 않을 때" 나타났다고 볼 수 있습니다.

### 기억에 남는 순간

질문: 가장 기억에 남은 순간이나 인터렉션을 적어주세요.  
Question: Please write the moment or interaction you remember most.  
답변 방식: 자유 서술형

1. the hand /guitar/ drumsticks were very fun and interactive while actively adding to the musical experience. thr thunder was also memorable

2. 루프? 활용해서 반복 돌렸던 노래가 인상깊어요 + 드럼스틱

3. 관객들이 밴드의 일원으로 참여하는 ‘누군가의‘ 인터렉션이 가장 좋았다.

4. 기타, 드럼, 손 등 다양한 악기와 함께 음악에 참여할 수 있던 인터렉션이 무척 재밌었습니다. 그리고 인상적이었던 것은 천둥인것 같아요. 곡과 프로젝션의 분위기와 무척 잘 어울리는 청각요소였다고 생각합니다.


### 개선점

질문: 개선되었으면 하는 점이 있다면 적어주세요.  
Question: Please share anything you think could be improved.  
답변 방식: 자유 서술형

1. I think that the projection interactions were not adding to the music, my focus was split between seeing if my action affected the screen and the music itself. the projection where my focus was not split was the rain one but otherwise it was a little distracting

2. 방석이 있으면 좋을 거 같아요

3. 아무래도 장비가 아쉽긴 합니다. 카메라 인식 기능이 좋아져서 인터렉션이 더 자연스러웠으면 좋을 것 같아요.<br>그리고 QR을 통해 모바일적 요소로 인터렉션을 의도한 것은 무척 좋은데, 관람객들이 이모지 등을 통해 감정을 표현할 수 있는 만큼 뭔가 무대에 이모지가 뿅뿅 올라오는(집계되는)  장면을 실시간으로 보여줘도 좋을 것 같습니다. 가사도 볼 수 있고, 곡 내용도 큰 화면으로 볼 수 있으면 좋을 것 같아요.


## 곡별 리액션

| 순서 | 곡 | 총 리액션 | 참여 클라이언트 | 1인당 리액션 | 박수 | 좋아요 | 반짝임 | 파도 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 스물여덟 | 4 | 2 | 2 | 3 | 0 | 1 | 0 |
| 2 | 대동제 | 11 | 3 | 3.67 | 3 | 5 | 0 | 3 |
| 3 | 부둣가 | 16 | 4 | 4 | 5 | 5 | 1 | 5 |
| 4 | 소년과 소녀 | 10 | 4 | 2.5 | 1 | 5 | 4 | 0 |
| 5 | 괜한 말 | 5 | 3 | 1.67 | 3 | 0 | 1 | 1 |
| 6 | Knock Knock | 15 | 5 | 3 | 5 | 4 | 5 | 1 |
| 7 | 바다 | 9 | 2 | 4.5 | 2 | 3 | 1 | 3 |
| 8 | Psyche | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 9 | 누군가의 | 5 | 2 | 2.5 | 4 | 1 | 0 | 0 |
| 10 | 홍묘 | 7 | 2 | 3.5 | 0 | 6 | 1 | 0 |
| 11 | 새벽두시 | 10 | 3 | 3.33 | 5 | 4 | 1 | 0 |
| 12 | 날 좀 봐줘요, 좀 봐줘요 | 8 | 2 | 4 | 4 | 4 | 0 | 0 |

리액션 총량 상위 곡은 부둣가(16), Knock Knock(15), 대동제(11), 소년과 소녀(10), 새벽두시(10)입니다.

해석: 곡별 리액션은 관객이 어느 곡에서 더 많이 행동했는지를 보여줍니다. 상위 곡은 관객이 반응할 수 있는 구조가 잘 작동했거나, 곡 자체의 감정/장면 전환이 리액션을 유도했을 가능성이 있습니다. 단, 한 명의 적극적인 참여자가 많은 리액션을 남길 수 있으므로, 총 리액션 수와 함께 참여 클라이언트 수를 같이 봐야 합니다.

![곡별 리액션 수](charts/song_reactions_stacked.svg)

### 추정 특수 인터랙션: Knock Knock 천둥 버튼

Knock Knock에는 일반 이모지 리액션과 별도로 천둥 버튼이 있었지만, 이 버튼 클릭은 song_reactions 원자료에 저장되어 있지 않습니다. 녹화 확인 기준으로 약 10회 사용된 것으로 보고, 아래 표에는 원자료와 구분되는 추정치로 반영했습니다.

| 곡 | 인터랙션 | 원자료 이모지 리액션 | 천둥 버튼 추정 | 보정 총합 | 근거 |
| --- | --- | --- | --- | --- | --- |
| Knock Knock | 천둥 버튼 | 15 | 10 | 25 | 녹화 청취 기반 추정 |

천둥 버튼 10회는 기존 Knock Knock 이모지 리액션을 남긴 클라이언트 비중에 따라 아래처럼 분배했습니다. 이 분배는 실제 로그가 아니라 분석용 추정치입니다.

| 참여자 | Knock Knock 기존 리액션 | 추정 천둥 버튼 | 분배 기준 |
| --- | --- | --- | --- |
| 응답자 4 | 6 | 4 | Knock Knock에서 기록된 기존 이모지 리액션의 클라이언트별 비중 |
| 리액션만 1 | 4 | 2 | Knock Knock에서 기록된 기존 이모지 리액션의 클라이언트별 비중 |
| 응답자 1 | 3 | 2 | Knock Knock에서 기록된 기존 이모지 리액션의 클라이언트별 비중 |
| 리액션만 2 | 1 | 1 | Knock Knock에서 기록된 기존 이모지 리액션의 클라이언트별 비중 |
| 응답자 3 | 1 | 1 | Knock Knock에서 기록된 기존 이모지 리액션의 클라이언트별 비중 |

추정 천둥 버튼까지 포함하면 곡별 보정 총량 상위 곡은 Knock Knock(25), 부둣가(16), 대동제(11), 소년과 소녀(10), 새벽두시(10)입니다. 따라서 원자료 기준으로는 부둣가가 16건으로 가장 높지만, Knock Knock의 천둥 버튼을 포함해 보면 Knock Knock이 25건으로 가장 높은 참여 곡으로 해석될 수 있습니다.

## 리액션 타입별 집계

| 리액션 | 총량 | 참여 클라이언트 | 전체 대비 % |
| --- | --- | --- | --- |
| 좋아요 | 37 | 5 | 37 |
| 박수 | 35 | 6 | 35 |
| 반짝임 | 15 | 5 | 15 |
| 파도 | 13 | 3 | 13 |

해석: 리액션 타입별 집계는 관객이 어떤 감정 표현 방식을 가장 많이 사용했는지 보여줍니다. 좋아요 리액션이 37건으로 가장 많았고 전체의 37%를 차지합니다. 이는 관객이 공연 중 긍정적 승인이나 호응을 표현하는 방식으로 해당 아이콘을 가장 자주 사용했다는 뜻입니다.

![리액션 타입별 비중](charts/reaction_type_pie.svg)

![리액션 타입별 총량](charts/reaction_type_counts.svg)

## 질문 및 답변 형식

이 섹션은 각 결과가 어떤 설문 문항에서 나온 값인지 확인하기 위한 참고 표입니다.

| 문항 | 질문 | Question | 답변 방식 | 답변 선택지 |
| --- | --- | --- | --- | --- |
| 전반적 만족도 | 오늘 공연에 전반적으로 만족했다. | Overall, I was satisfied with today’s performance. | 5점 리커트 척도 단일 선택 | 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree) |
| 흐름/몰입도 | 공연의 흐름이 자연스럽고 몰입하기 좋았다. | The flow of the performance felt natural and immersive. | 5점 리커트 척도 단일 선택 | 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree) |
| 공간 적합도 | 공연 공간의 분위기가 곡과 잘 어울렸다. | The atmosphere of the venue matched the songs well. | 5점 리커트 척도 단일 선택 | 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree) |
| 바닥 착석 편안함 | 돗자리에 앉아 인터렉션에 참여하는 공연장의 공간 구도가 편안했다. | The floor-seating layout for participating in the interactions felt comfortable. | 5점 리커트 척도 단일 선택 | 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree) |
| 능동적 참여도 | 기존의 일반적인 공연보다 더 능동적으로 참여한다고 느꼈다. | Compared with a typical concert, I felt more actively involved. | 5점 리커트 척도 단일 선택 | 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree) |
| 예술적 적합도 | 인터렉션 요소가 공연의 예술적 완성도를 해치지 않고 자연스럽게 어울렸다. | The interactive elements felt natural and did not weaken the artistic quality. | 5점 리커트 척도 단일 선택 | 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree) |
| 재관람 의향 | 다시 비슷한 형식의 공연을 관람하고 싶다. | I would like to attend a similar performance again. | 5점 리커트 척도 단일 선택 | 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree) |
| 분위기 이해 - 빔프로젝터 | 곡의 감정이나 분위기를 이해하는 데 도움이 되었다. - 빔프로젝터 | It helped me understand the emotion or mood of the songs. - Projection | 영역별 5점 리커트 척도 단일 선택 | 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree) |
| 분위기 이해 - 웹 페이지 | 곡의 감정이나 분위기를 이해하는 데 도움이 되었다. - 웹 페이지 | It helped me understand the emotion or mood of the songs. - Web page | 영역별 5점 리커트 척도 단일 선택 | 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree) |
| 분위기 이해 - 실물 터치 | 곡의 감정이나 분위기를 이해하는 데 도움이 되었다. - 실물 터치 | It helped me understand the emotion or mood of the songs. - Physical touch | 영역별 5점 리커트 척도 단일 선택 | 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree) |
| 참여 몰입 - 빔프로젝터 | 공연에 참여하고 몰입하고 있다는 느낌을 주었다. - 빔프로젝터 | It made me feel involved and immersed in the performance. - Projection | 영역별 5점 리커트 척도 단일 선택 | 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree) |
| 참여 몰입 - 웹 페이지 | 공연에 참여하고 몰입하고 있다는 느낌을 주었다. - 웹 페이지 | It made me feel involved and immersed in the performance. - Web page | 영역별 5점 리커트 척도 단일 선택 | 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree) |
| 참여 몰입 - 실물 터치 | 공연에 참여하고 몰입하고 있다는 느낌을 주었다. - 실물 터치 | It made me feel involved and immersed in the performance. - Physical touch | 영역별 5점 리커트 척도 단일 선택 | 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree) |
| 상호작용 편안함 - 빔프로젝터 | 참여 방식이 직관적이고 부담스럽지 않았다. - 빔프로젝터 | The way of participating felt intuitive and comfortable. - Projection | 영역별 5점 리커트 척도 단일 선택 | 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree) |
| 상호작용 편안함 - 웹 페이지 | 참여 방식이 직관적이고 부담스럽지 않았다. - 웹 페이지 | The way of participating felt intuitive and comfortable. - Web page | 영역별 5점 리커트 척도 단일 선택 | 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree) |
| 상호작용 편안함 - 실물 터치 | 참여 방식이 직관적이고 부담스럽지 않았다. - 실물 터치 | The way of participating felt intuitive and comfortable. - Physical touch | 영역별 5점 리커트 척도 단일 선택 | 1=전혀 그렇지 않다(Strongly disagree), 2=그렇지 않다(Disagree), 3=보통이다(Neutral), 4=그렇다(Agree), 5=매우 그렇다(Strongly agree) |
| 인상 깊었던 요소 | 이번 공연에서 가장 인상 깊었던 요소는 무엇인가요? 복수 선택이 가능합니다. | What were the most memorable elements of this performance? You may select multiple options. | 복수 선택형 체크박스 | 음악(Music), 공간 연출(Spatial direction), 천장 프로젝션(Ceiling projection), 웹 이모지 반응(Web emoji reactions), 천둥 버튼(Thunder button), 손 모양 마네킹 인터렉션(Hand mannequin interaction), 관객들과 함께 참여하는 분위기(The shared audience atmosphere) |
| 기억에 남는 순간 | 가장 기억에 남은 순간이나 인터렉션을 적어주세요. | Please write the moment or interaction you remember most. | 자유 서술형 | 응답자가 직접 작성 |
| 개선점 | 개선되었으면 하는 점이 있다면 적어주세요. | Please share anything you think could be improved. | 자유 서술형 | 응답자가 직접 작성 |

## 원자료 수치표

### 설문 척도 문항

| 문항 | N | 평균 | 중앙값 | Top2(4-5) | 1점 | 2점 | 3점 | 4점 | 5점 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 전반적 만족도 | 5 | 4 | 4 | 80 | 0 | 0 | 1 | 3 | 1 |
| 흐름/몰입도 | 5 | 4 | 4 | 60 | 0 | 0 | 2 | 1 | 2 |
| 공간 적합도 | 5 | 5 | 5 | 100 | 0 | 0 | 0 | 0 | 5 |
| 바닥 착석 편안함 | 5 | 3.4 | 3 | 40 | 0 | 1 | 2 | 1 | 1 |
| 능동적 참여도 | 5 | 4.4 | 5 | 80 | 0 | 0 | 1 | 1 | 3 |
| 예술적 적합도 | 5 | 3.8 | 4 | 60 | 0 | 1 | 1 | 1 | 2 |
| 재관람 의향 | 5 | 4.2 | 4 | 80 | 0 | 0 | 1 | 2 | 2 |

### 상호작용 평가

| 차원 | 채널 | N | 평균 | 중앙값 | Top2(4-5) | 1점 | 2점 | 3점 | 4점 | 5점 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 분위기 이해 | 빔프로젝터 | 5 | 4.6 | 5 | 100 | 0 | 0 | 0 | 2 | 3 |
| 분위기 이해 | 웹 페이지 | 5 | 4.8 | 5 | 100 | 0 | 0 | 0 | 1 | 4 |
| 분위기 이해 | 실물 터치 | 5 | 4 | 4 | 80 | 0 | 1 | 0 | 2 | 2 |
| 참여 몰입 | 빔프로젝터 | 5 | 4 | 4 | 60 | 0 | 0 | 2 | 1 | 2 |
| 참여 몰입 | 웹 페이지 | 5 | 3.8 | 4 | 60 | 0 | 1 | 1 | 1 | 2 |
| 참여 몰입 | 실물 터치 | 5 | 4.4 | 5 | 80 | 0 | 0 | 1 | 1 | 3 |
| 상호작용 편안함 | 빔프로젝터 | 5 | 4 | 5 | 60 | 0 | 1 | 1 | 0 | 3 |
| 상호작용 편안함 | 웹 페이지 | 5 | 4.6 | 5 | 100 | 0 | 0 | 0 | 2 | 3 |
| 상호작용 편안함 | 실물 터치 | 5 | 4.8 | 5 | 100 | 0 | 0 | 0 | 1 | 4 |

## 산출 파일

- survey_ratings_summary.csv
- interaction_ratings_summary.csv
- question_overview.csv
- most_impressive_counts.csv
- most_impressive_options_summary.csv
- open_text_summary.csv
- song_reactions_by_song.csv
- song_reactions_by_type.csv
- song_reactions_by_song_type.csv
- estimated_special_interactions_summary.csv
- estimated_special_interactions_by_participant.csv
- joined_client_summary.csv
- reaction_only_clients_summary.csv
- engagement_rating_correlations.csv
- charts/*.svg
