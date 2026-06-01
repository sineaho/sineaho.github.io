const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
      // 쿼리 파라미터가 있는 경우와 경로 기반 주소인 경우에 맞춰 인덱스 매칭
      if (match.length >= 4 && (match[1] === 'naver' || match[1] === 'nhn')) {
        return { blogId: match[2], logNo: match[3] };
      } else {
        return { blogId: match[1], logNo: match[2] };
      }
    }
  }
  return null;
}

// 네이버 블로그 분석 API
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
  // 모바일 뷰 주소로 요청하여 iframe 우회
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
      mainContainer = $('#postViewArea'); // 구버전 PC 본문 영역
    }
    if (mainContainer.length === 0) {
      mainContainer = $('.post_ct'); // 모바일 구버전 본문 영역
    }

    if (mainContainer.length === 0) {
      // 제목은 가져왔으므로 본문 탐색에 실패했더라도 기본 텍스트 래퍼로 시도
      mainContainer = $('#dirDetail, .se_viewer, #naverBlogStartContent');
    }

    // 제목 추출
    let title = $('.se-viewer .se-title-text').text().trim();
    if (!title) {
      title = $('.se_title .se_textarea').text().trim(); // 스마트에디터 3.0 제목 포맷
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

    // 스마트에디터 ONE/3.0 컴포넌트들 탐색 (.se-component)
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

            // 소제목 판단: 폰트 크기 클래스 감지 (예: se-fs-fs19, se-fs-fs16, se-fs-fs24 등)
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
      // 컴포넌트 구조가 아닌 경우 (완전 구버전): 직접 하위 텍스트 노드 탐색
      mainContainer.find('p, div, br').each((i, el) => {
        const text = $(el).clone().children().remove().end().text().trim(); // 자기 자신의 텍스트만 추출 (자식 텍스트 중복 방지)
        if (text) {
          bodyMarkdown.push(text);
        }
      });

      // 구버전 이미지 추출 폴백
      mainContainer.find('img').each((i, imgEl) => {
        const src = $(imgEl).attr('src') || '';
        // 스티커나 미니 아이콘 이미지 제외 (가로세로 80px 이상만 본문 이미지로 취급)
        const width = parseInt($(imgEl).attr('width') || '100', 10);
        if (src && !src.includes('postfiles') && width > 50) {
          imageCount++;
          images.push({ src, caption: '본문 이미지' });
          bodyMarkdown.push(`\n[이미지: 본문 이미지]\n`);
        }
      });

      // 구버전 링크 추출 폴백
      mainContainer.find('a').each((i, aEl) => {
        const href = $(aEl).attr('href') || '';
        const text = $(aEl).text().trim();
        if (href && href.startsWith('http') && !href.includes('blog.naver.com')) {
          linkCount++;
          bodyMarkdown.push(`\n[링크: ${text || '외부 링크'}](${href})\n`);
        }
      });
    }

    // 본문 전체 텍스트 병합 및 중복 개행 정리
    const fullText = bodyMarkdown.filter(val => val !== undefined).join('\n').replace(/\n{3,}/g, '\n\n');

    // 해시태그 수집 (다양한 선택자 적용, URL 쿼리 분석 및 본문 직접 추출을 통한 100% 검출)
    const tags = [];
    
    // 1단계: 네이버 검색 태그 링크의 tagName 파라미터 디코딩 (가장 정확함)
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
          // 디코딩 실패 대비 폴백
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

    // 3단계: 본문 전체(특히 맨 마지막 부분)에서 직접 단일 #태그 텍스트 추출 (사용자가 본문 맨 밑에 타이핑한 해시코드)
    // (?<!#)#을 통해 마크다운의 ##, ### (소제목)을 제외하고 오직 단일 #으로 구성된 해시코드만 탐색합니다.
    const bodyTagRegex = /(?<!#)#([a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣_]+)/g;
    let bodyTagMatch;
    // 본문의 마지막 1500자 혹은 전체 본문에서 해시코드를 분석
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
    console.error('크롤링 실패:', error.message);
    res.status(500).json({ 
      error: '블로그 내용을 가져오는 데 실패했습니다. 주소를 확인하시거나 잠시 후 다시 시도해 주세요.' 
    });
  }
});

// 나머지 요청은 public/index.html로 라우팅
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`네이버 SEO 분석기 서버가 포트 ${PORT}에서 실행 중입니다.`);
});
