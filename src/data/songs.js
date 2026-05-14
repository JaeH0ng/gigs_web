export const interactionZoneLabels = {
  tentFacade: '천장 천',
  audienceFloor: '관객',
  object1: '손 마네킹 1',
  object2: '손 마네킹 2',
  object3: '물체 3',
  object4: '물체 4',
}

const emptyInteractionZones = {
  tentFacade: false,
  audienceFloor: false,
  object1: false,
  object2: false,
  object3: false,
  object4: false,
}

const songModules = import.meta.glob('./songs/*.json', {
  eager: true,
  import: 'default',
})

const assetVersion = __APP_VERSION__

const dayFlowByOrder = {
  1: {
    skyPhase: 'dusk',
    timelineColor: '#c87a3d',
    timelineAccent: '#ffd36c',
  },
  2: {
    skyPhase: 'pastel-sunset',
    timelineColor: '#d99cc8',
    timelineAccent: '#ffe38f',
    timelineIcon: 'glow-sunset',
  },
  3: {
    skyPhase: 'dark-sea',
    timelineColor: '#264872',
    timelineAccent: '#89c8ff',
    timelineIcon: 'crescent',
  },
  4: {
    skyPhase: 'storm-rain',
    timelineColor: '#1f2a36',
    timelineAccent: '#f1c84b',
    timelineIcon: 'storm',
  },
  5: {
    skyPhase: 'pre-midnight',
    timelineColor: '#32283e',
    timelineAccent: '#e8c36a',
    timelineIcon: 'cloud',
  },
  6: {
    skyPhase: 'dream-storm',
    timelineColor: '#163b69',
    timelineAccent: '#8ed9ff',
  },
  7: {
    skyPhase: 'resolved-midnight',
    timelineColor: '#263d65',
    timelineAccent: '#e7c76a',
  },
  8: {
    skyPhase: 'crisis-one-am',
    timelineColor: '#4a1726',
    timelineAccent: '#ff8a5f',
    timelineBreak: true,
  },
  9: {
    skyPhase: 'thaw-one-thirty',
    timelineColor: '#1f4050',
    timelineAccent: '#5fb9d4',
  },
  10: {
    skyPhase: 'insomnia-room',
    timelineColor: '#28304d',
    timelineAccent: '#d7b35d',
    timelineIcon: 'sunrise',
  },
  11: {
    skyPhase: 'after-sunrise',
    timelineColor: '#8ca76d',
    timelineAccent: '#ffe08a',
  },
  12: {
    skyPhase: 'daylight',
    timelineColor: '#72b6d2',
    timelineAccent: '#ff725f',
    timelineIcon: 'sun',
  },
}

function withBaseUrl(path) {
  if (!path || !path.startsWith('/')) {
    return path
  }

  const basePath = `${import.meta.env.BASE_URL}${path.slice(1)}`
  const separator = basePath.includes('?') ? '&' : '?'

  return `${basePath}${separator}v=${assetVersion}`
}

function normalizeSong(song) {
  const normalizedSong = {
    id: '',
    order: 1,
    isActive: true,
    title: '제목 입력',
    subtitle: '짧은 곡 소개를 입력하세요.',
    themeColor: '#1d2328',
    textColor: '#f6efe5',
    accentColor: '#f3d449',
    interactionSummary: '이 곡에서 관객이 어떤 방식으로 참여하는지 짧게 요약합니다.',
    interactionInstructions: [
      '노란색으로 강조된 위치를 먼저 확인해 주세요.',
      '오브젝트를 만지거나 해당 구역을 바라보면 곡의 일부가 달라질 수 있습니다.',
    ],
    interactionZones: {
      ...emptyInteractionZones,
      ...(song.interactionZones ?? {}),
    },
    backgroundImage: '',
    skyPhase: dayFlowByOrder[song.order]?.skyPhase ?? 'dusk',
    timelineColor: dayFlowByOrder[song.order]?.timelineColor ?? '#f3d449',
    timelineAccent: dayFlowByOrder[song.order]?.timelineAccent ?? '#f3d449',
    timelineIcon: dayFlowByOrder[song.order]?.timelineIcon ?? '',
    timelineBreak: dayFlowByOrder[song.order]?.timelineBreak ?? false,
    mapImage: '/assets/maps/song-01-map.svg',
    soundAction: null,
    lyrics: '여기에 가사를 입력하세요.',
    behindStory: '여기에 비하인드 스토리를 입력하세요.',
    ...song,
  }

  const normalizedSoundAction = normalizedSong.soundAction
    ? {
        cooldownSeconds: 10,
        icon: '⚡',
        label: '특수 사운드',
        helperText: '',
        ...normalizedSong.soundAction,
        soundFile: withBaseUrl(normalizedSong.soundAction.soundFile),
        soundFiles: Array.isArray(normalizedSong.soundAction.soundFiles)
          ? normalizedSong.soundAction.soundFiles.map(withBaseUrl)
          : [],
      }
    : null

  return {
    ...normalizedSong,
    mapImage: withBaseUrl(normalizedSong.mapImage),
    backgroundImage: withBaseUrl(normalizedSong.backgroundImage),
    soundAction: normalizedSoundAction,
  }
}

export const songs = Object.values(songModules)
  .map(normalizeSong)
  .sort((left, right) => left.order - right.order)

export const performanceSongs = songs.filter((song) => song.isActive)
