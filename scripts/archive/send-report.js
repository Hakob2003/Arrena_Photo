const fs = require('fs');
const path = require('path');

const TOKEN = '8896113397:AAHk6KgIwoEqMxTSi0lCenmm5ueLGxwZAWA';
const CHAT_ID = '837636006';

async function sendDocument(filePath) {
  if (!filePath) {
    console.error('Please provide a file path');
    process.exit(1);
  }
  const fileName = path.basename(filePath);
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  
  let body = '';
  body += '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="chat_id"\r\n\r\n';
  body += CHAT_ID + '\r\n';
  body += '--' + boundary + '\r\n';
  body += `Content-Disposition: form-data; name="document"; filename="${fileName}"\r\n`;
  body += 'Content-Type: text/markdown\r\n\r\n';
  
  const fileData = fs.readFileSync(filePath);
  
  const endBoundary = '\r\n--' + boundary + '--\r\n';
  
  const payload = Buffer.concat([
    Buffer.from(body, 'utf8'),
    fileData,
    Buffer.from(endBoundary, 'utf8')
  ]);

  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendDocument`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: payload
    });
    const data = await res.json();
    if (data.ok) {
      console.log('Report sent successfully to Telegram.');
    } else {
      console.error('Failed to send report:', data);
    }
  } catch (error) {
    console.error('Error sending report:', error);
  }
}

sendDocument(process.argv[2]);
