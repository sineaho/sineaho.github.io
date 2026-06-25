const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const ytdlpPath = path.join(__dirname, 'yt-dlp.exe');
const uploadsDir = path.join(__dirname, '..', 'uploads');
const outputDir = path.join(__dirname, '..', 'output');

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = num => String(num).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// 1. Get YouTube video metadata
function getYoutubeInfo(url) {
  return new Promise((resolve, reject) => {
    // Run yt-dlp in dump-json mode
    const cmd = `"${ytdlpPath}" -j "${url}"`;
    exec(cmd, { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
      if (err) {
        console.error('[ytdlp] Failed to get info:', stderr || err.message);
        return reject(new Error('유튜브 동영상 정보를 가져오지 못했습니다. 주소를 확인해 주세요.'));
      }
      try {
        const metadata = JSON.parse(stdout);
        resolve({
          title: metadata.title,
          duration: metadata.duration || 0, // in seconds
          thumbnail: metadata.thumbnail || (metadata.thumbnails && metadata.thumbnails.length > 0 ? metadata.thumbnails[metadata.thumbnails.length - 1].url : '')
        });
      } catch (parseErr) {
        reject(new Error('유튜브 정보를 파싱하지 못했습니다.'));
      }
    });
  });
}

// 2. Extract segment using ffmpeg
function runFfmpeg({ inputPath, outputPath, startTime, endTime, outputFormat, ratio, fps, quality, isYoutubeSegment = false }) {
  return new Promise((resolve, reject) => {
    // Quality for webp range is 0-100. Let's make sure it's an integer.
    const q = Math.min(Math.max(parseInt(quality) || 80, 10), 100);
    
    // FPS config: default 15
    const f = Math.min(Math.max(parseInt(fps) || 15, 1), 60);
    
    // Scale ratio conversion: e.g. 50% ratio becomes scale=iw*0.5:-1, or 100% is scale=iw:-1.
    // If ratio is a decimal float, say 0.5:
    const scaleFactor = parseFloat(ratio) || 0.5;
    
    let vfFilter = `fps=${f},scale=iw*${scaleFactor}:-1`;
    
    // If we're exporting a GIF, we want to create a high-quality palette first
    if (outputFormat === 'gif') {
      vfFilter = `fps=${f},scale=iw*${scaleFactor}:-1,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;
    }

    let cmd = '';
    
    if (isYoutubeSegment) {
      // YouTube segment is already cut, so we don't need to seek -ss and -to
      if (outputFormat === 'gif') {
        cmd = `ffmpeg -y -i "${inputPath}" -vf "${vfFilter}" "${outputPath}"`;
      } else {
        // webp conversion
        cmd = `ffmpeg -y -i "${inputPath}" -vf "${vfFilter}" -loop 0 -vcodec libwebp -q:v ${q} "${outputPath}"`;
      }
    } else {
      // Local file, we seek with -ss and -to (which is fast if placed before -i)
      const seekStart = parseFloat(startTime) || 0;
      const seekEnd = parseFloat(endTime) || 0;
      const duration = Math.max(seekEnd - seekStart, 0.1);
      
      if (outputFormat === 'gif') {
        cmd = `ffmpeg -y -ss ${seekStart} -t ${duration} -i "${inputPath}" -vf "${vfFilter}" "${outputPath}"`;
      } else {
        // webp conversion
        cmd = `ffmpeg -y -ss ${seekStart} -t ${duration} -i "${inputPath}" -vf "${vfFilter}" -loop 0 -vcodec libwebp -q:v ${q} "${outputPath}"`;
      }
    }

    console.log('[ffmpeg] Executing:', cmd);
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      if (err) {
        console.error('[ffmpeg] Conversion failed:', stderr || err.message);
        if (fs.existsSync(outputPath)) {
          try {
            fs.unlinkSync(outputPath);
          } catch (unlinkErr) {
            console.error('[ffmpeg] Failed to clean up partial output:', unlinkErr.message);
          }
        }
        return reject(new Error('비디오 변환 인코딩에 실패했습니다.'));
      }
      resolve(outputPath);
    });
  });
}

// 3. YouTube Segment extract
function extractYoutubeSegment(url, startTime, endTime, outputFormat, ratio, fps, quality) {
  return new Promise(async (resolve, reject) => {
    const timestamp = Date.now();
    const tempVideoPath = path.join(uploadsDir, `yt_temp_${timestamp}.mp4`);
    const outputFileName = `extracted_${timestamp}.${outputFormat}`;
    const outputPath = path.join(outputDir, outputFileName);

    const startSec = parseFloat(startTime) || 0;
    const endSec = parseFloat(endTime) || 0;
    
    const timeRangeString = `*${formatTime(startSec)}-${formatTime(endSec)}`;
    console.log(`[ytdlp] Slicing section: ${timeRangeString}`);

    // Call yt-dlp with --download-sections
    const cmd = `"${ytdlpPath}" -f "best[ext=mp4]/best" --download-sections "${timeRangeString}" --force-keyframes-at-cuts "${url}" -o "${tempVideoPath}"`;
    
    console.log('[ytdlp] Executing:', cmd);
    exec(cmd, { maxBuffer: 1024 * 1024 * 20 }, async (err, stdout, stderr) => {
      if (err) {
        console.error('[ytdlp] Download failed:', stderr || err.message);
        // Clean up temp video if created
        if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
        return reject(new Error('유튜브 영상을 다운로드하는 과정에서 오류가 발생했습니다. (구간이 너무 길거나 주소 만료)'));
      }

      // Convert downloaded temp video segment
      try {
        await runFfmpeg({
          inputPath: tempVideoPath,
          outputPath,
          startTime,
          endTime,
          outputFormat,
          ratio,
          fps,
          quality,
          isYoutubeSegment: true
        });

        // Clean up temp video
        if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
        
        resolve({
          outputPath,
          fileName: outputFileName
        });
      } catch (convErr) {
        if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
        reject(convErr);
      }
    });
  });
}

// 4. Local File Segment extract
async function extractLocalSegment(tempFilePath, startTime, endTime, outputFormat, ratio, fps, quality) {
  const timestamp = Date.now();
  const outputFileName = `extracted_${timestamp}.${outputFormat}`;
  const outputPath = path.join(outputDir, outputFileName);

  try {
    await runFfmpeg({
      inputPath: tempFilePath,
      outputPath,
      startTime,
      endTime,
      outputFormat,
      ratio,
      fps,
      quality,
      isYoutubeSegment: false
    });

    return {
      outputPath,
      fileName: outputFileName
    };
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getYoutubeInfo,
  extractYoutubeSegment,
  extractLocalSegment
};
