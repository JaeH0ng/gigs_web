# 만족도 조사 문항 정리

생성일: 2026-06-01  
출처: `src/App.jsx`에 구현된 공연 종료 후 만족도 조사 문항

이 문서는 설문 결과값이나 응답 내용을 제외하고, 실제 설문에 사용된 문항만 한눈에 보기 좋게 정리한 것입니다. 본 설문은 아래 참고문헌의 개념을 바탕으로 공연 맥락에 맞게 자체 구성한 문항이며, 특정 검증 척도를 원문 그대로 사용한 것은 아닙니다.

## 응답 척도

| 항목 | 내용 |
| --- | --- |
| 척도형 문항 | 5점 리커트 척도 |
| 안내 문구 | 1은 가장 낮은 동의, 5는 가장 높은 동의입니다. |
| 영어 안내 | 1 means the lowest agreement, and 5 means the highest agreement. |

## 전체 만족도 및 공연 경험 문항

| 번호 | 문항 ID | 한국어 문항 | English item | 응답 방식 | 설계 근거 |
| --- | --- | --- | --- | --- | --- |
| 1 | `overall_satisfaction` | 오늘 공연에 전반적으로 만족했다. | Overall, I was satisfied with today’s performance. | 5점 리커트 | 전반적 만족도 평가 |
| 2 | `flow_immersion` | 공연의 흐름이 자연스럽고 몰입하기 좋았다. | The flow of the performance felt natural and immersive. | 5점 리커트 | 몰입/흐름 경험 |
| 3 | `space_fit` | 공연 공간의 분위기가 곡과 잘 어울렸다. | The atmosphere of the venue matched the songs well. | 5점 리커트 | 물리적 환경/서비스스케이프 |
| 4 | `floor_seating_comfort` | 돗자리에 앉아 인터렉션에 참여하는 공연장의 공간 구도가 편안했다. | The floor-seating layout for participating in the interactions felt comfortable. | 5점 리커트 | 물리적 환경과 사용 편안함 |
| 5 | `active_participation` | 기존의 일반적인 공연보다 더 능동적으로 참여한다고 느꼈다. | Compared with a typical concert, I felt more actively involved. | 5점 리커트 | 참여감/관여도 |
| 6 | `artistic_fit` | 인터렉션 요소가 공연의 예술적 완성도를 해치지 않고 자연스럽게 어울렸다. | The interactive elements felt natural and did not weaken the artistic quality. | 5점 리커트 | 인터랙션의 맥락 적합성 |
| 7 | `revisit_intent` | 다시 비슷한 형식의 공연을 관람하고 싶다. | I would like to attend a similar performance again. | 5점 리커트 | 재방문/행동 의도 |

## 인터렉션 경험 평가 문항

상위 질문: 인터렉션 경험을 영역별로 평가해 주세요.  
Parent question: Please rate each type of interaction separately.

### 평가 영역

| 영역 ID | 한국어 | English |
| --- | --- | --- |
| `projection` | 빔프로젝터 | Projection |
| `web_page` | 웹 페이지 | Web page |
| `physical_touch` | 실물 터치 | Physical touch |

### 평가 문항

| 번호 | 문항 ID | 한국어 문항 | English item | 적용 영역 | 응답 방식 | 설계 근거 |
| --- | --- | --- | --- | --- | --- | --- |
| 8-1 | `mood_understanding` | 곡의 감정이나 분위기를 이해하는 데 도움이 되었다. | It helped me understand the emotion or mood of the songs. | 빔프로젝터, 웹 페이지, 실물 터치 | 영역별 5점 리커트 | 매체가 정서/분위기 이해에 기여했는지 평가 |
| 8-2 | `participation_immersion` | 공연에 참여하고 몰입하고 있다는 느낌을 주었다. | It made me feel involved and immersed in the performance. | 빔프로젝터, 웹 페이지, 실물 터치 | 영역별 5점 리커트 | 참여감과 몰입 경험 평가 |
| 8-3 | `interaction_comfort` | 참여 방식이 직관적이고 부담스럽지 않았다. | The way of participating felt intuitive and comfortable. | 빔프로젝터, 웹 페이지, 실물 터치 | 영역별 5점 리커트 | 사용 편안함/직관성 평가 |

## 인상 깊었던 요소 문항

| 번호 | 문항 ID | 한국어 문항 | English item | 응답 방식 |
| --- | --- | --- | --- | --- |
| 9 | `most_impressive` | 이번 공연에서 가장 인상 깊었던 요소는 무엇인가요? 복수 선택이 가능합니다. | What were the most memorable elements of this performance? You may select multiple options. | 복수 선택형 체크박스 |

### 선택지

| 값 | 한국어 선택지 | English option |
| --- | --- | --- |
| `music` | 음악 | Music |
| `space` | 공간 연출 | Spatial direction |
| `ceiling_projection` | 천장 프로젝션 | Ceiling projection |
| `emoji_reactions` | 웹 이모지 반응 | Web emoji reactions |
| `thunder_button` | 천둥 버튼 | Thunder button |
| `hand_mannequin` | 손 모양 마네킹 인터렉션 | Hand mannequin interaction |
| `shared_audience` | 관객들과 함께 참여하는 분위기 | The shared audience atmosphere |

## 서술형 문항

| 번호 | 문항 ID | 한국어 문항 | English item | 응답 방식 | 설계 목적 |
| --- | --- | --- | --- | --- | --- |
| 10 | `memorable_moment` | 가장 기억에 남은 순간이나 인터렉션을 적어주세요. | Please write the moment or interaction you remember most. | 자유 서술형 | 정량 문항으로 포착하기 어려운 강한 장면/이유 확인 |
| 11 | `improvement` | 개선되었으면 하는 점이 있다면 적어주세요. | Please share anything you think could be improved. | 자유 서술형 | 개선점과 관객 불편 요소 확인 |

## 설계 근거 요약

| 설문 구성 요소 | 참고 개념 | 적용 방식 |
| --- | --- | --- |
| 5점 동의 척도 | 태도 측정을 위한 리커트식 응답 방식 | 만족도, 몰입, 편안함, 재관람 의향 등 주관 평가를 1-5점으로 수집 |
| 전반적 만족도/재관람 의향 | 서비스 경험 이후의 행동 의도 | 공연 만족과 유사 형식 공연 재관람 의향을 분리해 측정 |
| 공간 적합도/착석 편안함 | 물리적 환경이 경험 평가에 미치는 영향 | 공연 공간의 분위기 적합성과 관람 자세의 편안함을 별도 문항으로 측정 |
| 흐름/몰입/참여감 | 몰입, 플로우, 인터랙티브 경험 | 공연 흐름, 참여감, 매체별 몰입 기여도를 평가 |
| 참여 방식의 직관성/편안함 | 지각된 사용 용이성 | 웹 페이지, 프로젝션, 실물 터치 등 참여 방식이 부담 없이 이해되는지 평가 |
| 서술형 문항 | 폐쇄형 문항의 보완 | 기억에 남는 순간과 개선점을 자유롭게 받아 정량 결과의 이유를 보완 |

## 참고문헌

Bitner, M. J. (1992). Servicescapes: The impact of physical surroundings on customers and employees. *Journal of Marketing, 56*(2), 57-71. https://doi.org/10.1177/002224299205600205

Csikszentmihalyi, M. (1990). *Flow: The psychology of optimal experience*. Harper & Row.

Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. *MIS Quarterly, 13*(3), 319-340. https://doi.org/10.2307/249008

Jennett, C., Cox, A. L., Cairns, P., Dhoparee, S., Epps, A., Tijs, T., & Walton, A. (2008). Measuring and defining the experience of immersion in games. *International Journal of Human-Computer Studies, 66*(9), 641-661. https://doi.org/10.1016/j.ijhcs.2008.04.004

Likert, R. (1932). A technique for the measurement of attitudes. *Archives of Psychology, 22*(140), 1-55.

Zeithaml, V. A., Berry, L. L., & Parasuraman, A. (1996). The behavioral consequences of service quality. *Journal of Marketing, 60*(2), 31-46. https://doi.org/10.1177/002224299606000203
