const fs = require('fs');
const content = fs.readFileSync('apps/server/src/lib/database.types.ts', 'utf-8');

const coachesMatch = content.match(/coaches:\s*\{[\s\S]*?Relationships:/);
if (coachesMatch) {
  console.log('COACHES TABLE DEFINITION:');
  console.log(coachesMatch[0]);
}
