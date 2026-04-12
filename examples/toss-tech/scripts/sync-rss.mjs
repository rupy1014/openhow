import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const docsDir = path.join(projectRoot, 'docs')
const configPath = path.join(projectRoot, 'openhow.json')

const RSS_URL = 'https://toss.tech/rss.xml'
const HOME_URL = 'https://toss.tech/'
const CATEGORIES = ['engineering', 'design', 'product']
const CATEGORY_ARTICLE_LIMIT = 3
const CATEGORY_LABELS = {
  engineering: 'Engineering',
  design: 'Design',
  product: 'Product',
}
const AUTHOR_BIOS = {
  engineering: '토스 기술 블로그 메타데이터를 기반으로 생성한 엔지니어링 글 카드 예제입니다.',
  design: '토스 기술 블로그 메타데이터를 기반으로 생성한 디자인 글 카드 예제입니다.',
  product: '토스 기술 블로그 메타데이터를 기반으로 생성한 프로덕트 글 카드 예제입니다.',
}

function decodeHtml(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim()
}

function stripTags(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, ' '))
}

function extractTag(block, tagName) {
  const direct = block.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i'))
  if (direct) return decodeHtml(direct[1])
  return ''
}

function slugifyFromLink(link) {
  const pathname = new URL(link).pathname
  const parts = pathname.split('/').filter(Boolean)
  return parts[parts.length - 1] || 'article'
}

function inferThumbnail(encodedHtml) {
  const prioritized = encodedHtml.match(/https:\/\/static\.toss\.im\/ipd-tcs\/[^"' )]+/i)
  if (prioritized) return prioritized[0]
  const match = encodedHtml.match(/<link[^>]+href="([^"]+)"/i)
  return match?.[1] || ''
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'openhow-toss-tech-example',
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }
  return response.text()
}

async function parseHomePage() {
  const html = await fetchText(HOME_URL)
  const series = []

  const seenSeries = new Set()
  for (const match of html.matchAll(/<a[^>]+href="(\/series\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const href = match[1]
    if (seenSeries.has(href)) continue
    const text = stripTags(match[2])
    if (!text) continue
    const countMatch = text.match(/아티클\s*(\d+)\s*개/)
    const title = text.replace(/아티클\s*\d+\s*개/, '').trim()
    const descriptionMatch = text.match(/^(.*?)\s{2,}(.*)$/)
    seenSeries.add(href)
    series.push({
      title: descriptionMatch?.[1] || title,
      description: descriptionMatch?.[2] || '',
      url: new URL(href, HOME_URL).toString(),
      articleCount: countMatch ? Number(countMatch[1]) : undefined,
    })
  }

  return { series: series.slice(0, 4) }
}

function parseRss(xml) {
  const items = []

  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = match[1]
    const title = extractTag(block, 'title')
    const link = extractTag(block, 'link')
    const description = extractTag(block, 'description')
    const pubDate = extractTag(block, 'pubDate')
    const encoded = block.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i)?.[1] || ''
    if (!title || !link) continue
    items.push({
      title,
      link,
      description,
      pubDate,
      thumbnail: inferThumbnail(encoded),
    })
  }

  return items
}

async function parseCategoryPage(category) {
  const html = await fetchText(new URL(`/category/${category}`, HOME_URL).toString())
  const items = []
  const seen = new Set()

  for (const match of html.matchAll(/<a[^>]+href="(\/article\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const href = match[1]
    if (seen.has(href)) continue
    const text = stripTags(match[2])
    if (!text) continue
    seen.add(href)
    items.push({
      link: new URL(href, HOME_URL).toString(),
      category,
    })
    if (items.length >= CATEGORY_ARTICLE_LIMIT) break
  }

  return items
}

function parseKoreanDate(text) {
  const match = text.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/)
  if (!match) return ''
  const [, year, month, day] = match
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

async function fetchArticleMeta(url, fallbackCategory) {
  const html = await fetchText(url)
  const title = decodeHtml(
    html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i)?.[1]
      || html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]
      || '',
  )
  const description = decodeHtml(
    html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"/i)?.[1]
      || html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1]
      || '',
  )
  const thumbnail = decodeHtml(
    html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i)?.[1]
      || inferThumbnail(html),
  )
  const author = decodeHtml(
    html.match(/<div class="o6bzlua">[\s\S]*?<span class="o6bzlub">([^<]+)<\/span>/i)?.[1]
      || CATEGORY_LABELS[fallbackCategory],
  ).trim()
  const date = parseKoreanDate(
    html.match(/<div class="o6bzluc">(\d{4}년\s*\d{1,2}월\s*\d{1,2}일)<\/div>/i)?.[1] || '',
  )

  if (title && description && author && date && thumbnail) {
    return {
      title,
      description,
      author,
      date,
      thumbnail,
    }
  }

  const sanitizedHtml = html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  const text = stripTags(sanitizedHtml)
  const compact = text.replace(/\s+/g, ' ')
  const fallbackDate = parseKoreanDate(compact)
  return {
    title,
    description,
    author,
    date: date || fallbackDate,
    thumbnail,
  }
}

async function clearGeneratedDocs() {
  for (const category of CATEGORIES) {
    const dir = path.join(docsDir, category)
    await fs.rm(dir, { recursive: true, force: true })
    await fs.mkdir(dir, { recursive: true })
  }
}

function toMarkdown(item) {
  const categoryLabel = CATEGORY_LABELS[item.category]
  const authorBio = AUTHOR_BIOS[item.category]
  return `---
title: "${item.title.replace(/"/g, '\\"')}"
description: "${item.description.replace(/"/g, '\\"')}"
date: ${item.date}
author: "${(item.author || categoryLabel).replace(/"/g, '\\"')}"
authorBio: "${authorBio}"
thumbnail: "${item.thumbnail}"
tags: [${categoryLabel}]
sourceUrl: "${item.link}"
---

이 문서는 **toss.tech RSS와 홈 메타데이터**를 기준으로 생성한 팀 블로그 레이아웃 예제입니다.

- 원문: [${item.title}](${item.link})
- 카테고리: ${categoryLabel}
- 발행일: ${item.date}

## 예제 목적

openhow의 \`blog\` 타입이 docs/archive형만이 아니라, **카테고리 + 저자 + 에디토리얼 랜딩**을 가진 team blog 형태도 수용할 수 있는지 검증합니다.

## 메타데이터만 가져온 이유

원문 전체를 복제하지 않고도 카드 UI, 상세 상단 레이아웃, 저자/날짜/썸네일 시스템을 테스트할 수 있도록 RSS 메타데이터만 반영했습니다.
`
}

async function writeDocs(items) {
  for (const item of items) {
    const slug = slugifyFromLink(item.link)
    const outputPath = path.join(docsDir, item.category, `${slug}.md`)
    const date = new Date(item.pubDate)
    const isoDate = Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10)
    const markdown = toMarkdown({
      ...item,
      date: isoDate,
    })
    await fs.writeFile(outputPath, markdown, 'utf8')
  }
}

async function updateConfig(series) {
  const config = JSON.parse(await fs.readFile(configPath, 'utf8'))
  config.preset = 'team-blog'
  config.teamBlog = {
    originUrl: HOME_URL,
    rssUrl: RSS_URL,
    ctaLabel: '원문 보기',
    series,
  }
  await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8')
}

async function main() {
  const [home, rssXml, ...categoryPages] = await Promise.all([
    parseHomePage(),
    fetchText(RSS_URL),
    ...CATEGORIES.map((category) => parseCategoryPage(category)),
  ])
  const rssItems = parseRss(rssXml)
  const rssByLink = new Map(rssItems.map((item) => [item.link, item]))
  const selected = categoryPages.flat()
  const enriched = []

  for (const candidate of selected) {
    const rssItem = rssByLink.get(candidate.link)
    const articleMeta = await fetchArticleMeta(candidate.link, candidate.category)
    enriched.push({
      link: candidate.link,
      title: articleMeta.title || rssItem?.title || '',
      description: articleMeta.description || rssItem?.description || '',
      pubDate: rssItem?.pubDate || articleMeta.date,
      thumbnail: articleMeta.thumbnail || rssItem?.thumbnail || '',
      category: candidate.category,
      author: articleMeta.author,
    })
  }

  await clearGeneratedDocs()
  await writeDocs(enriched)
  await updateConfig(home.series)

  console.log(`Synced ${enriched.length} RSS items into ${docsDir}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
