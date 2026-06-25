const axios = require('axios');
const cheerio = require('cheerio');

async function findScriptTags() {
  const url = 'https://m.blog.naver.com/PostView.naver?blogId=jjwgo1004&logNo=224309102077';
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    $('script').each((i, el) => {
      const html = $(el).html() || '';
      if (html.includes('tagName') || html.includes('tagList')) {
        console.log(`\n--- Script ${i} Matches ---`);
        
        // Find all occurrences of tagName
        let idx = 0;
        while ((idx = html.indexOf('tagName', idx)) !== -1) {
          const context = html.substring(idx - 50, idx + 100);
          console.log(`Match: ${context.replace(/\n/g, ' ')}`);
          idx += 7;
        }
      }
    });
    
  } catch (err) {
    console.error(err.message);
  }
}

findScriptTags();
