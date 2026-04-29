const axios = require('axios');
const fs = require('fs').promises;

const DEFAULT_PLAYLIST = process.env.PLAYLIST_URL || 'https://iptv-org.github.io/iptv/index.m3u';

function parseAttributes(attrString) {
  const attrs = {};
  const regex = /(\w+?)="([^"]*)"/g;
  let m;
  while ((m = regex.exec(attrString))) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

function parseM3U(data) {
  const lines = data.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const channels = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('#EXTINF')) {
      // Extract attributes and display name
      const rest = line.substring(line.indexOf(':') + 1);
      const attrPartMatch = rest.match(/(.*)((tvg-name|group-title)=)/i);
      // Simpler parsing: attributes before the comma, display name after comma
      const commaIndex = rest.indexOf(',');
      const attrPart = commaIndex >= 0 ? rest.substring(0, commaIndex) : rest;
      const displayName = commaIndex >= 0 ? rest.substring(commaIndex + 1).trim() : '';
      const attrs = parseAttributes(attrPart);

      // Next line should be URL
      const url = (lines[i + 1] && !lines[i + 1].startsWith('#')) ? lines[i + 1] : null;
      if (url) {
        i++;
        channels.push({
          name: attrs['tvg-name'] || displayName || attrs['title'] || null,
          id: attrs['tvg-id'] || null,
          logo: attrs['tvg-logo'] || null,
          group: attrs['group-title'] || null,
          url,
          raw: line
        });
      }
    }
  }
  return channels;
}

async function fetchAndParse(playlistUrl = DEFAULT_PLAYLIST) {
  const res = await axios.get(playlistUrl, { responseType: 'text', timeout: 20000 });
  const data = res.data;
  const channels = parseM3U(data);
  return channels;
}

module.exports = { parseM3U, fetchAndParse };
