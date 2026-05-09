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
  const [activePanel, setActivePanel] = useState({
    songKey: null,
    type: null,
  })

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
        </section>

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

function useSwipeNavigation({ onSwipeLeft, onSwipeRight }) {
  const touchStartRef = useRef({ x: 0, y: 0 })

  return {
    onTouchStart: (event) => {
      const touch = event.changedTouches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    },
    onTouchEnd: (event) => {
      const touch = event.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y

      if (Math.abs(deltaX) < 56 || Math.abs(deltaX) < Math.abs(deltaY)) {
        return
      }

      if (deltaX < 0) {
        onSwipeLeft?.()
      } else {
        onSwipeRight?.()
      }
    },
  }
}

export default App
