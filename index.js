#!/usr/bin/env node

import { Buffer } from 'buffer';

const TOPICS = {
  world: 'CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U00xOXRiaUValidVb1FSMW9F',
  nation: 'CAAqIggKIhxDQkFTRHdvSkwyMHZNRE55TXpveEVnSmxiaWdCRlFvZkF3b0k',
  business: 'CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZdU1ITmxjM05sY25OcFp3b0k',
  technology: 'CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZdU1ITmxjM05sY25OcFp3b0k',
  entertainment: 'CAAqJggKIiBDQkFTRWdvSUwyMHZNRE55TVdZdU1ITmxjM05sY25OcFp3b0k',
  sports: 'CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp4WkNZdU1ITmxjM05sY25OcFp3b0k',
  science: 'CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1NZdU1ITmxjM05sY25OcFp3b0k',
  health: 'CAAqJggKIiBDQkFTRWdvSUwyMHZNR3d4WkNZdU1ITmxjM05sY25OcFp3b0k'
};

const TOPIC_ALIASES = {
  w: 'world',
  n: 'nation',
  b: 'business',
  tech: 'technology',
  t: 'technology',
  ent: 'entertainment',
  e: 'entertainment',
  sp: 'sports',
  sci: 'science',
  sc: 'science',
  h: 'health'
};

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bgBlue: '\x1b[44m',
  bgCyan: '\x1b[46m',
  white: '\x1b[37m'
};

function showHelp() {
  console.log(`
${ANSI.bold}${ANSI.cyan}┌────────────────────────────────────────────────────────┐${ANSI.reset}
${ANSI.bold}${ANSI.cyan}│                   GOOGLE NEWS CLI                      │${ANSI.reset}
${ANSI.bold}${ANSI.cyan}└────────────────────────────────────────────────────────┘${ANSI.reset}

${ANSI.bold}Usage:${ANSI.reset}
  gnews [options]

${ANSI.bold}Options:${ANSI.reset}
  -s, --search <query>  Search for articles matching the query
  -t, --topic <topic>   Get news for a specific topic
  -l, --limit <number>  Limit the number of results (default: 10)
  -h, --help            Show this help menu

${ANSI.bold}Available Topics:${ANSI.reset}
  world (w), nation (n), business (b), technology (tech/t), 
  entertainment (ent/e), sports (sp), science (sci/sc), health (h)

${ANSI.bold}Examples:${ANSI.reset}
  gnews
  gnews -s "artificial intelligence"
  gnews -t technology -l 5
`);
}

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .trim();
}

function getRelativeTime(dateStr) {
  try {
    const ms = Date.parse(dateStr);
    if (isNaN(ms)) return dateStr;
    const diffMs = Date.now() - ms;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch (e) {
    return dateStr;
  }
}

async function fetchNews() {
  const args = process.argv.slice(2);
  let search = '';
  let topicInput = '';
  let limit = 10;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--search=')) {
      search = arg.slice(9);
    } else if (arg === '-s' || arg === '--search') {
      search = args[++i];
    } else if (arg.startsWith('--topic=')) {
      topicInput = arg.slice(8);
    } else if (arg === '-t' || arg === '--topic') {
      topicInput = args[++i];
    } else if (arg.startsWith('--limit=')) {
      const val = parseInt(arg.slice(8), 10);
      if (!isNaN(val)) limit = val;
    } else if (arg === '-l' || arg === '--limit') {
      const val = parseInt(args[++i], 10);
      if (!isNaN(val)) limit = val;
    } else if (arg === '-h' || arg === '--help') {
      showHelp();
      process.exit(0);
    }
  }

  let url = 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en';
  let modeDesc = 'Top Stories';

  if (search) {
    url = `https://news.google.com/rss/search?q=${encodeURIComponent(search)}&hl=en-US&gl=US&ceid=US:en`;
    modeDesc = `Search: "${search}"`;
  } else if (topicInput) {
    const normalizedTopic = topicInput.toLowerCase();
    const resolvedTopic = TOPIC_ALIASES[normalizedTopic] || normalizedTopic;
    const topicId = TOPICS[resolvedTopic];

    if (!topicId) {
      console.error(`${ANSI.red}${ANSI.bold}Error:${ANSI.reset} Invalid topic "${topicInput}".`);
      console.error(`Available topics: ${Object.keys(TOPICS).join(', ')}`);
      process.exit(1);
    }

    url = `https://news.google.com/rss/topics/${topicId}?hl=en-US&gl=US&ceid=US:en`;
    modeDesc = `Topic: ${resolvedTopic.charAt(0).toUpperCase() + resolvedTopic.slice(1)}`;
  }

  console.log(`${ANSI.gray}Fetching latest news from Google... (${modeDesc})${ANSI.reset}\n`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const xml = await response.text();

    const items = [];
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

    for (const match of itemMatches) {
      const itemContent = match[1];

      const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const sourceMatch = itemContent.match(/<source[^>]*>([\s\S]*?)<\/source>/);

      if (titleMatch && linkMatch) {
        let fullTitle = decodeEntities(titleMatch[1]);
        let sourceName = sourceMatch ? decodeEntities(sourceMatch[1]) : '';
        
        // Clean up title if it contains source name at the end (typical in Google News)
        if (sourceName && fullTitle.endsWith(` - ${sourceName}`)) {
          fullTitle = fullTitle.slice(0, -(sourceName.length + 3)).trim();
        }

        items.push({
          title: fullTitle,
          link: decodeEntities(linkMatch[1]),
          pubDate: pubDateMatch ? decodeEntities(pubDateMatch[1]) : '',
          source: sourceName
        });
      }
    }

    if (items.length === 0) {
      console.log(`${ANSI.yellow}No articles found.${ANSI.reset}`);
      return;
    }

    const displayItems = items.slice(0, limit);

    displayItems.forEach((item, index) => {
      const indexStr = `${ANSI.bold}${ANSI.cyan}[${index + 1}]${ANSI.reset}`;
      const titleStr = `${ANSI.bold}${item.title}${ANSI.reset}`;
      const sourceStr = item.source ? `${ANSI.green}${item.source}${ANSI.reset}` : '';
      const timeStr = item.pubDate ? `${ANSI.gray}(${getRelativeTime(item.pubDate)})${ANSI.reset}` : '';
      const metaStr = [sourceStr, timeStr].filter(Boolean).join(' • ');
      
      console.log(`${indexStr} ${titleStr}`);
      if (metaStr) console.log(`    ${metaStr}`);
      console.log(`    ${ANSI.blue}${ANSI.underline}${item.link}${ANSI.reset}`);
      console.log();
    });

    if (items.length > limit) {
      console.log(`${ANSI.gray}Showing ${limit} of ${items.length} articles. Use -l to see more.${ANSI.reset}\n`);
    }

  } catch (error) {
    console.error(`${ANSI.red}${ANSI.bold}Error fetching news:${ANSI.reset}`, error.message);
    process.exit(1);
  }
}

fetchNews();
