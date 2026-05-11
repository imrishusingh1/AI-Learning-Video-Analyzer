import youtubedl from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs';

async function test() {
  const url = 'https://www.youtube.com/shorts/CdVNsUTQQYY';
  try {
    console.log('Fetching info...');
    const info = await youtubedl(url, { dumpSingleJson: true, noCheckCertificates: true, noWarnings: true });
    console.log('Title:', info.title);
    
    console.log('Downloading audio...');
    const outputPath = path.join(process.cwd(), 'test-audio.mp3');
    await youtubedl(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: outputPath
    });
    console.log('Downloaded successfully! File exists:', fs.existsSync(outputPath));
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
