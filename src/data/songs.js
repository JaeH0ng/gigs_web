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
