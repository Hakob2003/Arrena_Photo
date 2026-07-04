const fs = require('fs');
const files = [
  'apps/frontend/app/profile/billing/tabs/UsageTab.tsx',
  'apps/frontend/app/profile/billing/tabs/PaymentTab.tsx',
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$').replace(/\\\\D/g, '\\D').replace(/\\\\s/g, '\\s');
  fs.writeFileSync(file, content);
});
console.log('Fixed files');
