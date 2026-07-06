const axios = require('axios');
const cheerio = require('cheerio');

async function inspectSubheadings() {
  const url = 'https://m.blog.naver.com/PostView.naver?blogId=jjwgo1004&logNo=224309102077';
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    
    const $ = cheerio.load(response.data);
    const mainContainer = $('.se-main-container');
    
    console.log('--- Subheadings & Large Fonts ---');
    mainContainer.find('p').each((i, el) => {
      const p = $(el);
      const text = p.text().trim();
      if (!text) return;
      
      const pClass = p.attr('class') || '';
      let hasLargeFont = false;
      let fs = '';
      
      const fsMatch = pClass.match(/se-fs-fs(\d+)/);
      if (fsMatch) {
        fs = `p:${fsMatch[1]}`;
        if (parseInt(fsMatch[1], 10) >= 16) hasLargeFont = true;
      }
      
      p.find('span').each((j, spanEl) => {
        const spanClass = $(spanEl).attr('class') || '';
        const spanFsMatch = spanClass.match(/se-fs-fs(\d+)/);
        if (spanFsMatch) {
          fs = `span:${spanFsMatch[1]}`;
          if (parseInt(spanFsMatch[1], 10) >= 16) hasLargeFont = true;
        }
      });
      
      if (hasLargeFont || p.hasClass('se-title-paragraph') || pClass.includes('se-title-paragraph')) {
        console.log(`[Large/Subtitle] Text: "${text}" | Font: ${fs} | Class: "${pClass}"`);
      }
    });

    console.log('\n--- Quote blocks ---');
    mainContainer.find('.se-quote, .se-component-quote').each((i, el) => {
      console.log(`[Quote] Text: "${$(el).text().trim()}" | Class: "${$(el).attr('class') || ''}"`);
    });
    
  } catch (err) {
    console.error(err.message);
  }
}

inspectSubheadings();
