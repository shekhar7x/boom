import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

class FFmpegService {
  constructor() {
    this.ffmpeg = null;
    this.loaded = false;
    this.loading = false;
  }

  async load(onProgress) {
    if (this.loaded) return;
    if (this.loading) {
      // Wait for loading to complete
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.loading = true;

    try {
      this.ffmpeg = new FFmpeg();

      this.ffmpeg.on('log', ({ message }) => {
        console.log('FFmpeg:', message);
      });

      this.ffmpeg.on('progress', ({ progress, time }) => {
        if (onProgress) {
          onProgress(Math.round(progress * 100));
        }
      });

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      this.loaded = true;
      this.loading = false;
    } catch (error) {
      this.loading = false;
      console.error('Error loading FFmpeg:', error);
      throw error;
    }
  }

  async trimVideo(videoBlob, startTime, endTime, onProgress) {
    await this.load(onProgress);

    try {
      const inputName = 'input.webm';
      const outputName = 'output.mp4';

      // Write input file
      await this.ffmpeg.writeFile(inputName, await fetchFile(videoBlob));

      // Calculate duration
      const duration = endTime - startTime;

      // Trim video
      await this.ffmpeg.exec([
        '-i', inputName,
        '-ss', startTime.toString(),
        '-t', duration.toString(),
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'fast',
        outputName
      ]);

      // Read output file
      const data = await this.ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer], { type: 'video/mp4' });

      // Cleanup
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);

      return blob;
    } catch (error) {
      console.error('Error trimming video:', error);
      throw error;
    }
  }

  async splitVideo(videoBlob, splitPoints, onProgress) {
    await this.load(onProgress);

    try {
      const inputName = 'input.webm';
      await this.ffmpeg.writeFile(inputName, await fetchFile(videoBlob));

      const segments = [];
      const sortedPoints = [0, ...splitPoints].sort((a, b) => a - b);

      for (let i = 0; i < sortedPoints.length; i++) {
        const startTime = sortedPoints[i];
        const endTime = sortedPoints[i + 1];
        const outputName = `segment_${i}.mp4`;

        if (endTime !== undefined) {
          const duration = endTime - startTime;

          await this.ffmpeg.exec([
            '-i', inputName,
            '-ss', startTime.toString(),
            '-t', duration.toString(),
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-preset', 'fast',
            outputName
          ]);

          const data = await this.ffmpeg.readFile(outputName);
          const blob = new Blob([data.buffer], { type: 'video/mp4' });
          segments.push({
            blob,
            startTime,
            endTime,
            index: i,
          });

          await this.ffmpeg.deleteFile(outputName);
        } else {
          // Last segment to end of video
          await this.ffmpeg.exec([
            '-i', inputName,
            '-ss', startTime.toString(),
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-preset', 'fast',
            outputName
          ]);

          const data = await this.ffmpeg.readFile(outputName);
          const blob = new Blob([data.buffer], { type: 'video/mp4' });
          segments.push({
            blob,
            startTime,
            endTime: null,
            index: i,
          });

          await this.ffmpeg.deleteFile(outputName);
        }

        if (onProgress) {
          onProgress(Math.round(((i + 1) / sortedPoints.length) * 100));
        }
      }

      await this.ffmpeg.deleteFile(inputName);
      return segments;
    } catch (error) {
      console.error('Error splitting video:', error);
      throw error;
    }
  }

  async joinVideos(videoBlobs, onProgress) {
    await this.load(onProgress);

    try {
      // Write all input files
      const inputFiles = [];
      for (let i = 0; i < videoBlobs.length; i++) {
        const inputName = `input_${i}.webm`;
        await this.ffmpeg.writeFile(inputName, await fetchFile(videoBlobs[i]));
        inputFiles.push(inputName);
      }

      // Create concat file
      const concatContent = inputFiles.map(f => `file '${f}'`).join('\n');
      await this.ffmpeg.writeFile('concat.txt', concatContent);

      const outputName = 'output.mp4';

      // Join videos
      await this.ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'fast',
        outputName
      ]);

      // Read output
      const data = await this.ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer], { type: 'video/mp4' });

      // Cleanup
      for (const inputFile of inputFiles) {
        await this.ffmpeg.deleteFile(inputFile);
      }
      await this.ffmpeg.deleteFile('concat.txt');
      await this.ffmpeg.deleteFile(outputName);

      return blob;
    } catch (error) {
      console.error('Error joining videos:', error);
      throw error;
    }
  }

  async convertVideo(videoBlob, outputFormat = 'mp4', quality = 'medium', onProgress) {
    await this.load(onProgress);

    try {
      const inputName = 'input.webm';
      const outputName = `output.${outputFormat}`;

      await this.ffmpeg.writeFile(inputName, await fetchFile(videoBlob));

      const qualitySettings = {
        high: ['-crf', '18', '-preset', 'slow'],
        medium: ['-crf', '23', '-preset', 'medium'],
        low: ['-crf', '28', '-preset', 'fast'],
      };

      const settings = qualitySettings[quality] || qualitySettings.medium;

      await this.ffmpeg.exec([
        '-i', inputName,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        ...settings,
        outputName
      ]);

      const data = await this.ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer], { type: `video/${outputFormat}` });

      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);

      return blob;
    } catch (error) {
      console.error('Error converting video:', error);
      throw error;
    }
  }

  async extractThumbnail(videoBlob, timeInSeconds = 1) {
    await this.load();

    try {
      const inputName = 'input.webm';
      const outputName = 'thumbnail.jpg';

      await this.ffmpeg.writeFile(inputName, await fetchFile(videoBlob));

      await this.ffmpeg.exec([
        '-i', inputName,
        '-ss', timeInSeconds.toString(),
        '-vframes', '1',
        '-q:v', '2',
        outputName
      ]);

      const data = await this.ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer], { type: 'image/jpeg' });

      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);

      return blob;
    } catch (error) {
      console.error('Error extracting thumbnail:', error);
      throw error;
    }
  }

  async getVideoInfo(videoBlob) {
    await this.load();

    try {
      const inputName = 'input.webm';
      await this.ffmpeg.writeFile(inputName, await fetchFile(videoBlob));

      // This is a simplified version - in production you'd parse ffprobe output
      await this.ffmpeg.deleteFile(inputName);

      return {
        duration: 0, // Would need to parse from ffprobe
        width: 0,
        height: 0,
        codec: 'unknown',
      };
    } catch (error) {
      console.error('Error getting video info:', error);
      throw error;
    }
  }
}

export default new FFmpegService();
