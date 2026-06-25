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
    
    $('script').each((i, el) => {
      const jsCode = $(el).html() || '';
      
      if (jsCode.includes('tagNames')) {
        console.log('Found tagNames key in script. Testing regex...');
        
        // Let's search with a broad regex and log it
        const match = jsCode.match(/tagNames["\\ ]*:["\\ ]*([^"}]+)/);
        if (match) {
          console.log('Match 1 (broad):', match[0]);
          console.log('Capture group 1:', match[1]);
        }
        
        // Let's test a non-greedy regex
        const regexNonGreedy = /\\?"tagNames\\?"\s*:\s*\\?"(.*?)\\?"/g;
        let matchNG;
        while ((matchNG = regexNonGreedy.exec(jsCode)) !== null) {
          console.log('Non-greedy match:', matchNG[0]);
          console.log('Non-greedy group 1:', matchNG[1]);
        }
      }
    });
    
  } catch (err) {
    console.error(err.message);
  }
}

testRegex();
