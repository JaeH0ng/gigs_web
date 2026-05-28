import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const sourceDir = path.join(rootDir, 'src', 'supabase_result')
const songsDir = path.join(rootDir, 'src', 'data', 'songs')
const outputDir = path.join(sourceDir, 'analysis')
const chartsDir = path.join(outputDir, 'charts')

const ratingLabels = {
  overall_satisfaction: '전반적 만족도',
  flow_immersion: '흐름/몰입도',
  space_fit: '공간 적합도',
  floor_seating_comfort: '바닥 착석 편안함',
  active_participation: '능동적 참여도',
  artistic_fit: '예술적 적합도',
  revisit_intent: '재관람 의향',
}

const ratingQuestionTexts = {
  overall_satisfaction: {
    ko: '오늘 공연에 전반적으로 만족했다.',
    en: 'Overall, I was satisfied with today’s performance.',
  },
  flow_immersion: {
    ko: '공연의 흐름이 자연스럽고 몰입하기 좋았다.',
    en: 'The flow of the performance felt natural and immersive.',
  },
  space_fit: {
    ko: '공연 공간의 분위기가 곡과 잘 어울렸다.',
    en: 'The atmosphere of the venue matched the songs well.',
  },
  floor_seating_comfort: {
    ko: '돗자리에 앉아 인터렉션에 참여하는 공연장의 공간 구도가 편안했다.',
    en: 'The floor-seating layout for participating in the interactions felt comfortable.',
  },
  active_participation: {
    ko: '기존의 일반적인 공연보다 더 능동적으로 참여한다고 느꼈다.',
    en: 'Compared with a typical concert, I felt more actively involved.',
  },
  artistic_fit: {
    ko: '인터렉션 요소가 공연의 예술적 완성도를 해치지 않고 자연스럽게 어울렸다.',
    en: 'The interactive elements felt natural and did not weaken the artistic quality.',
  },
  revisit_intent: {
    ko: '다시 비슷한 형식의 공연을 관람하고 싶다.',
    en: 'I would like to attend a similar performance again.',
  },
}

const likertOptions = [
  { value: 1, ko: '전혀 그렇지 않다', en: 'Strongly disagree' },
  { value: 2, ko: '그렇지 않다', en: 'Disagree' },
  { value: 3, ko: '보통이다', en: 'Neutral' },
  { value: 4, ko: '그렇다', en: 'Agree' },
  { value: 5, ko: '매우 그렇다', en: 'Strongly agree' },
]

const likertOptionText = likertOptions
  .map((option) => `${option.value}=${option.ko}(${option.en})`)
  .join(', ')

const interactionQuestionTexts = {
  mood_understanding: {
    ko: '곡의 감정이나 분위기를 이해하는 데 도움이 되었다.',
    en: 'It helped me understand the emotion or mood of the songs.',
  },
  participation_immersion: {
    ko: '공연에 참여하고 몰입하고 있다는 느낌을 주었다.',
    en: 'It made me feel involved and immersed in the performance.',
  },
  interaction_comfort: {
    ko: '참여 방식이 직관적이고 부담스럽지 않았다.',
    en: 'The way of participating felt intuitive and comfortable.',
  },
}

const interactionDimensionLabels = {
  mood_understanding: '분위기 이해',
  participation_immersion: '참여 몰입',
  interaction_comfort: '상호작용 편안함',
}

const interactionChannelLabels = {
  projection: '빔프로젝터',
  web_page: '웹 페이지',
  physical_touch: '실물 터치',
}

const interactionChannelTexts = {
  projection: {
    ko: '빔프로젝터',
    en: 'Projection',
  },
  web_page: {
    ko: '웹 페이지',
    en: 'Web page',
  },
  physical_touch: {
    ko: '실물 터치',
    en: 'Physical touch',
  },
}

const featureLabels = {
  music: '음악',
  space: '공간 연출',
  ceiling_projection: '천장 프로젝션',
  emoji_reactions: '웹 이모지 반응',
  thunder_button: '천둥 버튼',
  hand_mannequin: '손 모양 마네킹 인터렉션',
  shared_audience: '관객 공동 참여',
}

const featureOptionTexts = {
  music: {
    ko: '음악',
    en: 'Music',
  },
  space: {
    ko: '공간 연출',
    en: 'Spatial direction',
  },
  ceiling_projection: {
    ko: '천장 프로젝션',
    en: 'Ceiling projection',
  },
  emoji_reactions: {
    ko: '웹 이모지 반응',
    en: 'Web emoji reactions',
  },
  thunder_button: {
    ko: '천둥 버튼',
    en: 'Thunder button',
  },
  hand_mannequin: {
    ko: '손 모양 마네킹 인터렉션',
    en: 'Hand mannequin interaction',
  },
  shared_audience: {
    ko: '관객들과 함께 참여하는 분위기',
    en: 'The shared audience atmosphere',
  },
}

const textQuestionTexts = {
  memorable_moment: {
    ko: '가장 기억에 남은 순간이나 인터렉션을 적어주세요.',
    en: 'Please write the moment or interaction you remember most.',
  },
  improvement: {
    ko: '개선되었으면 하는 점이 있다면 적어주세요.',
    en: 'Please share anything you think could be improved.',
  },
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

function pearson(xValues, yValues) {
  if (xValues.length !== yValues.length || xValues.length < 2) return null
  const xMean = mean(xValues)
  const yMean = mean(yValues)
  const numerator = xValues.reduce((sum, x, index) => sum + (x - xMean) * (yValues[index] - yMean), 0)
  const xDenominator = Math.sqrt(xValues.reduce((sum, x) => sum + (x - xMean) ** 2, 0))
  const yDenominator = Math.sqrt(yValues.reduce((sum, y) => sum + (y - yMean) ** 2, 0))
  if (xDenominator === 0 || yDenominator === 0) return null
  return numerator / (xDenominator * yDenominator)
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

function svgScatterChart({ title, rows, xKey, yKey, xLabel, yLabel, fileName }) {
  const width = 820
  const height = 460
  const margin = { top: 70, right: 56, bottom: 72, left: 82 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const xValues = rows.map((row) => row[xKey])
  const yValues = rows.map((row) => row[yKey])
  const xMax = Math.max(1, ...xValues)
  const yMin = Math.min(1, ...yValues)
  const yMax = Math.max(5, ...yValues)
  const xScale = (value) => margin.left + (value / xMax) * plotWidth
  const yScale = (value) => margin.top + plotHeight - ((value - yMin) / (yMax - yMin || 1)) * plotHeight
  const points = rows.map((row) => `
    <circle cx="${xScale(row[xKey])}" cy="${yScale(row[yKey])}" r="7" fill="#2f6f73" />
    <text x="${xScale(row[xKey]) + 10}" y="${yScale(row[yKey]) - 8}" class="value">${escapeXml(row.participant)}</text>
  `).join('')
  const xTicks = [0, Math.round(xMax / 2), xMax].map((tick) => `
    <text x="${xScale(tick)}" y="${height - 36}" text-anchor="middle" class="value">${tick}</text>
    <line x1="${xScale(tick)}" x2="${xScale(tick)}" y1="${margin.top}" y2="${margin.top + plotHeight}" stroke="#e1ded7" />
  `).join('')
  const yTicks = [1, 2, 3, 4, 5].map((tick) => `
    <text x="${margin.left - 12}" y="${yScale(tick) + 5}" text-anchor="end" class="value">${tick}</text>
    <line x1="${margin.left}" x2="${margin.left + plotWidth}" y1="${yScale(tick)}" y2="${yScale(tick)}" stroke="#e1ded7" />
  `).join('')

  writeSvg(fileName, width, height, `
    <text x="24" y="36" class="title">${escapeXml(title)}</text>
    ${xTicks}
    ${yTicks}
    <line x1="${margin.left}" x2="${margin.left + plotWidth}" y1="${margin.top + plotHeight}" y2="${margin.top + plotHeight}" stroke="#293236" />
    <line x1="${margin.left}" x2="${margin.left}" y1="${margin.top}" y2="${margin.top + plotHeight}" stroke="#293236" />
    ${points}
    <text x="${margin.left + plotWidth / 2}" y="${height - 10}" text-anchor="middle" class="label">${escapeXml(xLabel)}</text>
    <text x="24" y="${margin.top + plotHeight / 2}" transform="rotate(-90 24 ${margin.top + plotHeight / 2})" text-anchor="middle" class="label">${escapeXml(yLabel)}</text>
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

function scaleAnswerDistribution(summary) {
  return likertOptions
    .map((option) => `${option.value}점 ${summary[`score_${option.value}`]}명`)
    .join(', ')
}

function questionSummaryLine(summary) {
  return `응답 ${summary.n}명, 평균 ${summary.mean}, 중앙값 ${summary.median}, 4-5점 ${summary.top2_pct}%`
}

function scaleQuestionBlocks(summaries, prefix, getQuestionInfo) {
  return summaries.map((summary) => {
    const fileName = `${prefix}_${slugify(summary.question)}.svg`
    const questionInfo = getQuestionInfo(summary)
    return `### ${summary.label}

질문: ${questionInfo.questionKo}  
Question: ${questionInfo.questionEn}  
답변 방식: ${questionInfo.answerType}  
답변 선택지: ${likertOptionText}  
응답 분포: ${scaleAnswerDistribution(summary)}

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

질문: ${textQuestionTexts[key].ko}  
Question: ${textQuestionTexts[key].en}  
답변 방식: 자유 서술형

응답 없음
`
  }

  return `### ${label}

질문: ${textQuestionTexts[key].ko}  
Question: ${textQuestionTexts[key].en}  
답변 방식: 자유 서술형

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
const featureOptionSummary = Object.keys(featureOptionTexts).map((feature) => {
  const count = featureCounts.get(feature) ?? 0
  return {
    feature,
    label: featureOptionTexts[feature].ko,
    answer_en: featureOptionTexts[feature].en,
    count,
    pct_of_respondents: pct(count, parsedSurveys.length),
  }
})

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

const surveyClients = new Set(parsedSurveys.map((row) => row.client_id))
const reactionClients = new Set(reactionRows.map((row) => row.client_id))
const matchedClientIds = [...surveyClients].filter((clientId) => reactionClients.has(clientId))
const reactionOnlyClientIds = [...reactionClients].filter((clientId) => !surveyClients.has(clientId))
const surveyOnlyClientIds = [...surveyClients].filter((clientId) => !reactionClients.has(clientId))
const clientAlias = new Map(parsedSurveys.map((row, index) => [row.client_id, `응답자 ${index + 1}`]))

function topEntry(entries) {
  if (!entries.length) return ['', 0]
  return entries.sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))[0]
}

function averageRatings(row) {
  const ratingValues = ratingQuestions.map((question) => row.ratings[question]).filter(Number.isFinite)
  return round(mean(ratingValues))
}

function averageInteractionRatings(row) {
  const values = []
  for (const dimension of Object.keys(interactionDimensionLabels)) {
    for (const channel of Object.keys(interactionChannelLabels)) {
      const value = row.interaction_ratings?.[dimension]?.[channel]
      if (Number.isFinite(value)) values.push(value)
    }
  }
  return round(mean(values))
}

const joinedClientSummary = parsedSurveys.map((survey, index) => {
  const rows = reactionRows.filter((row) => row.client_id === survey.client_id)
  const songCounts = new Map()
  const typeCounts = new Map()
  for (const row of rows) {
    songCounts.set(row.song_id, (songCounts.get(row.song_id) ?? 0) + 1)
    typeCounts.set(row.reaction_type, (typeCounts.get(row.reaction_type) ?? 0) + 1)
  }
  const [topSongId, topSongCount] = topEntry([...songCounts.entries()])
  const [topReactionType, topReactionCount] = topEntry([...typeCounts.entries()])
  const selectedFeatures = survey.most_impressive.map((feature) => featureOptionTexts[feature]?.ko ?? feature)

  return {
    participant: clientAlias.get(survey.client_id) ?? `응답자 ${index + 1}`,
    has_reaction_log: rows.length > 0 ? 'yes' : 'no',
    reaction_total: rows.length,
    active_song_count: songCounts.size,
    reactions_per_active_song: songCounts.size ? round(rows.length / songCounts.size) : 0,
    top_song: songMeta.get(topSongId)?.title ?? topSongId,
    top_song_reactions: topSongCount,
    dominant_reaction: reactionTypeLabels[topReactionType] ?? topReactionType,
    dominant_reaction_count: topReactionCount,
    avg_rating: averageRatings(survey),
    overall_satisfaction: survey.ratings.overall_satisfaction,
    flow_immersion: survey.ratings.flow_immersion,
    active_participation: survey.ratings.active_participation,
    revisit_intent: survey.ratings.revisit_intent,
    avg_interaction_rating: averageInteractionRatings(survey),
    selected_impressive_count: survey.most_impressive.length,
    selected_impressive: selectedFeatures.join('; '),
  }
})

const reactionOnlySummary = reactionOnlyClientIds.map((clientId, index) => {
  const rows = reactionRows.filter((row) => row.client_id === clientId)
  const songCounts = new Map()
  const typeCounts = new Map()
  for (const row of rows) {
    songCounts.set(row.song_id, (songCounts.get(row.song_id) ?? 0) + 1)
    typeCounts.set(row.reaction_type, (typeCounts.get(row.reaction_type) ?? 0) + 1)
  }
  const [topSongId, topSongCount] = topEntry([...songCounts.entries()])
  const [topReactionType, topReactionCount] = topEntry([...typeCounts.entries()])
  return {
    participant: `리액션만 ${index + 1}`,
    reaction_total: rows.length,
    active_song_count: songCounts.size,
    top_song: songMeta.get(topSongId)?.title ?? topSongId,
    top_song_reactions: topSongCount,
    dominant_reaction: reactionTypeLabels[topReactionType] ?? topReactionType,
    dominant_reaction_count: topReactionCount,
  }
})

const correlationTargets = [
  ['avg_rating', '전체 설문 평균'],
  ['overall_satisfaction', '전반적 만족도'],
  ['flow_immersion', '흐름/몰입도'],
  ['active_participation', '능동적 참여도'],
  ['revisit_intent', '재관람 의향'],
  ['avg_interaction_rating', '상호작용 평가 평균'],
  ['selected_impressive_count', '인상 깊었던 요소 선택 수'],
]
const correlationMetrics = [
  ['reaction_total', '총 리액션 수'],
  ['active_song_count', '리액션한 곡 수'],
]
const engagementCorrelations = []
for (const [metric, metricLabel] of correlationMetrics) {
  for (const [target, targetLabel] of correlationTargets) {
    const xValues = joinedClientSummary.map((row) => row[metric]).filter(Number.isFinite)
    const yValues = joinedClientSummary.map((row) => row[target]).filter(Number.isFinite)
    const r = pearson(xValues, yValues)
    engagementCorrelations.push({
      metric,
      metric_label: metricLabel,
      survey_metric: target,
      survey_metric_label: targetLabel,
      n: Math.min(xValues.length, yValues.length),
      pearson_r: r == null ? '' : round(r, 3),
      note: '표본이 작아 탐색적 지표로만 해석',
    })
  }
}

const questionOverview = [
  ...surveyRatingSummary.map((summary) => ({
    question_id: summary.question,
    label: summary.label,
    question_ko: ratingQuestionTexts[summary.question].ko,
    question_en: ratingQuestionTexts[summary.question].en,
    answer_type: '5점 리커트 척도 단일 선택',
    answer_options: likertOptionText,
  })),
  ...interactionSummary.map((summary) => ({
    question_id: summary.question,
    label: summary.label,
    question_ko: `${interactionQuestionTexts[summary.dimension].ko} - ${interactionChannelTexts[summary.channel].ko}`,
    question_en: `${interactionQuestionTexts[summary.dimension].en} - ${interactionChannelTexts[summary.channel].en}`,
    answer_type: '영역별 5점 리커트 척도 단일 선택',
    answer_options: likertOptionText,
  })),
  {
    question_id: 'most_impressive',
    label: '인상 깊었던 요소',
    question_ko: '이번 공연에서 가장 인상 깊었던 요소는 무엇인가요? 복수 선택이 가능합니다.',
    question_en: 'What were the most memorable elements of this performance? You may select multiple options.',
    answer_type: '복수 선택형 체크박스',
    answer_options: Object.values(featureOptionTexts).map((option) => `${option.ko}(${option.en})`).join(', '),
  },
  ...Object.entries(textQuestionTexts).map(([questionId, text]) => ({
    question_id: questionId,
    label: questionId === 'memorable_moment' ? '기억에 남는 순간' : '개선점',
    question_ko: text.ko,
    question_en: text.en,
    answer_type: '자유 서술형',
    answer_options: '응답자가 직접 작성',
  })),
]

writeCsv('question_overview.csv', questionOverview, ['question_id', 'label', 'question_ko', 'question_en', 'answer_type', 'answer_options'])
writeCsv('survey_ratings_summary.csv', surveyRatingSummary, [
  'question', 'label', 'n', 'mean', 'median', 'min', 'max', 'stddev', 'top2_count', 'top2_pct',
  'score_1', 'score_2', 'score_3', 'score_4', 'score_5',
])
writeCsv('interaction_ratings_summary.csv', interactionSummary, [
  'dimension', 'dimension_label', 'channel', 'channel_label', 'n', 'mean', 'median', 'min', 'max', 'stddev', 'top2_count', 'top2_pct',
  'score_1', 'score_2', 'score_3', 'score_4', 'score_5',
])
writeCsv('most_impressive_counts.csv', featureSummary, ['feature', 'label', 'count', 'pct_of_respondents'])
writeCsv('most_impressive_options_summary.csv', featureOptionSummary, ['feature', 'label', 'answer_en', 'count', 'pct_of_respondents'])
writeCsv('open_text_summary.csv', openTextSummary, ['question', 'label', 'n_responses', 'response_rate_pct', 'avg_chars', 'min_chars', 'max_chars'])
writeCsv('song_reactions_by_song.csv', reactionsBySong, ['song_id', 'order', 'title', 'total', 'unique_clients', 'reactions_per_client', ...reactionTypes])
writeCsv('song_reactions_by_type.csv', reactionsByType, ['reaction_type', 'label', 'total', 'unique_clients', 'pct_of_reactions'])
writeCsv('song_reactions_by_song_type.csv', reactionsBySongType, ['song_id', 'title', 'reaction_type', 'reaction_label', 'count', 'pct_in_song'])
writeCsv('joined_client_summary.csv', joinedClientSummary, [
  'participant', 'has_reaction_log', 'reaction_total', 'active_song_count', 'reactions_per_active_song',
  'top_song', 'top_song_reactions', 'dominant_reaction', 'dominant_reaction_count',
  'avg_rating', 'overall_satisfaction', 'flow_immersion', 'active_participation', 'revisit_intent',
  'avg_interaction_rating', 'selected_impressive_count', 'selected_impressive',
])
writeCsv('reaction_only_clients_summary.csv', reactionOnlySummary, [
  'participant', 'reaction_total', 'active_song_count', 'top_song', 'top_song_reactions',
  'dominant_reaction', 'dominant_reaction_count',
])
writeCsv('engagement_rating_correlations.csv', engagementCorrelations, [
  'metric', 'metric_label', 'survey_metric', 'survey_metric_label', 'n', 'pearson_r', 'note',
])

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
  subtitle: `복수 선택 응답 ${parsedSurveys.length}명, 총 선택 ${featureOptionSummary.reduce((sum, row) => sum + row.count, 0)}건`,
  rows: featureOptionSummary.map((row) => ({ label: row.label, count: row.count })),
  fileName: 'most_impressive_pie.svg',
})
svgPieChart({
  title: '리액션 타입',
  subtitle: `전체 리액션 ${reactionRows.length}건`,
  rows: reactionsByType.map((row) => ({ label: row.label, count: row.total })),
  fileName: 'reaction_type_pie.svg',
})
svgScatterChart({
  title: '응답자별 리액션 수와 전체 설문 평균',
  rows: joinedClientSummary,
  xKey: 'reaction_total',
  yKey: 'avg_rating',
  xLabel: '총 리액션 수',
  yLabel: '전체 설문 평균',
  fileName: 'joined_reactions_vs_avg_rating.svg',
})
svgScatterChart({
  title: '응답자별 리액션한 곡 수와 전반적 만족도',
  rows: joinedClientSummary,
  xKey: 'active_song_count',
  yKey: 'overall_satisfaction',
  xLabel: '리액션한 곡 수',
  yLabel: '전반적 만족도',
  fileName: 'joined_active_songs_vs_satisfaction.svg',
})

const topSurvey = [...surveyRatingSummary].sort((a, b) => b.mean - a.mean)
const topSongs = [...reactionsBySong].sort((a, b) => b.total - a.total).slice(0, 5)
const notableCorrelationRows = [...engagementCorrelations]
  .filter((row) => row.pearson_r !== '')
  .sort((a, b) => Math.abs(b.pearson_r) - Math.abs(a.pearson_r))
  .slice(0, 8)
const lowestSurvey = topSurvey.at(-1)
const topInteraction = [...interactionSummary].sort((a, b) => b.mean - a.mean)[0]
const lowestInteraction = [...interactionSummary].sort((a, b) => a.mean - b.mean)[0]
const topFeature = [...featureOptionSummary].sort((a, b) => b.count - a.count)[0]
const topReactionType = reactionsByType[0]
const mostEngagedClient = [...joinedClientSummary].sort((a, b) => b.reaction_total - a.reaction_total)[0]
const broadestEngagementClient = [...joinedClientSummary].sort((a, b) => b.active_song_count - a.active_song_count)[0]
const noReactionSurveyClients = joinedClientSummary.filter((row) => row.has_reaction_log === 'no')
const strongestCorrelation = notableCorrelationRows[0]
const report = `# 공연 이후 관객 리액션 및 설문 결과 분석

생성일: ${new Date().toISOString().slice(0, 10)}

## 데이터 개요

- 설문 응답: ${parsedSurveys.length}명
- 리액션 이벤트: ${reactionRows.length}건
- 리액션 참여 클라이언트: ${new Set(reactionRows.map((row) => row.client_id)).size}명
- 리액션 곡 수: ${new Set(reactionRows.map((row) => row.song_id)).size}곡
- 설문-리액션 매칭 응답자: ${matchedClientIds.length}명
- 설문만 있고 리액션 로그가 없는 응답자: ${surveyOnlyClientIds.length}명
- 리액션만 있고 설문이 없는 클라이언트: ${reactionOnlyClientIds.length}명

## 핵심 해석 요약

이 레포트는 두 종류의 데이터를 함께 봅니다. 첫째, 공연 후 설문 응답은 관객이 공연을 어떻게 평가했는지 보여줍니다. 둘째, 공연 중 웹사이트 리액션 로그는 관객이 실제로 어느 곡에서 얼마나 참여했는지 보여줍니다. 두 데이터는 같은 client_id로 연결되어 있으므로, 익명 응답자 단위로 "실제 참여 행동"과 "사후 평가"를 함께 해석할 수 있습니다.

주요 결과는 다음과 같습니다.

- 설문에서 가장 높게 평가된 항목은 ${topSurvey[0].label} 평균 ${topSurvey[0].mean}점입니다. 공연 공간의 분위기와 곡의 결합은 매우 긍정적으로 받아들여졌다고 볼 수 있습니다.
- 가장 낮게 평가된 항목은 ${lowestSurvey.label} 평균 ${lowestSurvey.mean}점입니다. 공연의 예술적/공간적 방향성보다 물리적 관람 환경 쪽에 개선 여지가 있다는 신호입니다.
- 상호작용 평가에서 가장 높은 항목은 ${topInteraction.label} 평균 ${topInteraction.mean}점이고, 가장 낮은 항목은 ${lowestInteraction.label} 평균 ${lowestInteraction.mean}점입니다. 즉, 상호작용 방식마다 관객이 느낀 도움/몰입/편안함이 다르게 나타났습니다.
- 가장 많이 선택된 인상 깊은 요소는 ${topFeature.label}이며, ${topFeature.count}명(${topFeature.pct_of_respondents}%)이 선택했습니다.
- 곡별 리액션 총량 상위 곡은 ${topSongs.map((row) => `${row.title} ${row.total}건`).join(', ')}입니다.
- 가장 많이 사용된 리액션 타입은 ${topReactionType.label} ${topReactionType.total}건(${topReactionType.pct_of_reactions}%)입니다.
- ID 연결 분석에서는 ${matchedClientIds.length}명의 설문 응답자가 리액션 로그와 연결되었습니다. 이 연결 데이터에서 가장 강한 탐색적 관계는 "${strongestCorrelation.metric_label}"와 "${strongestCorrelation.survey_metric_label}" 사이이며, Pearson r=${strongestCorrelation.pearson_r}입니다.

주의할 점은 표본이 작다는 것입니다. 따라서 이 결과는 "증명"이라기보다, 공연에서 어떤 참여 경험이 긍정적 평가와 함께 나타났는지 보여주는 탐색적 근거로 해석하는 것이 안전합니다.

## ID 연결 분석

설문과 공연 중 웹 인터렉션은 같은 client_id를 사용하므로, 익명 응답자 단위로 실제 행동량과 사후 평가를 연결해 볼 수 있습니다. 단, 설문 응답자가 5명으로 적기 때문에 상관계수는 결론이라기보다 탐색적 단서로 해석해야 합니다.

이 섹션에서 얻을 수 있는 의미 있는 값은 세 가지입니다. 첫째, 설문 응답자 중 실제 리액션 로그와 연결되는 사람이 몇 명인지입니다. 이번 데이터에서는 ${parsedSurveys.length}명 중 ${matchedClientIds.length}명(${pct(matchedClientIds.length, parsedSurveys.length)}%)이 연결됩니다. 둘째, 각 응답자가 공연 중 얼마나 넓게 참여했는지입니다. ${broadestEngagementClient.participant}는 ${broadestEngagementClient.active_song_count}곡에서 리액션을 남겼고, 총 ${broadestEngagementClient.reaction_total}건의 리액션을 기록했습니다. 셋째, 참여 행동과 사후 평가가 같은 방향으로 움직이는지입니다. 이번 데이터에서는 ${strongestCorrelation.metric_label}와 ${strongestCorrelation.survey_metric_label}의 상관이 가장 크게 나타났습니다.

### 응답자별 행동-설문 요약

${markdownTable(joinedClientSummary, [
  ['응답자', 'participant'],
  ['리액션 로그', 'has_reaction_log'],
  ['총 리액션', 'reaction_total'],
  ['리액션한 곡 수', 'active_song_count'],
  ['1곡당 리액션', 'reactions_per_active_song'],
  ['최다 리액션 곡', 'top_song'],
  ['주 리액션', 'dominant_reaction'],
  ['전체 설문 평균', 'avg_rating'],
  ['전반 만족', 'overall_satisfaction'],
  ['능동 참여', 'active_participation'],
  ['재관람', 'revisit_intent'],
  ['상호작용 평균', 'avg_interaction_rating'],
  ['인상 요소 수', 'selected_impressive_count'],
])}

![리액션 수와 설문 평균](charts/joined_reactions_vs_avg_rating.svg)

![리액션한 곡 수와 전반적 만족도](charts/joined_active_songs_vs_satisfaction.svg)

해석: ${mostEngagedClient.participant}는 총 리액션 ${mostEngagedClient.reaction_total}건, 리액션한 곡 수 ${mostEngagedClient.active_song_count}곡으로 가장 적극적인 참여자입니다. 이 응답자의 전체 설문 평균은 ${mostEngagedClient.avg_rating}점, 전반 만족도는 ${mostEngagedClient.overall_satisfaction}점입니다. 반대로 리액션 로그가 없는 설문 응답자는 ${noReactionSurveyClients.length}명이며, ${noReactionSurveyClients.length ? `${noReactionSurveyClients[0].participant}의 전체 설문 평균은 ${noReactionSurveyClients[0].avg_rating}점입니다.` : '해당 응답자는 없습니다.'} 이 비교는 "참여 행동이 많은 관객이 더 긍정적으로 평가했는가"를 볼 수 있게 해줍니다.

### 탐색적 상관

${markdownTable(notableCorrelationRows, [
  ['행동 지표', 'metric_label'],
  ['설문 지표', 'survey_metric_label'],
  ['N', 'n'],
  ['Pearson r', 'pearson_r'],
  ['비고', 'note'],
])}

해석: Pearson r은 -1에서 1 사이의 값이며, 1에 가까울수록 두 지표가 함께 높아지는 경향이 강합니다. 이번 데이터에서 ${strongestCorrelation.metric_label}와 ${strongestCorrelation.survey_metric_label}의 r=${strongestCorrelation.pearson_r}로 가장 큽니다. 따라서 단순히 버튼을 많이 누른 횟수뿐 아니라, 여러 곡에 걸쳐 꾸준히 참여한 폭이 만족도와 함께 나타났다고 해석할 수 있습니다. 다만 N=${strongestCorrelation.n}이므로 인과관계로 단정하지 않고 탐색적 경향으로만 보는 것이 적절합니다.

### 설문 없이 리액션만 있는 클라이언트

${reactionOnlySummary.length ? markdownTable(reactionOnlySummary, [
  ['참여자', 'participant'],
  ['총 리액션', 'reaction_total'],
  ['리액션한 곡 수', 'active_song_count'],
  ['최다 리액션 곡', 'top_song'],
  ['최다 곡 리액션 수', 'top_song_reactions'],
  ['주 리액션', 'dominant_reaction'],
  ['주 리액션 수', 'dominant_reaction_count'],
]) : '없음'}

해석: 이 표는 공연 중 리액션은 남겼지만 설문을 제출하지 않은 참여자를 보여줍니다. 이들은 설문 평가와 연결할 수는 없지만, 실제 공연 중 참여 총량을 해석할 때는 포함해야 합니다. 즉, 곡별 리액션 총량과 리액션 타입별 총량은 이 참여자들의 행동도 포함한 전체 현장 반응입니다.

## 질문 및 답변 형식

${markdownTable(questionOverview, [
  ['문항', 'label'],
  ['질문', 'question_ko'],
  ['Question', 'question_en'],
  ['답변 방식', 'answer_type'],
  ['답변 선택지', 'answer_options'],
])}

## 설문 응답 요약

각 척도형 문항은 점수 분포를 파이차트로 표시했습니다. 서술형 문항은 수치화 요약 뒤에 원문 응답을 그대로 표시했습니다.

가장 높은 평균은 ${topSurvey[0].label}(${topSurvey[0].mean})이고, 가장 낮은 평균은 ${topSurvey.at(-1).label}(${topSurvey.at(-1).mean})입니다.

해석: ${topSurvey[0].label} 항목이 가장 높다는 것은 공연의 컨셉과 공간 분위기가 관객에게 잘 전달되었음을 시사합니다. ${lowestSurvey.label} 항목이 가장 낮다는 것은 관객 경험의 불편이 콘텐츠 자체보다 착석 방식이나 물리적 환경에서 발생했을 가능성을 보여줍니다. 따라서 다음 개선 방향은 음악/인터랙션 컨셉을 바꾸는 것보다 관람 자세, 방석, 시야, 참여 동선 같은 환경 설계에 우선순위를 둘 수 있습니다.

${scaleQuestionBlocks(surveyRatingSummary, 'survey', (summary) => ({
  questionKo: ratingQuestionTexts[summary.question].ko,
  questionEn: ratingQuestionTexts[summary.question].en,
  answerType: '5점 리커트 척도 단일 선택',
}))}

![설문 척도 문항 평균](charts/survey_ratings_average.svg)

## 상호작용 평가

상위 질문: 인터렉션 경험을 영역별로 평가해 주세요.  
Parent question: Please rate each type of interaction separately.

해석: 상호작용 평가는 "어떤 매체가 곡의 감정 이해, 참여 몰입, 사용 편안함에 도움이 되었는지"를 나눠서 봅니다. 최고 평균은 ${topInteraction.label} ${topInteraction.mean}점이고, 최저 평균은 ${lowestInteraction.label} ${lowestInteraction.mean}점입니다. 낮은 항목은 해당 매체가 관객의 주의를 음악에서 분산시켰거나, 참여 방식이 충분히 직관적으로 느껴지지 않았을 가능성을 점검하는 지점입니다.

${scaleQuestionBlocks(interactionSummary, 'interaction', (summary) => ({
  questionKo: `${interactionQuestionTexts[summary.dimension].ko} - ${interactionChannelTexts[summary.channel].ko}`,
  questionEn: `${interactionQuestionTexts[summary.dimension].en} - ${interactionChannelTexts[summary.channel].en}`,
  answerType: '영역별 5점 리커트 척도 단일 선택',
}))}

![상호작용 평가 평균](charts/interaction_ratings_heatmap.svg)

## 인상 깊었던 요소

질문: 이번 공연에서 가장 인상 깊었던 요소는 무엇인가요? 복수 선택이 가능합니다.  
Question: What were the most memorable elements of this performance? You may select multiple options.  
답변 방식: 복수 선택형 체크박스

복수 선택 문항이라 각 선택지 비율의 합이 100%가 아닐 수 있습니다.

해석: 이 문항은 평균 점수가 아니라 기억에 남은 요소의 빈도를 봅니다. ${topFeature.label}이 가장 많이 선택되었으므로, 공연 이후 관객 기억에 가장 강하게 남은 장치로 볼 수 있습니다. 선택 수가 낮은 요소는 반드시 실패했다기보다, 관객이 공연을 회상할 때 상대적으로 덜 먼저 떠올린 요소라고 해석하는 편이 안전합니다.

${markdownTable(featureOptionSummary, [
  ['요소', 'label'],
  ['Answer', 'answer_en'],
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

해석: 서술형 응답은 수치보다 이유를 설명해 줍니다. 기억에 남는 순간에서는 손/기타/드럼스틱/천둥/공동 참여처럼 직접 참여하거나 감각적으로 강한 장면이 반복해서 언급됩니다. 개선점에서는 방석, 장비 인식, 프로젝션이 음악 감상 집중을 나누는 문제, 이모지 반응의 실시간 시각화 같은 제안이 나옵니다. 즉, 긍정 경험은 "참여가 음악 경험을 강화할 때" 발생했고, 개선 요구는 "참여가 음악 감상을 방해하거나 피드백이 충분히 보이지 않을 때" 나타났다고 볼 수 있습니다.

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

해석: 곡별 리액션은 관객이 어느 곡에서 더 많이 행동했는지를 보여줍니다. 상위 곡은 관객이 반응할 수 있는 구조가 잘 작동했거나, 곡 자체의 감정/장면 전환이 리액션을 유도했을 가능성이 있습니다. 단, 한 명의 적극적인 참여자가 많은 리액션을 남길 수 있으므로, 총 리액션 수와 함께 참여 클라이언트 수를 같이 봐야 합니다.

![곡별 리액션 수](charts/song_reactions_stacked.svg)

## 리액션 타입별 집계

${markdownTable(reactionsByType, [
  ['리액션', 'label'],
  ['총량', 'total'],
  ['참여 클라이언트', 'unique_clients'],
  ['전체 대비 %', 'pct_of_reactions'],
])}

해석: 리액션 타입별 집계는 관객이 어떤 감정 표현 방식을 가장 많이 사용했는지 보여줍니다. ${topReactionType.label} 리액션이 ${topReactionType.total}건으로 가장 많았고 전체의 ${topReactionType.pct_of_reactions}%를 차지합니다. 이는 관객이 공연 중 긍정적 승인이나 호응을 표현하는 방식으로 해당 아이콘을 가장 자주 사용했다는 뜻입니다.

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
- question_overview.csv
- most_impressive_counts.csv
- most_impressive_options_summary.csv
- open_text_summary.csv
- song_reactions_by_song.csv
- song_reactions_by_type.csv
- song_reactions_by_song_type.csv
- joined_client_summary.csv
- reaction_only_clients_summary.csv
- engagement_rating_correlations.csv
- charts/*.svg
`

fs.writeFileSync(path.join(outputDir, 'report.md'), report)

console.log(`Wrote analysis to ${path.relative(rootDir, outputDir)}`)
