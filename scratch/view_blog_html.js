const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function checkBlogHtml() {
  const url = 'https://m.blog.naver.com/PostView.naver?blogId=jjwgo1004&logNo=224309102077';
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    let mainContainer = $('.se-main-container');
    console.log('mainContainer (.se-main-container) count:', mainContainer.length);
    
    if (mainContainer.length === 0) {
      mainContainer = $('#postViewArea');
      console.log('mainContainer (#postViewArea) count:', mainContainer.length);
    }
    
    if (mainContainer.length === 0) {
      mainContainer = $('.post_ct');
      console.log('mainContainer (.post_ct) count:', mainContainer.length);
    }
    
    const components = mainContainer.find('.se-component, .se-component-content, .se_component');
    console.log('Components count:', components.length);
    
    // Check some paragraphs and their classes
    console.log('\n--- First 5 Paragraphs ---');
    let pCount = 0;
    mainContainer.find('p').each((i, el) => {
      if (pCount++ < 5) {
        console.log(`P class: "${$(el).attr('class') || ''}" | Text: "${$(el).text().trim()}"`);
        console.log(`Span children classes:`, $(el).find('span').map((j, span) => $(span).attr('class')).get());
      }
    });

    // Check tags
    console.log('\n--- Script tags containing tagList or tags ---');
    $('script').each((i, el) => {
      const html = $(el).html() || '';
      if (html.includes('tagList') || html.includes('tagName')) {
        console.log(`Script ${i} includes tagList or tagName (length: ${html.length})`);
        const snippet = html.substring(html.indexOf('tagList') - 50, html.indexOf('tagList') + 300);
        console.log(`Snippet: ${snippet}`);
      }
    });

    // Check DOM tags
    console.log('\n--- DOM tags ---');
    $('.wrap_tag a, .se-tag, .tag_area a, .tag_list a, .se-tag-text, .se_tag').each((i, el) => {
      console.log(`DOM Tag: "${$(el).text().trim()}"`);
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkBlogHtml();
