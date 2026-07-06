const axios = require('axios');

async function testSeoParser() {
  const testUrl = 'https://blog.naver.com/jjwgo1004/224309102077';
  console.log(`Testing SEO Analyzer API with URL: ${testUrl}`);
  
  try {
    const response = await axios.post('http://localhost:3000/api/analyze', {
      url: testUrl
    });
    
    const { title, imageCount, linkCount, tags, content } = response.data;
    
    console.log('\n--- Extraction Results ---');
    console.log(`Title: ${title}`);
    console.log(`Image Count: ${imageCount}`);
    console.log(`Link Count: ${linkCount}`);
    console.log(`Tags:`, tags);
    
    console.log('\n--- Subheadings (Lines starting with ## or ###) ---');
    const lines = content.split('\n');
    const subheadings = lines.filter(line => line.startsWith('##') || line.startsWith('###'));
    subheadings.forEach(sub => console.log(sub));
    
  } catch (err) {
    console.error('API Error:', err.response ? err.response.data : err.message);
  }
}

testSeoParser();
