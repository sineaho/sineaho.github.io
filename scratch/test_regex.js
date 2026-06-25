const axios = require('axios');
const cheerio = require('cheerio');

async function testRegex() {
  const url = 'https://m.blog.naver.com/PostView.naver?blogId=jjwgo1004&logNo=224309102077';
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    
    const $ = cheerio.load(response.data);
    const tags = [];
    
    $('script').each((i, el) => {
      const jsCode = $(el).html() || '';
      
      if (jsCode.includes('tagNames') || jsCode.includes('tagName')) {
        // 1. tagNames matcher (non-greedy)
        const tagNamesRegex = /\\?"tagNames\\?"\s*:\s*\\?"(.*?)\\?"/g;
        let match;
        while ((match = tagNamesRegex.exec(jsCode)) !== null) {
          const val = match[1];
          const splitTags = val.split(',');
          splitTags.forEach(t => {
            let cleanTag = t.trim();
            if (cleanTag.includes('\\u')) {
              try {
                cleanTag = cleanTag.replace(/\\u([0-9a-fA-F]{4})/g, (m, grp) => {
                  return String.fromCharCode(parseInt(grp, 16));
                });
              } catch (e) {}
            }
            if (cleanTag && !tags.includes(cleanTag)) {
              tags.push(cleanTag);
            }
          });
        }
      }
    });
    
    console.log('Extracted Tags:', tags);
    
  } catch (err) {
    console.error(err.message);
  }
}

testRegex();
