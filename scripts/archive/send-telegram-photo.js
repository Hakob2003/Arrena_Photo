const fs = require('fs');
const FormData = require('form-data');

const TOKEN = '8896113397:AAHk6KgIwoEqMxTSi0lCenmm5ueLGxwZAWA';
const configPath = require('path').join('C:\\Users\\hakob\\.gemini\\antigravity-ide\\brain\\ca80cc29-221e-47c1-9cd3-87eca21c8834\\scratch', 'telegram-config.json');

async function sendPhoto(photoPath, caption) {
  if (!fs.existsSync(configPath)) {
    console.error('No chat ID config found.');
    return;
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const chatId = config.allowedChatId;
  
  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('photo', fs.createReadStream(photoPath));
  if (caption) {
    form.append('caption', caption);
  }

  try {
    const { default: fetch } = await import('node-fetch'); // if next.js environment, fetch might be global or we need node-fetch, but FormData with native fetch is tricky in older Node. 
    // Actually, in Node 20 (which is used here), we can use native fetch with FormData from 'formdata-node' or just use form-data's built in submit method.
  } catch (e) {}

  // Better way using form.submit
  form.submit(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, function(err, res) {
    if (err) {
      console.error('Failed to send photo:', err);
    } else {
      console.log('Photo sent successfully. Status:', res.statusCode);
      res.resume(); // consume response body
    }
  });
}

const photoPath = process.argv[2];
const caption = process.argv[3] || 'Скриншот';

if (!photoPath) {
  console.error('Usage: node send-telegram-photo.js <path_to_photo> [caption]');
  process.exit(1);
}

sendPhoto(photoPath, caption);
