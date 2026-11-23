/**
 * Cloudflare Workers / Pages Advanced Mode Entry Script
 * 
 * 정적 파일은 Cloudflare 에셋에서 직접 고속 서빙하고,
 * /api/* 로 시작하는 모든 백엔드 요청은 Render Express 백엔드로 투명하게 리버스 프록시(Reverse Proxy)합니다.
 */

// Render 백엔드 서비스 기본 URL (본인의 Render URL로 환경변수 또는 기본값 적용)
const DEFAULT_BACKEND_ORIGIN = 'https://cineaho-backend.onrender.com';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. /api/ 로 시작하는 모든 요청 -> Render 백엔드로 프록시 전달
    if (url.pathname.startsWith('/api/')) {
      const backendOrigin = env.BACKEND_URL || DEFAULT_BACKEND_ORIGIN;
      const targetUrl = new URL(url.pathname + url.search, backendOrigin);

      // 원본 요청 헤더 복사 및 호스트/CORS 헤더 최적화
      const proxyHeaders = new Headers(request.headers);
      proxyHeaders.set('Origin', backendOrigin);
      proxyHeaders.set('X-Forwarded-Host', url.host);
      proxyHeaders.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

      const proxyRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: proxyHeaders,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        redirect: 'follow'
      });

      try {
        const response = await fetch(proxyRequest);
        
        // CORS 헤더를 보강하여 응답 반환
        const modifiedHeaders = new Headers(response.headers);
        modifiedHeaders.set('Access-Control-Allow-Origin', '*');
        modifiedHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        modifiedHeaders.set('Access-Control-Allow-Headers', '*');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: modifiedHeaders
        });
      } catch (err) {
        // Render 백엔드가 슬립 상태이거나 연결 대기 중일 때 친절한 JSON 안내 반환
        return new Response(JSON.stringify({
          error: 'Backend Connecting',
          message: 'Render 백엔드 서버에 연결 중입니다. 잠시 후 다시 시도해 주세요.',
          details: err.message
        }), {
          status: 503,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // 2. 그 외 일반 HTML, JS, CSS, 이미지 등 정적 파일은 Cloudflare 에셋에서 직접 서빙
    return env.ASSETS.fetch(request);
  }
};
