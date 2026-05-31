const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Cineaho 폴더 전체를 static 호스팅 (하위 naver-seo, checklist 등 자동 호스팅됨)
app.use(express.static(__dirname));

// 네이버 블로그 URL 파싱 정규식
const NAVER_BLOG_REGEXES = [
  /blog\.naver\.com\/([a-zA-Z0-9_-]+)\/([0-9]+)/,
  /blog\.naver\.com\/PostView\.(naver|nhn)\?.*blogId=([a-zA-Z0-9_-]+).*logNo=([0-9]+)/,
  /m\.blog\.naver\.com\/([a-zA-Z0-9_-]+)\/([0-9]+)/,
  /m\.blog\.naver\.com\/PostView\.(naver|nhn)\?.*blogId=([a-zA-Z0-9_-]+).*logNo=([0-9]+)/
];

function extractBlogInfo(url) {
  for (const regex of NAVER_BLOG_REGEXES) {
    const match = url.match(regex);
    if (match) {
      if (match.length >= 4 && (match[1] === 'naver' || match[1] === 'nhn')) {
        return { blogId: match[2], logNo: match[3] };
      } else {
        return { blogId: match[1], logNo: match[2] };
      }
    }
  }
  return null;
}

// 통합 SEO 크롤링 API (서브앱 naver-seo의 호출을 포털 서버가 직접 처리)
app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL을 입력해주세요.' });
  }

  const info = extractBlogInfo(url);
  if (!info) {
    return res.status(400).json({ 
      error: '올바른 네이버 블로그 주소가 아닙니다. 예시: https://blog.naver.com/아이디/글번호' 
    });
  }

  const { blogId, logNo } = info;
  const mobileUrl = `https://m.blog.naver.com/PostView.naver?blogId=${blogId}&logNo=${logNo}`;

  try {
    const response = await axios.get(mobileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    // 본문 컨테이너 탐색 (스마트에디터 ONE 및 구버전 폴백 포함)
    let mainContainer = $('.se-main-container');
    if (mainContainer.length === 0) {
      mainContainer = $('#postViewArea'); 
    }
    if (mainContainer.length === 0) {
      mainContainer = $('.post_ct'); 
    }
    if (mainContainer.length === 0) {
      mainContainer = $('#dirDetail, .se_viewer, #naverBlogStartContent');
    }

    // 제목 추출
    let title = $('.se-viewer .se-title-text').text().trim();
    if (!title) {
      title = $('.se_title .se_textarea').text().trim(); 
    }
    if (!title) {
      title = $('title').text().replace(' : 네이버 블로그', '').trim();
    }

    // 본문 내용 파싱 (구조 유지하며 텍스트화)
    let bodyMarkdown = [];
    let imageCount = 0;
    let linkCount = 0;
    let tableListCount = 0;
    const images = [];

    const components = mainContainer.find('.se-component, .se-component-content, .se_component');
    
    if (components.length > 0) {
      components.each((i, el) => {
        const comp = $(el);

        // 1. 텍스트 컴포넌트
        if (comp.hasClass('se-component-text') || comp.find('.se-text-paragraph').length > 0) {
          comp.find('.se-text-paragraph, p').each((j, pEl) => {
            const p = $(pEl);
            let text = p.text().trim();
            if (!text) return;

            const classAttr = p.attr('class') || '';
            const fsMatch = classAttr.match(/se-fs-fs(\d+)/) || classAttr.match(/se-fs(\d+)/) || classAttr.match(/se_fs_fs(\d+)/);
            
            if (fsMatch) {
              const size = parseInt(fsMatch[1], 10);
              if (size >= 19) {
                bodyMarkdown.push(`## ${text}`);
              } else if (size >= 16) {
                bodyMarkdown.push(`### ${text}`);
              } else {
                bodyMarkdown.push(text);
              }
            } else {
              bodyMarkdown.push(text);
            }
          });
        }
        // 2. 인용구 컴포넌트 (소제목 대용으로 많이 쓰임)
        else if (comp.hasClass('se-component-quote') || comp.find('.se-quote').length > 0) {
          const quoteText = comp.find('.se-quote').text().trim();
          if (quoteText) {
            bodyMarkdown.push(`## ${quoteText}`);
          }
        }
        // 3. 이미지 컴포넌트
        else if (comp.hasClass('se-component-image') || comp.find('img').length > 0) {
          const imgTag = comp.find('img');
          if (imgTag.length > 0) {
            imageCount++;
            const imgSrc = imgTag.attr('src') || imgTag.attr('data-lazy-src') || '';
            const caption = comp.find('.se-caption').text().trim();
            
            images.push({ src: imgSrc, caption });
            bodyMarkdown.push(`\n[이미지: ${caption || '본문 이미지'}]\n`);
          }
        }
        // 4. 링크 컴포넌트
        else if (comp.hasClass('se-component-link') || comp.find('a.se-link').length > 0) {
          linkCount++;
          const linkTag = comp.find('a');
          const href = linkTag.attr('href') || '';
          const linkTitle = comp.find('.se-link-title').text().trim() || '외부 링크';
          
          bodyMarkdown.push(`\n[링크: ${linkTitle}](${href})\n`);
        }
        // 5. 표 컴포넌트
        else if (comp.hasClass('se-component-table') || comp.find('table').length > 0) {
          tableListCount++;
          bodyMarkdown.push('\n[표 데이터]\n');
          comp.find('tr').each((trIdx, trEl) => {
            const cells = [];
            $(trEl).find('td, th').each((tdIdx, tdEl) => {
              cells.push($(tdEl).text().trim());
            });
            bodyMarkdown.push(`| ${cells.join(' | ')} |`);
          });
          bodyMarkdown.push('');
        }
        // 6. 리스트 컴포넌트
        else if (comp.hasClass('se-component-list') || comp.find('ul, ol').length > 0) {
          tableListCount++;
          comp.find('li').each((liIdx, liEl) => {
            bodyMarkdown.push(`* ${$(liEl).text().trim()}`);
          });
        }
      });
    } else {
      // 컴포넌트 구조가 아닌 경우 (완전 구버전)
      mainContainer.find('p, div, br').each((i, el) => {
        const text = $(el).clone().children().remove().end().text().trim(); 
        if (text) {
          bodyMarkdown.push(text);
        }
      });

      mainContainer.find('img').each((i, imgEl) => {
        const src = $(imgEl).attr('src') || '';
        const width = parseInt($(imgEl).attr('width') || '100', 10);
        if (src && !src.includes('postfiles') && width > 50) {
          imageCount++;
          images.push({ src, caption: '본문 이미지' });
          bodyMarkdown.push(`\n[이미지: 본문 이미지]\n`);
        }
      });

      mainContainer.find('a').each((i, aEl) => {
        const href = $(aEl).attr('href') || '';
        const text = $(aEl).text().trim();
        if (href && href.startsWith('http') && !href.includes('blog.naver.com')) {
          linkCount++;
          bodyMarkdown.push(`\n[링크: ${text || '외부 링크'}](${href})\n`);
        }
      });
    }

    // 해시태그 수집
    const tags = [];
    
    // 1단계: tagName 파라미터 디코딩
    $('a[href*="tagName="], a[href*="SearchPostList.nhn"], a[href*="SearchPostList.naver"]').each((i, el) => {
      const href = $(el).attr('href') || '';
      const match = href.match(/tagName=([^&]+)/);
      if (match) {
        try {
          const decodedTag = decodeURIComponent(match[1]).trim();
          if (decodedTag && !tags.includes(decodedTag)) {
            tags.push(decodedTag);
          }
        } catch (e) {
          const rawTag = match[1].trim();
          if (rawTag && !tags.includes(rawTag)) tags.push(rawTag);
        }
      }
    });

    // 2단계: 모바일 클래스 선택자 보조 매칭
    $('.wrap_tag a, .se-tag, .tag_area a, .tag_list a, .se-tag-text, .se_tag').each((i, el) => {
      const tagText = $(el).text().replace('#', '').trim();
      if (tagText && !tags.includes(tagText)) {
        tags.push(tagText);
      }
    });

    // 3단계: 본문 직접 타이핑 해시코드 추출
    const fullText = bodyMarkdown.filter(val => val !== undefined).join('\n').replace(/\n{3,}/g, '\n\n');
    const bodyTagRegex = /(?<!#)#([a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣_]+)/g;
    let bodyTagMatch;
    const searchArea = fullText.length > 1500 ? fullText.substring(fullText.length - 1500) : fullText;
    while ((bodyTagMatch = bodyTagRegex.exec(searchArea)) !== null) {
      const tagText = bodyTagMatch[1].trim();
      if (tagText && !tags.includes(tagText)) {
        tags.push(tagText);
      }
    }

    res.json({
      title,
      content: fullText,
      images,
      imageCount: imageCount || images.length,
      linkCount,
      tableListCount,
      tags
    });

  } catch (error) {
    console.error('통합서버 크롤링 실패:', error.message);
    res.status(500).json({ 
      error: '블로그 내용을 가져오는 데 실패했습니다. 주소를 확인하시거나 잠시 후 다시 시도해 주세요.' 
    });
  }
});

// 메인페이지 매칭
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Cineaho 통합 포털 서버가 포트 ${PORT}에서 실행 중입니다.`);
});
