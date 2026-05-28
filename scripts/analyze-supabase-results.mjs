import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const sourceDir = path.join(rootDir, 'src', 'supabase_result')
const songsDir = path.join(rootDir, 'src', 'data', 'songs')
const outputDir = path.join(sourceDir, 'analysis')
const chartsDir = path.join(outputDir, 'charts')

const ratingLabels = {
  space_fit: '공간 적합도',
  artistic_fit: '예술적 적합도',
  flow_immersion: '흐름/몰입도',
  revisit_intent: '재관람 의향',
  active_participation: '능동적 참여도',
  overall_satisfaction: '전반적 만족도',
  floor_seating_comfort: '바닥 착석 편안함',
}

const interactionDimensionLabels = {
  mood_understanding: '분위기 이해',
  interaction_comfort: '상호작용 편안함',
  participation_immersion: '참여 몰입',
}

const interactionChannelLabels = {
  web_page: '웹페이지',
  projection: '프로젝션',
  physical_touch: '물리적 터치',
}

const featureLabels = {
  music: '음악',
  ceiling_projection: '천장 프로젝션',
  hand_mannequin: '손 마네킹',
  thunder_button: '천둥 버튼',
  shared_audience: '관객 공동 참여',
  space: '공간',
}

const reactionTypeLabels = {
  clap: '박수',
  like: '좋아요',
  spark: '반짝임',
  wave: '파도',
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function parseEmbeddedJson(value, fallback) {
  if (value == null || value === '') return fallback
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function csvEscape(value) {
  if (value == null) return ''
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function writeCsv(fileName, rows, columns) {
  const lines = [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(',')),
  ]
  fs.writeFileSync(path.join(outputDir, fileName), `${lines.join('\n')}\n`)
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function median(values) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

function stddev(values) {
  if (values.length <= 1) return 0
  const avg = mean(values)
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

function round(value, digits = 2) {
  return Number(value.toFixed(digits))
}

function distribution(values) {
  return [1, 2, 3, 4, 5].reduce((dist, score) => {
    dist[`score_${score}`] = values.filter((value) => value === score).length
    return dist
  }, {})
}

function summarizeScale(question, label, values) {
  const top2 = values.filter((value) => value >= 4).length
  return {
    question,
    label,
    n: values.length,
    mean: round(mean(values)),
    median: round(median(values)),
    min: values.length ? Math.min(...values) : '',
    max: values.length ? Math.max(...values) : '',
    stddev: round(stddev(values)),
    top2_count: top2,
    top2_pct: values.length ? round((top2 / values.length) * 100, 1) : 0,
    ...distribution(values),
  }
}

function loadSongMeta() {
  const songs = new Map()
  for (const fileName of fs.readdirSync(songsDir)) {
    if (!fileName.endsWith('.json')) continue
    const song = readJson(path.join(songsDir, fileName))
    songs.set(song.id, {
      id: song.id,
      order: song.order,
      title: song.title,
    })
  }
  return songs
}

function pct(count, total) {
  return total ? round((count / total) * 100, 1) : 0
}

function slugify(value) {
  return String(value).replaceAll(/[^a-zA-Z0-9_-]/g, '-').replaceAll(/-+/g, '-').replaceAll(/^-|-$/g, '')
}

function svgBarChart({ title, rows, valueKey = 'value', labelKey = 'label', fileName, width = 960 }) {
  const rowHeight = 34
  const margin = { top: 54, right: 96, bottom: 34, left: 220 }
  const height = margin.top + margin.bottom + rows.length * rowHeight
  const maxValue = Math.max(1, ...rows.map((row) => row[valueKey]))
  const plotWidth = width - margin.left - margin.right
  const colors = ['#2f6f73', '#d99058', '#6b7fb8', '#b65f6b', '#6d8f45', '#8f6bb8']
  const body = rows.map((row, index) => {
    const y = margin.top + index * rowHeight
    const barWidth = (row[valueKey] / maxValue) * plotWidth
    const label = escapeXml(row[labelKey])
    const value = escapeXml(row[valueKey])
    return `
      <text x="${margin.left - 12}" y="${y + 21}" text-anchor="end" class="label">${label}</text>
      <rect x="${margin.left}" y="${y + 6}" width="${barWidth}" height="18" rx="3" fill="${colors[index % colors.length]}" />
      <text x="${margin.left + barWidth + 8}" y="${y + 21}" class="value">${value}</text>`
  }).join('')

  writeSvg(fileName, width, height, `
    <text x="24" y="34" class="title">${escapeXml(title)}</text>
    ${body}
  `)
}

function polarPoint(cx, cy, radius, angle) {
  const radians = (angle - 90) * Math.PI / 180
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  }
}

function piePath(cx, cy, radius, startAngle, endAngle) {
  const start = polarPoint(cx, cy, radius, endAngle)
  const end = polarPoint(cx, cy, radius, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

function svgPieChart({ title, subtitle, rows, fileName, width = 760 }) {
  const filteredRows = rows.filter((row) => row.count > 0)
  const total = filteredRows.reduce((sum, row) => sum + row.count, 0)
  const legendRowHeight = 30
  const height = Math.max(360, 160 + filteredRows.length * legendRowHeight)
  const cx = 190
  const cy = 190
  const radius = 118
  const colors = ['#2f6f73', '#d99058', '#6b7fb8', '#b65f6b', '#6d8f45', '#8f6bb8', '#4c8fa8']
  let currentAngle = 0

  const slices = total === 0
    ? '<circle cx="190" cy="190" r="118" fill="#d9d6cf" />'
    : filteredRows.map((row, index) => {
      const angle = (row.count / total) * 360
      const fill = colors[index % colors.length]
      if (angle >= 359.999) {
        currentAngle += angle
        return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}" />`
      }
      const d = piePath(cx, cy, radius, currentAngle, currentAngle + angle)
      currentAngle += angle
      return `<path d="${d}" fill="${fill}" stroke="#fbfaf7" stroke-width="2" />`
    }).join('')

  const legend = filteredRows.map((row, index) => {
    const y = 126 + index * legendRowHeight
    const percent = pct(row.count, total)
    return `
      <rect x="380" y="${y - 13}" width="14" height="14" rx="2" fill="${colors[index % colors.length]}" />
      <text x="404" y="${y}" class="label">${escapeXml(row.label)}</text>
      <text x="${width - 28}" y="${y}" text-anchor="end" class="value">${row.count}명 (${percent}%)</text>`
  }).join('')

  writeSvg(fileName, width, height, `
    <text x="24" y="34" class="title">${escapeXml(title)}</text>
    <text x="24" y="60" class="value">${escapeXml(subtitle)}</text>
    ${slices}
    <circle cx="${cx}" cy="${cy}" r="55" fill="#fbfaf7" />
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="title">${total}</text>
    <text x="${cx}" y="${cy + 21}" text-anchor="middle" class="value">응답</text>
    ${legend}
  `)
}

function svgStackedSongChart(rows, reactionTypes) {
  const width = 1120
  const rowHeight = 34
  const margin = { top: 64, right: 150, bottom: 40, left: 220 }
  const height = margin.top + margin.bottom + rows.length * rowHeight
  const maxTotal = Math.max(1, ...rows.map((row) => row.total))
  const plotWidth = width - margin.left - margin.right
  const colors = {
    clap: '#2f6f73',
    like: '#d99058',
    spark: '#6b7fb8',
    wave: '#b65f6b',
  }
  const body = rows.map((row, index) => {
    const y = margin.top + index * rowHeight
    let x = margin.left
    const pieces = reactionTypes.map((type) => {
      const value = row[type] ?? 0
      const segmentWidth = (value / maxTotal) * plotWidth
      const segment = `<rect x="${x}" y="${y + 6}" width="${segmentWidth}" height="18" fill="${colors[type]}" />`
      x += segmentWidth
      return segment
    }).join('')
    return `
      <text x="${margin.left - 12}" y="${y + 21}" text-anchor="end" class="label">${escapeXml(row.title)}</text>
      ${pieces}
      <text x="${margin.left + (row.total / maxTotal) * plotWidth + 8}" y="${y + 21}" class="value">${row.total}</text>`
  }).join('')
  const legend = reactionTypes.map((type, index) => {
    const x = width - margin.right + 10
    const y = margin.top + index * 24
    return `<rect x="${x}" y="${y}" width="12" height="12" fill="${colors[type]}" /><text x="${x + 18}" y="${y + 11}" class="legend">${escapeXml(reactionTypeLabels[type] ?? type)}</text>`
  }).join('')

  writeSvg('song_reactions_stacked.svg', width, height, `
    <text x="24" y="36" class="title">곡별 리액션 수</text>
    ${body}
    ${legend}
  `)
}

function svgHeatmap(rows) {
  const width = 820
  const cellWidth = 160
  const cellHeight = 58
  const margin = { top: 70, right: 40, bottom: 48, left: 180 }
  const dimensions = [...new Set(rows.map((row) => row.dimension))]
  const channels = [...new Set(rows.map((row) => row.channel))]
  const height = margin.top + margin.bottom + dimensions.length * cellHeight
  const valuesByKey = new Map(rows.map((row) => [`${row.dimension}:${row.channel}`, row.mean]))
  const cells = []

  channels.forEach((channel, columnIndex) => {
    cells.push(`<text x="${margin.left + columnIndex * cellWidth + cellWidth / 2}" y="52" text-anchor="middle" class="label">${escapeXml(rowLabel(channel, interactionChannelLabels))}</text>`)
  })
  dimensions.forEach((dimension, rowIndex) => {
    const y = margin.top + rowIndex * cellHeight
    cells.push(`<text x="${margin.left - 14}" y="${y + 35}" text-anchor="end" class="label">${escapeXml(rowLabel(dimension, interactionDimensionLabels))}</text>`)
    channels.forEach((channel, columnIndex) => {
      const x = margin.left + columnIndex * cellWidth
      const value = valuesByKey.get(`${dimension}:${channel}`) ?? 0
      cells.push(`
        <rect x="${x}" y="${y}" width="${cellWidth - 8}" height="${cellHeight - 8}" rx="4" fill="${heatColor(value)}" />
        <text x="${x + (cellWidth - 8) / 2}" y="${y + 32}" text-anchor="middle" class="heat-value">${value.toFixed(2)}</text>`)
    })
  })

  writeSvg('interaction_ratings_heatmap.svg', width, height, `
    <text x="24" y="36" class="title">상호작용 평가 평균</text>
    ${cells.join('')}
  `)
}

function heatColor(value) {
  const t = Math.max(0, Math.min(1, (value - 2) / 3))
  const start = [230, 126, 86]
  const end = [47, 111, 115]
  const rgb = start.map((channel, index) => Math.round(channel + (end[index] - channel) * t))
  return `rgb(${rgb.join(',')})`
}

function writeSvg(fileName, width, height, content) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    .bg { fill: #fbfaf7; }
    .title { font: 700 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #1f2528; }
    .label { font: 500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #293236; }
    .value, .legend { font: 500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #293236; }
    .heat-value { font: 700 16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #fffdf8; }
  </style>
  <rect class="bg" width="100%" height="100%" />
  ${content}
</svg>
`
  fs.writeFileSync(path.join(chartsDir, fileName), svg)
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function rowLabel(key, labels) {
  return labels[key] ?? key
}

function markdownTable(rows, columns) {
  const header = `| ${columns.map(([label]) => label).join(' | ')} |`
  const divider = `| ${columns.map(() => '---').join(' | ')} |`
  const body = rows.map((row) => `| ${columns.map(([, key]) => row[key]).join(' | ')} |`)
  return [header, divider, ...body].join('\n')
}

function scalePieRows(summary) {
  return [1, 2, 3, 4, 5].map((score) => ({
    label: `${score}점`,
    count: summary[`score_${score}`],
  }))
}

function questionSummaryLine(summary) {
  return `응답 ${summary.n}명, 평균 ${summary.mean}, 중앙값 ${summary.median}, 4-5점 ${summary.top2_pct}%`
}

function scaleQuestionBlocks(summaries, prefix) {
  return summaries.map((summary) => {
    const fileName = `${prefix}_${slugify(summary.question)}.svg`
    return `### ${summary.label}

${questionSummaryLine(summary)}

![${summary.label} 점수분포](charts/${fileName})
`
  }).join('\n')
}

function textResponsesBlock(rows, key, label) {
  const responses = rows
    .map((row) => row[key])
    .filter((value) => typeof value === 'string' && value.trim())
    .map((value) => value.trim())

  if (!responses.length) {
    return `### ${label}

응답 없음
`
  }

  return `### ${label}

${responses.map((response, index) => `${index + 1}. ${response.replaceAll('\n', '<br>')}`).join('\n\n')}
`
}

ensureDir(outputDir)
ensureDir(chartsDir)

const surveyRows = readJson(path.join(sourceDir, 'audience_surveys_rows.json'))
const reactionRows = readJson(path.join(sourceDir, 'song_reactions_rows.json'))
const songMeta = loadSongMeta()
const parsedSurveys = surveyRows.map((row) => ({
  ...row,
  ratings: parseEmbeddedJson(row.ratings, {}),
  interaction_ratings: parseEmbeddedJson(row.interaction_ratings, {}),
  most_impressive: parseEmbeddedJson(row.most_impressive, []),
}))

const ratingQuestions = Object.keys(ratingLabels)
const surveyRatingSummary = ratingQuestions.map((question) => (
  summarizeScale(question, ratingLabels[question], parsedSurveys.map((row) => row.ratings[question]).filter(Number.isFinite))
))

const interactionSummary = []
for (const dimension of Object.keys(interactionDimensionLabels)) {
  for (const channel of Object.keys(interactionChannelLabels)) {
    const values = parsedSurveys
      .map((row) => row.interaction_ratings?.[dimension]?.[channel])
      .filter(Number.isFinite)
    interactionSummary.push({
      dimension,
      dimension_label: interactionDimensionLabels[dimension],
      channel,
      channel_label: interactionChannelLabels[channel],
      ...summarizeScale(`${dimension}.${channel}`, `${interactionDimensionLabels[dimension]} - ${interactionChannelLabels[channel]}`, values),
    })
  }
}

const featureCounts = new Map()
for (const row of parsedSurveys) {
  for (const feature of row.most_impressive) {
    featureCounts.set(feature, (featureCounts.get(feature) ?? 0) + 1)
  }
}
const featureSummary = [...featureCounts.entries()]
  .map(([feature, count]) => ({
    feature,
    label: featureLabels[feature] ?? feature,
    count,
    pct_of_respondents: pct(count, parsedSurveys.length),
  }))
  .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))

const openTextSummary = [
  ['memorable_moment', '기억에 남는 순간'],
  ['improvement', '개선점'],
].map(([question, label]) => {
  const responses = parsedSurveys.map((row) => row[question]).filter((value) => typeof value === 'string' && value.trim())
  const lengths = responses.map((value) => [...value.trim()].length)
  return {
    question,
    label,
    n_responses: responses.length,
    response_rate_pct: pct(responses.length, parsedSurveys.length),
    avg_chars: round(mean(lengths), 1),
    min_chars: lengths.length ? Math.min(...lengths) : 0,
    max_chars: lengths.length ? Math.max(...lengths) : 0,
  }
})

const reactionTypes = [...new Set(reactionRows.map((row) => row.reaction_type))].sort()
const songIds = [...new Set([...songMeta.keys(), ...reactionRows.map((row) => row.song_id)])]
  .sort((a, b) => (songMeta.get(a)?.order ?? 999) - (songMeta.get(b)?.order ?? 999))

const reactionsBySong = songIds.map((songId) => {
  const rows = reactionRows.filter((row) => row.song_id === songId)
  const result = {
    song_id: songId,
    order: songMeta.get(songId)?.order ?? '',
    title: songMeta.get(songId)?.title ?? songId,
    total: rows.length,
    unique_clients: new Set(rows.map((row) => row.client_id)).size,
    reactions_per_client: rows.length ? round(rows.length / new Set(rows.map((row) => row.client_id)).size, 2) : 0,
  }
  for (const type of reactionTypes) {
    result[type] = rows.filter((row) => row.reaction_type === type).length
  }
  return result
})

const reactionsByType = reactionTypes.map((type) => {
  const rows = reactionRows.filter((row) => row.reaction_type === type)
  return {
    reaction_type: type,
    label: reactionTypeLabels[type] ?? type,
    total: rows.length,
    unique_clients: new Set(rows.map((row) => row.client_id)).size,
    pct_of_reactions: pct(rows.length, reactionRows.length),
  }
}).sort((a, b) => b.total - a.total)

const reactionsBySongType = []
for (const song of reactionsBySong) {
  for (const type of reactionTypes) {
    reactionsBySongType.push({
      song_id: song.song_id,
      title: song.title,
      reaction_type: type,
      reaction_label: reactionTypeLabels[type] ?? type,
      count: song[type],
      pct_in_song: pct(song[type], song.total),
    })
  }
}

writeCsv('survey_ratings_summary.csv', surveyRatingSummary, [
  'question', 'label', 'n', 'mean', 'median', 'min', 'max', 'stddev', 'top2_count', 'top2_pct',
  'score_1', 'score_2', 'score_3', 'score_4', 'score_5',
])
writeCsv('interaction_ratings_summary.csv', interactionSummary, [
  'dimension', 'dimension_label', 'channel', 'channel_label', 'n', 'mean', 'median', 'min', 'max', 'stddev', 'top2_count', 'top2_pct',
  'score_1', 'score_2', 'score_3', 'score_4', 'score_5',
])
writeCsv('most_impressive_counts.csv', featureSummary, ['feature', 'label', 'count', 'pct_of_respondents'])
writeCsv('open_text_summary.csv', openTextSummary, ['question', 'label', 'n_responses', 'response_rate_pct', 'avg_chars', 'min_chars', 'max_chars'])
writeCsv('song_reactions_by_song.csv', reactionsBySong, ['song_id', 'order', 'title', 'total', 'unique_clients', 'reactions_per_client', ...reactionTypes])
writeCsv('song_reactions_by_type.csv', reactionsByType, ['reaction_type', 'label', 'total', 'unique_clients', 'pct_of_reactions'])
writeCsv('song_reactions_by_song_type.csv', reactionsBySongType, ['song_id', 'title', 'reaction_type', 'reaction_label', 'count', 'pct_in_song'])

svgBarChart({
  title: '설문 척도 문항 평균',
  rows: surveyRatingSummary.map((row) => ({ label: row.label, value: row.mean })),
  fileName: 'survey_ratings_average.svg',
})
svgHeatmap(interactionSummary)
svgBarChart({
  title: '인상 깊었던 요소 선택 수',
  rows: featureSummary.map((row) => ({ label: row.label, value: row.count })),
  fileName: 'most_impressive_counts.svg',
  width: 820,
})
svgStackedSongChart(reactionsBySong, reactionTypes)
svgBarChart({
  title: '리액션 타입별 총량',
  rows: reactionsByType.map((row) => ({ label: row.label, value: row.total })),
  fileName: 'reaction_type_counts.svg',
  width: 720,
})
for (const summary of surveyRatingSummary) {
  svgPieChart({
    title: summary.label,
    subtitle: questionSummaryLine(summary),
    rows: scalePieRows(summary),
    fileName: `survey_${slugify(summary.question)}.svg`,
  })
}
for (const summary of interactionSummary) {
  svgPieChart({
    title: summary.label,
    subtitle: questionSummaryLine(summary),
    rows: scalePieRows(summary),
    fileName: `interaction_${slugify(summary.question)}.svg`,
  })
}
svgPieChart({
  title: '인상 깊었던 요소',
  subtitle: `복수 선택 응답 ${parsedSurveys.length}명, 총 선택 ${featureSummary.reduce((sum, row) => sum + row.count, 0)}건`,
  rows: featureSummary.map((row) => ({ label: row.label, count: row.count })),
  fileName: 'most_impressive_pie.svg',
})
svgPieChart({
  title: '리액션 타입',
  subtitle: `전체 리액션 ${reactionRows.length}건`,
  rows: reactionsByType.map((row) => ({ label: row.label, count: row.total })),
  fileName: 'reaction_type_pie.svg',
})

const topSurvey = [...surveyRatingSummary].sort((a, b) => b.mean - a.mean)
const topSongs = [...reactionsBySong].sort((a, b) => b.total - a.total).slice(0, 5)
const report = `# 공연 이후 관객 리액션 및 설문 결과 분석

생성일: ${new Date().toISOString().slice(0, 10)}

## 데이터 개요

- 설문 응답: ${parsedSurveys.length}명
- 리액션 이벤트: ${reactionRows.length}건
- 리액션 참여 클라이언트: ${new Set(reactionRows.map((row) => row.client_id)).size}명
- 리액션 곡 수: ${new Set(reactionRows.map((row) => row.song_id)).size}곡

## 설문 응답 요약

각 척도형 문항은 점수 분포를 파이차트로 표시했습니다. 서술형 문항은 수치화 요약 뒤에 원문 응답을 그대로 표시했습니다.

가장 높은 평균은 ${topSurvey[0].label}(${topSurvey[0].mean})이고, 가장 낮은 평균은 ${topSurvey.at(-1).label}(${topSurvey.at(-1).mean})입니다.

${scaleQuestionBlocks(surveyRatingSummary, 'survey')}

![설문 척도 문항 평균](charts/survey_ratings_average.svg)

## 상호작용 평가

${scaleQuestionBlocks(interactionSummary, 'interaction')}

![상호작용 평가 평균](charts/interaction_ratings_heatmap.svg)

## 인상 깊었던 요소

복수 선택 문항이라 각 선택지 비율의 합이 100%가 아닐 수 있습니다.

${markdownTable(featureSummary, [
  ['요소', 'label'],
  ['선택 수', 'count'],
  ['응답자 대비 %', 'pct_of_respondents'],
])}

![인상 깊었던 요소 선택 비중](charts/most_impressive_pie.svg)

![인상 깊었던 요소 선택 수](charts/most_impressive_counts.svg)

## 서술형 응답

${markdownTable(openTextSummary, [
  ['문항', 'label'],
  ['응답 수', 'n_responses'],
  ['응답률 %', 'response_rate_pct'],
  ['평균 글자 수', 'avg_chars'],
  ['최소', 'min_chars'],
  ['최대', 'max_chars'],
])}

${textResponsesBlock(parsedSurveys, 'memorable_moment', '기억에 남는 순간')}

${textResponsesBlock(parsedSurveys, 'improvement', '개선점')}

## 곡별 리액션

${markdownTable(reactionsBySong, [
  ['순서', 'order'],
  ['곡', 'title'],
  ['총 리액션', 'total'],
  ['참여 클라이언트', 'unique_clients'],
  ['1인당 리액션', 'reactions_per_client'],
  ['박수', 'clap'],
  ['좋아요', 'like'],
  ['반짝임', 'spark'],
  ['파도', 'wave'],
])}

리액션 총량 상위 곡은 ${topSongs.map((row) => `${row.title}(${row.total})`).join(', ')}입니다.

![곡별 리액션 수](charts/song_reactions_stacked.svg)

## 리액션 타입별 집계

${markdownTable(reactionsByType, [
  ['리액션', 'label'],
  ['총량', 'total'],
  ['참여 클라이언트', 'unique_clients'],
  ['전체 대비 %', 'pct_of_reactions'],
])}

![리액션 타입별 비중](charts/reaction_type_pie.svg)

![리액션 타입별 총량](charts/reaction_type_counts.svg)

## 원자료 수치표

### 설문 척도 문항

${markdownTable(surveyRatingSummary, [
  ['문항', 'label'],
  ['N', 'n'],
  ['평균', 'mean'],
  ['중앙값', 'median'],
  ['Top2(4-5)', 'top2_pct'],
  ['1점', 'score_1'],
  ['2점', 'score_2'],
  ['3점', 'score_3'],
  ['4점', 'score_4'],
  ['5점', 'score_5'],
])}

### 상호작용 평가

${markdownTable(interactionSummary, [
  ['차원', 'dimension_label'],
  ['채널', 'channel_label'],
  ['N', 'n'],
  ['평균', 'mean'],
  ['중앙값', 'median'],
  ['Top2(4-5)', 'top2_pct'],
  ['1점', 'score_1'],
  ['2점', 'score_2'],
  ['3점', 'score_3'],
  ['4점', 'score_4'],
  ['5점', 'score_5'],
])}

## 산출 파일

- survey_ratings_summary.csv
- interaction_ratings_summary.csv
- most_impressive_counts.csv
- open_text_summary.csv
- song_reactions_by_song.csv
- song_reactions_by_type.csv
- song_reactions_by_song_type.csv
- charts/*.svg
`

fs.writeFileSync(path.join(outputDir, 'report.md'), report)

console.log(`Wrote analysis to ${path.relative(rootDir, outputDir)}`)
