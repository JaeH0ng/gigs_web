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
import { interactionZoneLabels, performanceSongs } from './data/songs'
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
    >
      <section
        className="intro-screen intro-screen--minimal"
        {...swipeHandlers}
      >
        <p className="eyebrow">Landing</p>
        <div className="placeholder-panel">
          <LogoSlot
            src={landingLogoSrc}
            alt="공연 로고"
            className="landing-logo-slot"
            fallback="Logo"
          />
          <p className="placeholder-note">랜딩 페이지</p>
          <h1 className="intro-title">추후 디자인 적용 예정</h1>
        </div>
        <p className="swipe-hint">왼쪽으로 스와이프</p>
      </section>
    </MobileFrame>
  )
}

function EndingPage() {
  const navigate = useNavigate()
  const lastSong = performanceSongs[performanceSongs.length - 1]
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
    >
      <section
        className="intro-screen intro-screen--minimal"
        {...swipeHandlers}
      >
        <p className="eyebrow">End</p>
        <div className="placeholder-panel placeholder-panel--ending">
          <p className="placeholder-note">마지막 페이지</p>
          <h1 className="intro-title">공연이 종료되었습니다</h1>
        </div>
        <p className="swipe-hint">오른쪽으로 스와이프</p>
      </section>
    </MobileFrame>
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
  const [channelStatus, setChannelStatus] = useState('idle')
  const [reactionError, setReactionError] = useState('')
  const [soundActionError, setSoundActionError] = useState('')
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(0)
  const clientIdRef = useRef(window.crypto.randomUUID())
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
  const activeZones = Object.entries(song?.interactionZones ?? {}).filter(([, isEnabled]) => isEnabled)
  const direction = location.state?.direction === 'backward' ? 'backward' : 'forward'
  const hasMapImage = typeof song?.mapImage === 'string' && song.mapImage.trim().length > 0
  const swipeHandlers = useSwipeNavigation({
    onSwipeLeft: () => {
      if (nextSong) {
        navigate(`/song/${nextSong.order}`, { state: { direction: 'forward' } })
      } else {
        navigate('/ending', { state: { direction: 'forward' } })
      }
    },
    onSwipeRight: () => {
      if (previousSong) {
        navigate(`/song/${previousSong.order}`, { state: { direction: 'backward' } })
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
  const realtimeStatus = !supabaseEnabled
    ? 'disabled'
    : channelStatus === 'connected'
      ? 'connected'
      : channelStatus === 'error'
        ? 'error'
        : 'connecting'

  return (
    <MobileFrame
      themeColor={song.themeColor}
      textColor={song.textColor}
      accentColor={song.accentColor}
      backgroundImage={song.backgroundImage}
    >
      <article
        key={song.id}
        className={`song-screen song-screen--${direction}`}
        {...swipeHandlers}
      >
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
            <p className="eyebrow">Interaction</p>
            <h2>이 곡의 인터렉션</h2>
          </div>
          <div className="zone-tags">
            {activeZones.length > 0 ? (
              activeZones.map(([zoneKey]) => (
                <span key={zoneKey} className="zone-tag">
                  {interactionZoneLabels[zoneKey]}
                </span>
              ))
            ) : (
              <span className="zone-tag zone-tag--muted">현재 확정된 인터렉션 없음</span>
            )}
          </div>
          <ul className="bullet-list">
            {song.interactionInstructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ul>
          <div className="reaction-meta">
            <span className={`realtime-badge realtime-badge--${realtimeStatus}`}>
              {realtimeStatus === 'connected'
                ? '실시간 연결됨'
                : realtimeStatus === 'disabled'
                  ? 'Supabase 연결 전'
                  : realtimeStatus === 'error'
                    ? '실시간 연결 오류'
                    : '실시간 연결 중'}
            </span>
            <span className="reaction-count">
              {supabaseEnabled ? `총 반응 ${totalReactionCount}` : '로컬 미리보기'}
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

        <p className="swipe-hint">오른쪽으로 이전, 왼쪽으로 다음</p>

        <div className="panel-dock">
          <button
            type="button"
            className="dock-button"
            onClick={() => setActivePanel({ songKey: song.id, type: 'lyrics' })}
          >
            가사 보기
          </button>
          <button
            type="button"
            className="dock-button"
            onClick={() => setActivePanel({ songKey: song.id, type: 'story' })}
          >
            곡 이야기
          </button>
        </div>

        {soundAction ? (
          <p className="sound-action-note">
            {soundActionError || soundAction.helperText}
          </p>
        ) : null}

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

function MobileFrame({ themeColor, textColor, accentColor, backgroundImage, children }) {
  return (
    <main
      className="app-shell"
      style={{
        '--theme-color': themeColor,
        '--text-color': textColor,
        '--accent-color': accentColor,
        '--theme-image': backgroundImage ? `url("${backgroundImage}")` : 'none',
      }}
    >
      <div className="ambient ambient--left" />
      <div className="ambient ambient--right" />
      <div className="mobile-frame">{children}</div>
    </main>
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
