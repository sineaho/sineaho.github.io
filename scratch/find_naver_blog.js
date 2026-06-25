const axios = require('axios');
const cheerio = require('cheerio');

async function findBlogUrl() {
  try {
    const searchUrl = 'https://search.naver.com/search.naver?query=%EB%A7%9B%EC%A7%91';
    console.log('Searching Naver for "맛집" to extract a blog link...');
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const urls = [];
    
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      if (href.includes('blog.naver.com') && (href.includes('/22') || href.includes('logNo='))) {
        urls.push(href);
      }
    });
    
    console.log('Found URLs:', urls.slice(0, 5));
  } catch (err) {
    console.error('Error finding blog URL:', err.message);
  }
}

findBlogUrl();
