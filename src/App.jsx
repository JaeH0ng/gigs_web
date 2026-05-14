import { useEffect, useMemo, useRef, useState } from 'react'
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import './App.css'
import { performanceSongs } from './data/songs'
import { supabase, supabaseEnabled } from './lib/supabase'

const reactionTypes = [
  { id: 'like', label: '좋아요', symbol: '❤️' },
  { id: 'clap', label: '박수', symbol: '👏' },
  { id: 'wave', label: '파도', symbol: '🌊' },
  { id: 'spark', label: '반짝', symbol: '✨' },
]

const landingTheme = {
  background: '#111417',
  accent: '#f3d449',
  text: '#f6efe5',
}

const endingTheme = {
  background: '#171312',
  accent: '#f3d449',
  text: '#f6efe5',
}

const likertOptions = [
  { value: 1, ko: '전혀 그렇지 않다', en: 'Strongly disagree' },
  { value: 2, ko: '그렇지 않다', en: 'Disagree' },
  { value: 3, ko: '보통이다', en: 'Neutral' },
  { value: 4, ko: '그렇다', en: 'Agree' },
  { value: 5, ko: '매우 그렇다', en: 'Strongly agree' },
]

const surveyQuestions = [
  {
    id: 'overall_satisfaction',
    ko: '오늘 공연에 전반적으로 만족했다.',
    en: 'Overall, I was satisfied with today’s performance.',
  },
  {
    id: 'flow_immersion',
    ko: '공연의 흐름이 자연스럽고 몰입하기 좋았다.',
    en: 'The flow of the performance felt natural and immersive.',
  },
  {
    id: 'space_fit',
    ko: '공연 공간의 분위기가 곡과 잘 어울렸다.',
    en: 'The atmosphere of the venue matched the songs well.',
  },
  {
    id: 'emoji_participation',
    ko: '웹페이지의 이모지 반응은 공연에 참여하고 있다는 느낌을 주었다.',
    en: 'The emoji reactions on the webpage made me feel involved in the performance.',
  },
  {
    id: 'shared_reactions_immersion',
    ko: '관객들의 반응이 함께 공유되는 방식이 공연의 몰입감을 높였다.',
    en: 'Sharing audience reactions increased my immersion in the performance.',
  },
  {
    id: 'interaction_understanding',
    ko: '인터렉션은 곡의 감정이나 분위기를 이해하는 데 도움이 되었다.',
    en: 'The interactions helped me understand the emotions or mood of the songs.',
  },
  {
    id: 'interaction_memorable',
    ko: '인터렉션이 공연을 더 기억에 남게 만들었다.',
    en: 'The interactions made the performance more memorable.',
  },
  {
    id: 'active_participation',
    ko: '기존의 일반적인 공연보다 더 능동적으로 참여한다고 느꼈다.',
    en: 'Compared with a typical concert, I felt more actively involved.',
  },
  {
    id: 'artistic_fit',
    ko: '인터렉션 요소가 공연의 예술적 완성도를 해치지 않고 자연스럽게 어울렸다.',
    en: 'The interactive elements felt natural and did not weaken the artistic quality.',
  },
  {
    id: 'revisit_intent',
    ko: '다시 비슷한 형식의 공연을 관람하고 싶다.',
    en: 'I would like to attend a similar performance again.',
  },
]

const featureSurveyQuestions = [
  {
    id: 'thunder_button_fit',
    ko: 'Knock Knock의 천둥 버튼은 곡의 분위기와 잘 어울렸다.',
    en: 'The thunder button in “Knock Knock” matched the mood of the song.',
  },
  {
    id: 'hand_mannequin_interest',
    ko: '누군가의의 손 모양 마네킹 인터렉션은 흥미로웠다.',
    en: 'The hand mannequin interaction in “누군가의” was interesting.',
  },
]

const notExperiencedOption = {
  value: 0,
  ko: '경험하지 못했다',
  en: 'Did not experience',
}

const impressiveOptions = [
  { value: 'music', ko: '음악', en: 'Music' },
  { value: 'space', ko: '공간 연출', en: 'Spatial direction' },
  { value: 'ceiling_projection', ko: '천장 프로젝션', en: 'Ceiling projection' },
  { value: 'emoji_reactions', ko: '웹 이모지 반응', en: 'Web emoji reactions' },
  { value: 'thunder_button', ko: '천둥 버튼', en: 'Thunder button' },
  { value: 'hand_mannequin', ko: '손 모양 마네킹 인터렉션', en: 'Hand mannequin interaction' },
  { value: 'shared_audience', ko: '관객들과 함께 참여하는 분위기', en: 'The shared audience atmosphere' },
]

const emptySurveyAnswers = {
  ratings: Object.fromEntries(surveyQuestions.map((question) => [question.id, ''])),
  featureRatings: Object.fromEntries(featureSurveyQuestions.map((question) => [question.id, ''])),
  mostImpressive: '',
  memorableMoment: '',
  improvement: '',
}

const clientIdStorageKey = 'gigs-web-client-id'

function getPersistentClientId() {
  try {
    const storedClientId = window.localStorage.getItem(clientIdStorageKey)

    if (storedClientId) {
      return storedClientId
    }

    const nextClientId = window.crypto.randomUUID()
    window.localStorage.setItem(clientIdStorageKey, nextClientId)
    return nextClientId
  } catch {
    return window.crypto.randomUUID()
  }
}

function App() {
  useEffect(() => {
    const faviconHref = `${import.meta.env.BASE_URL}favicon.svg?v=${__APP_VERSION__}`
    let favicon = document.querySelector("link[rel='icon']")

    if (!favicon) {
      favicon = document.createElement('link')
      favicon.setAttribute('rel', 'icon')
      favicon.setAttribute('type', 'image/svg+xml')
      document.head.appendChild(favicon)
    }

    favicon.setAttribute('href', faviconHref)
  }, [])

  useEffect(() => {
    const versionCheckKey = 'gigs-web-last-reloaded-version'

    async function ensureLatestBuild() {
      try {
        const versionUrl = `${import.meta.env.BASE_URL}version.json?ts=${Date.now()}`
        const response = await fetch(versionUrl, {
          cache: 'no-store',
          headers: {
            'cache-control': 'no-store',
          },
        })

        if (!response.ok) {
          return
        }

        const payload = await response.json()
        const latestVersion = payload?.version

        if (!latestVersion || latestVersion === __APP_VERSION__) {
          sessionStorage.removeItem(versionCheckKey)
          return
        }

        const alreadyReloadedVersion = sessionStorage.getItem(versionCheckKey)

        if (alreadyReloadedVersion === latestVersion) {
          return
        }

        sessionStorage.setItem(versionCheckKey, latestVersion)

        const nextUrl = new URL(window.location.href)
        nextUrl.searchParams.set('appv', latestVersion)
        window.location.replace(nextUrl.toString())
      } catch {
        // Ignore version check failures and keep the current page usable.
      }
    }

    ensureLatestBuild()
  }, [])

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/intro" replace />} />
        <Route path="/intro" element={<IntroPage />} />
        <Route path="/ending" element={<EndingPage />} />
        <Route path="/song/:songId" element={<SongPage />} />
        <Route path="*" element={<Navigate to="/intro" replace />} />
      </Routes>
    </HashRouter>
  )
}

function IntroPage() {
  const navigate = useNavigate()
  const firstSong = performanceSongs[0]
  const landingLogoSrc = `${import.meta.env.BASE_URL}assets/logos/landing-logo.png?v=${__APP_VERSION__}`
  const swipeHandlers = useSwipeNavigation({
    onSwipeLeft: () => {
      if (firstSong) {
        navigate(`/song/${firstSong.order}`, { state: { direction: 'forward' } })
      }
    },
  })

  return (
    <MobileFrame
      themeColor={landingTheme.background}
      textColor={landingTheme.text}
      accentColor={landingTheme.accent}
      pageCue="next"
    >
      <section
        className="intro-screen intro-screen--logo-only"
        {...swipeHandlers}
      >
        <div className="landing-logo-stage">
          <LogoSlot
            src={landingLogoSrc}
            alt="공연 로고"
            className="landing-logo-slot"
            fallback="Logo"
          />
          <div className="landing-event-info">
            <p className="landing-event-info__label">Live Performance</p>
            <h1>블랙빌</h1>
            <p>2026. 05. 25. Mon · 7:00 PM</p>
            <p>감성달빛</p>
          </div>
          <div className="landing-notice">
            <p>공연은 약 60분간 진행됩니다.</p>
            <p>공연 종료 후 만족도 조사에 꼭 참여해 주세요.</p>
            <span>The performance will run for about 60 minutes. Please join the short survey after the show.</span>
          </div>
        </div>
      </section>
    </MobileFrame>
  )
}

function EndingPage() {
  const navigate = useNavigate()
  const lastSong = performanceSongs[performanceSongs.length - 1]
  const [surveyAnswers, setSurveyAnswers] = useState(emptySurveyAnswers)
  const [surveyStatus, setSurveyStatus] = useState('idle')
  const [surveyMessage, setSurveyMessage] = useState('')
  const surveyClientIdRef = useRef(getPersistentClientId())
  const swipeHandlers = useSwipeNavigation({
    onSwipeRight: () => {
      if (lastSong) {
        navigate(`/song/${lastSong.order}`, { state: { direction: 'backward' } })
      }
    },
  })

  return (
    <MobileFrame
      themeColor={endingTheme.background}
      textColor={endingTheme.text}
      accentColor={endingTheme.accent}
      pageCue="previous"
    >
      <section
        className="intro-screen ending-screen"
        {...swipeHandlers}
      >
        <header className="ending-hero">
          <p className="eyebrow">End</p>
          <h1 className="intro-title">공연이 종료되었습니다</h1>
          <p className="ending-copy">
            아래 만족도 조사는 약 5분 정도 소요됩니다.
            <span>Please take about 5 minutes to complete this survey.</span>
          </p>
        </header>

        {surveyStatus === 'submitted' ? (
          <SurveyCompleteCard />
        ) : (
          <form
            className="survey-card"
            data-no-swipe="true"
            onSubmit={(event) =>
              handleSurveySubmit({
                event,
                answers: surveyAnswers,
                clientId: surveyClientIdRef.current,
                setSurveyStatus,
                setSurveyMessage,
              })
            }
          >
            <div className="section-heading">
              <p className="eyebrow">Survey</p>
              <h2>만족도 조사 참여</h2>
            </div>

            <div className="survey-note">
              <p>1은 가장 낮은 동의, 5는 가장 높은 동의입니다.</p>
              <p>1 means the lowest agreement, and 5 means the highest agreement.</p>
            </div>

            <div className="survey-question-list">
              {surveyQuestions.map((question, index) => (
                <SurveyScaleQuestion
                  key={question.id}
                  index={index + 1}
                  question={question}
                  value={surveyAnswers.ratings[question.id]}
                  options={likertOptions}
                  name={`rating-${question.id}`}
                  onChange={(nextValue) =>
                    setSurveyAnswers((current) => ({
                      ...current,
                      ratings: {
                        ...current.ratings,
                        [question.id]: nextValue,
                      },
                    }))
                  }
                />
              ))}

              {featureSurveyQuestions.map((question, index) => (
                <SurveyScaleQuestion
                  key={question.id}
                  index={surveyQuestions.length + index + 1}
                  question={question}
                  value={surveyAnswers.featureRatings[question.id]}
                  options={[notExperiencedOption, ...likertOptions]}
                  name={`feature-${question.id}`}
                  onChange={(nextValue) =>
                    setSurveyAnswers((current) => ({
                      ...current,
                      featureRatings: {
                        ...current.featureRatings,
                        [question.id]: nextValue,
                      },
                    }))
                  }
                />
              ))}

              <fieldset className="survey-fieldset">
                <legend>
                  <span>13. 이번 공연에서 가장 인상 깊었던 요소는 무엇인가요?</span>
                  <small>What was the most memorable element of this performance?</small>
                </legend>
                <div className="choice-grid">
                  {impressiveOptions.map((option) => (
                    <label key={option.value} className="choice-option">
                      <input
                        type="radio"
                        name="most-impressive"
                        value={option.value}
                        checked={surveyAnswers.mostImpressive === option.value}
                        onChange={(event) =>
                          setSurveyAnswers((current) => ({
                            ...current,
                            mostImpressive: event.target.value,
                          }))
                        }
                      />
                      <span>
                        {option.ko}
                        <small>{option.en}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <SurveyTextQuestion
                index={14}
                labelKo="가장 기억에 남은 순간이나 인터렉션을 적어주세요."
                labelEn="Please write the moment or interaction you remember most."
                value={surveyAnswers.memorableMoment}
                onChange={(nextValue) =>
                  setSurveyAnswers((current) => ({
                    ...current,
                    memorableMoment: nextValue,
                  }))
                }
              />

              <SurveyTextQuestion
                index={15}
                labelKo="개선되었으면 하는 점이 있다면 적어주세요."
                labelEn="Please share anything you think could be improved."
                value={surveyAnswers.improvement}
                onChange={(nextValue) =>
                  setSurveyAnswers((current) => ({
                    ...current,
                    improvement: nextValue,
                  }))
                }
              />
            </div>

            <button
              type="submit"
              className="survey-submit"
              disabled={surveyStatus === 'submitting'}
            >
              {surveyStatus === 'submitting'
                ? '제출 중 / Submitting'
                : '제출하기 / Submit'}
            </button>

            {surveyMessage ? (
              <p className={`survey-message survey-message--${surveyStatus}`}>
                {surveyMessage}
              </p>
            ) : null}
          </form>
        )}

      </section>
    </MobileFrame>
  )
}

function SurveyScaleQuestion({ index, question, value, options, name, onChange }) {
  return (
    <fieldset className="survey-fieldset">
      <legend>
        <span>{index}. {question.ko}</span>
        <small>{question.en}</small>
      </legend>
      <div className="scale-options">
        {options.map((option) => (
          <label key={option.value} className="scale-option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value !== '' && Number(value) === option.value}
              onChange={(event) => onChange(Number(event.target.value))}
            />
            <span>{option.value}</span>
            <small>{option.ko}<br />{option.en}</small>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function SurveyCompleteCard() {
  return (
    <section className="survey-complete-card" data-no-swipe="true" aria-live="polite">
      <div className="survey-complete-mark" aria-hidden="true">✓</div>
      <p className="eyebrow">Submitted</p>
      <h2>제출이 완료되었습니다</h2>
      <p>
        소중한 의견이 저장되었습니다. 오늘 공연에 함께해 주셔서 감사합니다.
      </p>
      <p>
        Your response has been saved. Thank you for being part of today’s performance.
      </p>
      <div className="survey-complete-summary">
        <span>응답 완료</span>
        <small>Survey completed</small>
      </div>
    </section>
  )
}

function SurveyTextQuestion({ index, labelKo, labelEn, value, onChange }) {
  return (
    <label className="survey-text-field">
      <span>
        {index}. {labelKo}
        <small>{labelEn}</small>
      </span>
      <textarea
        value={value}
        rows={4}
        maxLength={600}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function SongPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { songId } = useParams()
  const headerLogoSrc = `${import.meta.env.BASE_URL}assets/logos/header-logo.png?v=${__APP_VERSION__}`
  const [activePanel, setActivePanel] = useState({
    songKey: null,
    type: null,
  })
  const [floatingReactions, setFloatingReactions] = useState([])
  const [reactionCounts, setReactionCounts] = useState({})
  const [, setChannelStatus] = useState('idle')
  const [reactionError, setReactionError] = useState('')
  const [soundActionError, setSoundActionError] = useState('')
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(0)
  const clientIdRef = useRef(getPersistentClientId())
  const reactionCountsRef = useRef({})
  const soundAudioPoolRef = useRef([])
  const soundCooldownTimeoutRef = useRef(null)
  const soundTickerRef = useRef(null)
  const previousSoundIndexRef = useRef(-1)

  const song = useMemo(() => {
    return performanceSongs.find(
      (item) => String(item.order) === songId || item.id === songId,
    )
  }, [songId])

  const songIndex = useMemo(() => {
    if (!song) {
      return -1
    }

    return performanceSongs.findIndex((item) => item.id === song.id)
  }, [song])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [song?.id])

  useEffect(() => {
    reactionCountsRef.current = reactionCounts
  }, [reactionCounts])

  useEffect(() => {
    return () => {
      if (soundCooldownTimeoutRef.current) {
        window.clearTimeout(soundCooldownTimeoutRef.current)
      }

      if (soundTickerRef.current) {
        window.clearInterval(soundTickerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const resetFrame = window.requestAnimationFrame(() => {
      setSoundActionError('')
      setCooldownRemainingMs(0)
    })

    if (soundCooldownTimeoutRef.current) {
      window.clearTimeout(soundCooldownTimeoutRef.current)
      soundCooldownTimeoutRef.current = null
    }

    if (soundTickerRef.current) {
      window.clearInterval(soundTickerRef.current)
      soundTickerRef.current = null
    }

    soundAudioPoolRef.current = []
    previousSoundIndexRef.current = -1

    const soundSources = getSoundSources(song?.soundAction)

    if (soundSources.length === 0) {
      return undefined
    }

    const audioPool = soundSources.map((source) => {
      const nextAudio = new Audio(source)
      nextAudio.preload = 'auto'
      return nextAudio
    })
    soundAudioPoolRef.current = audioPool

    const handleError = () => {
      setSoundActionError('천둥 사운드 파일을 불러오지 못했습니다.')
    }

    audioPool.forEach((audio) => {
      audio.addEventListener('error', handleError)
    })

    return () => {
      window.cancelAnimationFrame(resetFrame)
      audioPool.forEach((audio) => {
        audio.pause()
        audio.removeEventListener('error', handleError)
      })
    }
  }, [song?.id, song?.soundAction, song?.soundAction?.soundFile, song?.soundAction?.soundFiles])

  useEffect(() => {
    if (!song || !supabaseEnabled) {
      return undefined
    }

    let isMounted = true

    async function loadReactionCount() {
      const counts = {}

      await Promise.all(
        reactionTypes.map(async (reaction) => {
          const { count } = await supabase
            .from('song_reactions')
            .select('*', { count: 'exact', head: true })
            .eq('song_id', song.id)
            .eq('reaction_type', reaction.id)

          counts[reaction.id] = count ?? 0
        }),
      )

      if (isMounted) {
        setReactionCounts(counts)
      }
    }

    loadReactionCount()

    const channel = supabase
      .channel(`song-reactions-${song.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'song_reactions',
          filter: `song_id=eq.${song.id}`,
        },
        (payload) => {
          const reactionType = payload.new?.reaction_type

          if (!reactionTypes.some((reaction) => reaction.id === reactionType)) {
            return
          }

          let nextCounts = null

          setReactionCounts((current) => {
            nextCounts = {
              ...current,
              [reactionType]: (current[reactionType] ?? 0) + 1,
            }

            return nextCounts
          })

          if (payload.new?.client_id !== clientIdRef.current) {
            spawnReactionBurst(
              setFloatingReactions,
              reactionType,
              'remote',
              getBurstStrengthFromCounts(nextCounts ?? reactionCountsRef.current),
            )
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setChannelStatus('connected')
        } else if (status === 'CHANNEL_ERROR') {
          setChannelStatus('error')
          setReactionError('Realtime 채널 연결에 실패했습니다.')
        } else if (status === 'TIMED_OUT') {
          setChannelStatus('error')
          setReactionError('Realtime 연결 시간이 초과되었습니다.')
        } else if (status === 'CLOSED') {
          setChannelStatus('connecting')
        }
      })

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [song])

  const previousSong = songIndex > 0 ? performanceSongs[songIndex - 1] : null
  const nextSong = songIndex < performanceSongs.length - 1 ? performanceSongs[songIndex + 1] : null
  const direction = location.state?.direction === 'backward' ? 'backward' : 'forward'
  const pageDistance = Math.max(1, Number(location.state?.pageDistance) || 1)
  const hasMapImage = typeof song?.mapImage === 'string' && song.mapImage.trim().length > 0
  const swipeHandlers = useSwipeNavigation({
    onSwipeLeft: () => {
      if (nextSong) {
        navigate(`/song/${nextSong.order}`, { state: { direction: 'forward', pageDistance: 1 } })
      } else {
        navigate('/ending', { state: { direction: 'forward' } })
      }
    },
    onSwipeRight: () => {
      if (previousSong) {
        navigate(`/song/${previousSong.order}`, { state: { direction: 'backward', pageDistance: 1 } })
      } else {
        navigate('/intro', { state: { direction: 'backward' } })
      }
    },
  })

  if (!song) {
    return <Navigate to="/intro" replace />
  }

  const visiblePanel = activePanel.songKey === song.id ? activePanel.type : null
  const totalReactionCount = reactionTypes.reduce(
    (sum, reaction) => sum + (reactionCounts[reaction.id] ?? 0),
    0,
  )
  const soundAction = song.soundAction
  const cooldownDurationMs = (soundAction?.cooldownSeconds ?? 0) * 1000
  const cooldownProgress = cooldownDurationMs
    ? Math.max(0, Math.min(1, 1 - cooldownRemainingMs / cooldownDurationMs))
    : 1
  const cooldownLabel = cooldownRemainingMs > 0
    ? `${(cooldownRemainingMs / 1000).toFixed(1)}`
    : null
  return (
    <MobileFrame
      themeColor={song.themeColor}
      textColor={song.textColor}
      accentColor={song.accentColor}
      backgroundImage={song.backgroundImage}
      skyPhase={song.skyPhase}
    >
      <article
        key={song.id}
        className={`song-screen song-screen--${direction} ${pageDistance > 1 ? 'song-screen--multi-turn' : ''} song-screen--sky-${song.skyPhase}`}
        style={{
          '--page-turn-distance': `${Math.min(28 + pageDistance * 8, 84)}px`,
          '--page-turn-distance-negative': `-${Math.min(28 + pageDistance * 8, 84)}px`,
          '--page-turn-rotate': `${Math.min(16 + pageDistance * 4, 42)}deg`,
          '--page-turn-rotate-negative': `-${Math.min(16 + pageDistance * 4, 42)}deg`,
          '--page-turn-duration': `${Math.min(0.48 + pageDistance * 0.07, 1.08)}s`,
          '--time-wash-duration': `${Math.min(0.72 + pageDistance * 0.06, 1.24)}s`,
        }}
        {...swipeHandlers}
      >
        <div className="time-transition-wash" aria-hidden="true" />
        <header className="song-hero">
          <LogoSlot
            src={headerLogoSrc}
            alt="공연 심볼"
            className="header-logo-slot"
            fallback="Mark"
          />
          <p className="eyebrow">
            Track {String(songIndex + 1).padStart(2, '0')} / {String(performanceSongs.length).padStart(2, '0')}
          </p>
          <h1 className="song-title">{song.title}</h1>
        </header>

        <section className="map-card">
          <div className="map-frame">
            {hasMapImage ? (
              <img
                src={song.mapImage}
                alt={`${song.title} 공연장 도면`}
                className="map-image"
              />
            ) : (
              <div className="map-placeholder">
                <p className="map-placeholder__eyebrow">Venue Map Pending</p>
                <strong>공연장 도면 준비 전</strong>
                <p>지금은 인터렉션 정보만 확인할 수 있습니다.</p>
              </div>
            )}
          </div>
        </section>

        <section className="info-card">
          <div className="section-heading">
            <p className="eyebrow">Behind Story</p>
            <h2>곡 이야기</h2>
          </div>
          <div className="prose-block prose-block--story-card">
            {song.behindStory.split('\n').map((line, index) => (
              <p key={`${song.id}-story-card-${index}`}>{line || <br />}</p>
            ))}
          </div>
          <div className="reaction-meta">
            <span className="reaction-count">
              {supabaseEnabled ? `함께 남긴 반응 ${totalReactionCount}` : '미리보기'}
            </span>
          </div>
          {reactionError ? (
            <p className="reaction-error">{reactionError}</p>
          ) : null}
        </section>

        <div className="floating-reaction-dock">
          <div className="reaction-toolbar">
            {soundAction ? (
              <button
                type="button"
                className={`reaction-button reaction-button--sound ${cooldownRemainingMs > 0 ? 'reaction-button--cooling' : ''}`}
                aria-label={soundAction.label}
                title={soundAction.label}
                style={{
                  '--cooldown-progress': `${cooldownProgress * 360}deg`,
                }}
                onClick={() =>
                  handleSoundAction({
                    song,
                    audioPoolRef: soundAudioPoolRef,
                    previousSoundIndexRef,
                    cooldownRemainingMs,
                    cooldownDurationMs,
                    setCooldownRemainingMs,
                    setSoundActionError,
                    cooldownTimeoutRef: soundCooldownTimeoutRef,
                    cooldownTickerRef: soundTickerRef,
                  })
                }
              >
                <span className="reaction-button__cooldown-ring" aria-hidden="true" />
                <span className="reaction-button__emoji" aria-hidden="true">
                  {soundAction.icon}
                </span>
                <small className="reaction-button__count reaction-button__count--cooldown">
                  {cooldownLabel ?? 'ON'}
                </small>
              </button>
            ) : null}
            {reactionTypes.map((reaction) => (
              <button
                key={reaction.id}
                type="button"
                className={`reaction-button reaction-button--${reaction.id}`}
                aria-label={reaction.label}
                title={reaction.label}
                onClick={() =>
                  handleReaction(
                    song.id,
                    reaction.id,
                    clientIdRef.current,
                    setFloatingReactions,
                    getBurstStrengthFromCounts(reactionCounts),
                  )
                }
              >
                <span className="reaction-button__emoji" aria-hidden="true">
                  {reaction.symbol}
                </span>
                <small className="reaction-button__count">
                  {reactionCounts[reaction.id] ?? 0}
                </small>
              </button>
            ))}
          </div>
        </div>

        <div className="panel-dock">
          <button
            type="button"
            className="lyrics-tab-button"
            onClick={() => setActivePanel({ songKey: song.id, type: 'lyrics' })}
          >
            가사
          </button>
        </div>

        {soundAction ? (
          <p className="sound-action-note">
            {soundActionError || soundAction.helperText}
          </p>
        ) : null}

        <DayFlowTimeline
          songs={performanceSongs}
          activeIndex={songIndex}
          onSelect={(targetSong, targetIndex) => {
            if (targetIndex === songIndex) {
              return
            }

            navigate(`/song/${targetSong.order}`, {
              state: {
                direction: targetIndex > songIndex ? 'forward' : 'backward',
                pageDistance: Math.abs(targetIndex - songIndex),
              },
            })
          }}
        />

        {visiblePanel ? (
          <div
            className="panel-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => setActivePanel({ songKey: null, type: null })}
          >
            <section
              className="panel-sheet"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="panel-sheet__header">
                <div>
                  <p className="eyebrow">
                    {visiblePanel === 'lyrics' ? 'Lyrics' : 'Behind Story'}
                  </p>
                  <h2>
                    {visiblePanel === 'lyrics' ? '가사' : '곡 이야기'}
                  </h2>
                </div>
                <button
                  type="button"
                  className="panel-close"
                  onClick={() => setActivePanel({ songKey: null, type: null })}
                  aria-label="닫기"
                >
                  닫기
                </button>
              </div>
              <div className="prose-block prose-block--sheet">
                {(visiblePanel === 'lyrics' ? song.lyrics : song.behindStory)
                  .split('\n')
                  .map((line, index) => (
                    <p key={`${song.id}-${visiblePanel}-${index}`}>{line || <br />}</p>
                  ))}
              </div>
            </section>
          </div>
        ) : null}

        <div className="heart-stage" aria-hidden="true">
          {floatingReactions.map((reaction) => (
            <span
              key={reaction.id}
              className={`floating-heart floating-heart--${reaction.variant} floating-heart--${reaction.reactionType}`}
              style={{
                '--heart-left': `${reaction.left}%`,
                '--heart-size': `${reaction.size}px`,
                '--heart-delay': `${reaction.delay}ms`,
                '--heart-drift': `${reaction.drift}px`,
                '--heart-duration': `${reaction.duration}ms`,
              }}
            >
              {reaction.symbol}
            </span>
          ))}
        </div>
      </article>
    </MobileFrame>
  )
}

function MobileFrame({
  themeColor,
  textColor,
  accentColor,
  backgroundImage,
  skyPhase,
  pageCue = 'both',
  children,
}) {
  const showPreviousCue = pageCue === 'both' || pageCue === 'previous'
  const showNextCue = pageCue === 'both' || pageCue === 'next'

  return (
    <main
      className={`app-shell ${skyPhase ? `app-shell--sky-${skyPhase}` : ''}`}
      style={{
        '--theme-color': themeColor,
        '--text-color': textColor,
        '--accent-color': accentColor,
        '--theme-image': backgroundImage ? `url("${backgroundImage}")` : 'none',
      }}
    >
      <div className="ambient ambient--left" />
      <div className="ambient ambient--right" />
      <div className="mobile-frame">
        {children}
        <div className="page-turn-cue" aria-hidden="true">
          {showPreviousCue ? (
            <span className="page-turn-cue__edge page-turn-cue__edge--left" />
          ) : null}
          {showNextCue ? (
            <span className="page-turn-cue__edge page-turn-cue__edge--right" />
          ) : null}
        </div>
      </div>
    </main>
  )
}

function DayFlowTimeline({ songs, activeIndex, onSelect }) {
  const progress = songs.length > 0
    ? ((activeIndex + 1) / songs.length) * 100
    : 100

  return (
    <nav
      className="day-flow"
      aria-label="곡의 하루 흐름"
      data-no-swipe="true"
      style={{
        '--day-flow-progress': `${progress}%`,
      }}
    >
      <div className="day-flow__track">
        {songs.map((timelineSong, index) => {
          const markerType = timelineSong.timelineIcon

          return (
            <button
              type="button"
              key={timelineSong.id}
              className={`day-flow__segment ${index === activeIndex ? 'day-flow__segment--active' : ''} ${timelineSong.timelineBreak ? 'day-flow__segment--break' : ''}`}
              style={{
                '--segment-color': timelineSong.timelineColor,
                '--segment-accent': timelineSong.timelineAccent,
              }}
              aria-current={index === activeIndex ? 'step' : undefined}
              aria-label={`${timelineSong.order}번 곡 ${timelineSong.title}`}
              onClick={() => onSelect?.(timelineSong, index)}
            >
              {markerType ? (
                <span
                  className={`day-flow__celestial day-flow__celestial--${markerType}`}
                  aria-hidden="true"
                >
                  {markerType === 'storm' ? (
                    <span className="day-flow__rain" />
                  ) : null}
                </span>
              ) : null}
              {timelineSong.timelineBreak ? (
                <span className="day-flow__fracture" aria-hidden="true" />
              ) : null}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function LogoSlot({ src, alt, className, fallback }) {
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  if (hasError) {
    return (
      <div className={className} aria-hidden="true">
        {fallback}
      </div>
    )
  }

  return (
    <div className={`${className} ${isLoaded ? 'logo-slot--loaded' : ''}`}>
      <img
        src={src}
        alt={alt}
        className="logo-image"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  )
}

function useSwipeNavigation({ onSwipeLeft, onSwipeRight }) {
  const gestureStateRef = useRef({
    x: 0,
    y: 0,
    active: false,
    pointerId: null,
  })

  function isInteractiveTarget(target) {
    if (!(target instanceof Element)) {
      return false
    }

    return Boolean(
      target.closest(
        'button, a, input, textarea, select, label, summary, [role="dialog"], [data-no-swipe="true"]',
      ),
    )
  }

  function resetGesture() {
    gestureStateRef.current = {
      x: 0,
      y: 0,
      active: false,
      pointerId: null,
    }
  }

  function startGesture(x, y, pointerId = null) {
    gestureStateRef.current = {
      x,
      y,
      active: true,
      pointerId,
    }
  }

  function endGesture(x, y) {
    if (!gestureStateRef.current.active) {
      return
    }

    const deltaX = x - gestureStateRef.current.x
    const deltaY = y - gestureStateRef.current.y

    resetGesture()

    if (Math.abs(deltaX) < 56 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return
    }

    if (deltaX < 0) {
      onSwipeLeft?.()
    } else {
      onSwipeRight?.()
    }
  }

  return {
    onPointerDown: (event) => {
      if (isInteractiveTarget(event.target)) {
        return
      }

      startGesture(event.clientX, event.clientY, event.pointerId)

      if (typeof event.currentTarget.setPointerCapture === 'function') {
        event.currentTarget.setPointerCapture(event.pointerId)
      }
    },
    onPointerUp: (event) => {
      if (
        !gestureStateRef.current.active ||
        gestureStateRef.current.pointerId !== event.pointerId
      ) {
        return
      }

      if (typeof event.currentTarget.releasePointerCapture === 'function') {
        try {
          event.currentTarget.releasePointerCapture(event.pointerId)
        } catch {
          // Ignore release failures when capture has already been cleared.
        }
      }

      endGesture(event.clientX, event.clientY)
    },
    onPointerCancel: () => {
      resetGesture()
    },
    onTouchStart: (event) => {
      if (window.PointerEvent) {
        return
      }

      if (isInteractiveTarget(event.target)) {
        return
      }

      const touch = event.touches[0]

      if (!touch) {
        return
      }

      startGesture(touch.clientX, touch.clientY)
    },
    onTouchEnd: (event) => {
      if (window.PointerEvent || !gestureStateRef.current.active) {
        return
      }

      const touch = event.changedTouches[0]

      if (!touch) {
        resetGesture()
        return
      }

      endGesture(touch.clientX, touch.clientY)
    },
    onTouchCancel: () => {
      if (window.PointerEvent) {
        return
      }

      resetGesture()
    },
  }
}

export default App

async function handleSoundAction({
  song,
  audioPoolRef,
  previousSoundIndexRef,
  cooldownRemainingMs,
  cooldownDurationMs,
  setCooldownRemainingMs,
  setSoundActionError,
  cooldownTimeoutRef,
  cooldownTickerRef,
}) {
  if (!song?.soundAction || cooldownRemainingMs > 0) {
    return
  }

  const audioPool = audioPoolRef.current

  if (!audioPool.length) {
    setSoundActionError('천둥 사운드 파일이 아직 준비되지 않았습니다.')
    return
  }

  const nextSoundIndex = pickRandomSoundIndex(
    audioPool.length,
    previousSoundIndexRef.current,
  )
  const nextAudio = audioPool[nextSoundIndex]

  try {
    setSoundActionError('')
    nextAudio.pause()
    nextAudio.currentTime = 0
    await nextAudio.play()
    previousSoundIndexRef.current = nextSoundIndex
  } catch {
    setSoundActionError('사운드를 재생하지 못했습니다. 무음 모드를 확인해 주세요.')
    return
  }

  if (!cooldownDurationMs) {
    return
  }

  const cooldownEndsAt = Date.now() + cooldownDurationMs
  setCooldownRemainingMs(cooldownDurationMs)

  if (cooldownTimeoutRef.current) {
    window.clearTimeout(cooldownTimeoutRef.current)
  }

  if (cooldownTickerRef.current) {
    window.clearInterval(cooldownTickerRef.current)
  }

  cooldownTickerRef.current = window.setInterval(() => {
    const nextRemaining = Math.max(0, cooldownEndsAt - Date.now())
    setCooldownRemainingMs(nextRemaining)

    if (nextRemaining === 0 && cooldownTickerRef.current) {
      window.clearInterval(cooldownTickerRef.current)
      cooldownTickerRef.current = null
    }
  }, 100)

  cooldownTimeoutRef.current = window.setTimeout(() => {
    setCooldownRemainingMs(0)

    if (cooldownTickerRef.current) {
      window.clearInterval(cooldownTickerRef.current)
      cooldownTickerRef.current = null
    }

    cooldownTimeoutRef.current = null
  }, cooldownDurationMs)
}

function getSoundSources(soundAction) {
  if (!soundAction) {
    return []
  }

  if (Array.isArray(soundAction.soundFiles) && soundAction.soundFiles.length > 0) {
    return soundAction.soundFiles
  }

  if (soundAction.soundFile) {
    return [soundAction.soundFile]
  }

  return []
}

function pickRandomSoundIndex(totalCount, previousIndex) {
  if (totalCount <= 1) {
    return 0
  }

  let nextIndex = Math.floor(Math.random() * totalCount)

  while (nextIndex === previousIndex) {
    nextIndex = Math.floor(Math.random() * totalCount)
  }

  return nextIndex
}

async function handleReaction(
  songId,
  reactionType,
  clientId,
  setFloatingReactions,
  burstStrength,
) {
  spawnReactionBurst(setFloatingReactions, reactionType, 'self', burstStrength)

  if (!supabaseEnabled) {
    return
  }

  const { error } = await supabase.from('song_reactions').insert({
    song_id: songId,
    reaction_type: reactionType,
    client_id: clientId,
  })

  if (error) {
    console.error('Failed to send reaction', error)
  }
}

async function handleSurveySubmit({
  event,
  answers,
  clientId,
  setSurveyStatus,
  setSurveyMessage,
}) {
  event.preventDefault()

  const missingRequiredRating = surveyQuestions.some(
    (question) => answers.ratings[question.id] === '',
  )

  if (missingRequiredRating || !answers.mostImpressive) {
    setSurveyStatus('error')
    setSurveyMessage(
      '필수 문항을 모두 선택해 주세요. / Please answer all required questions.',
    )
    return
  }

  const featureRatings = Object.fromEntries(
    featureSurveyQuestions.map((question) => [
      question.id,
      answers.featureRatings[question.id] === ''
        ? null
        : Number(answers.featureRatings[question.id]),
    ]),
  )

  const payload = {
    client_id: clientId,
    ratings: Object.fromEntries(
      surveyQuestions.map((question) => [
        question.id,
        Number(answers.ratings[question.id]),
      ]),
    ),
    feature_ratings: featureRatings,
    most_impressive: answers.mostImpressive,
    memorable_moment: answers.memorableMoment.trim() || null,
    improvement: answers.improvement.trim() || null,
  }

  if (!supabaseEnabled) {
    setSurveyStatus('error')
    setSurveyMessage(
      'Supabase 연결 전이라 응답을 저장하지 못했습니다. / Supabase is not connected, so the response was not saved.',
    )
    return
  }

  setSurveyStatus('submitting')
  setSurveyMessage('')

  const { error } = await supabase.from('audience_surveys').insert(payload)

  if (error) {
    console.error('Failed to submit survey', error)
    setSurveyStatus('error')
    setSurveyMessage(
      '제출에 실패했습니다. 잠시 후 다시 시도해 주세요. / Submission failed. Please try again.',
    )
    return
  }

  setSurveyStatus('submitted')
  setSurveyMessage(
    '응답이 저장되었습니다. 참여해 주셔서 감사합니다. / Your response has been saved. Thank you.',
  )
}

function spawnReactionBurst(setFloatingReactions, reactionType, variant, burstStrength = 1) {
  const reactionMeta = reactionTypes.find((reaction) => reaction.id === reactionType)

  if (!reactionMeta) {
    return
  }

  const burstCount = 4 + burstStrength * 2
  const baseLeft = 16 + Math.random() * 60
  const reactions = Array.from({ length: burstCount }, (_, index) => {
    const delay = Math.round(Math.random() * 180) + index * 18
    const duration = 1800 + Math.round(Math.random() * 900)

    return {
      id: `${variant}-${window.crypto.randomUUID()}`,
      left: Math.max(6, Math.min(88, baseLeft + (-10 + Math.random() * 20))),
      size: 18 + Math.round(Math.random() * (20 + burstStrength * 3)),
      delay,
      duration,
      variant,
      reactionType,
      symbol: reactionMeta.symbol,
      drift: -28 + Math.random() * 56,
    }
  })

  setFloatingReactions((current) => [...current, ...reactions])

  reactions.forEach((reaction) => {
    window.setTimeout(() => {
      setFloatingReactions((current) =>
        current.filter((item) => item.id !== reaction.id),
      )
    }, reaction.duration + reaction.delay + 120)
  })
}

function getBurstStrengthFromCounts(counts) {
  const total = reactionTypes.reduce(
    (sum, reaction) => sum + (counts?.[reaction.id] ?? 0),
    0,
  )

  if (total >= 80) {
    return 4
  }

  if (total >= 40) {
    return 3
  }

  if (total >= 15) {
    return 2
  }

  return 1
}
