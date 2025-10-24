import * as XLSX from "xlsx";
import { resolve } from "path";

const excelPath = resolve(process.cwd(), "apps/web/data-import/Coach List.xlsx");
const workbook = XLSX.readFile(excelPath);
const coachesSheet = workbook.Sheets["Upload - coaches"];
const coaches = XLSX.utils.sheet_to_json(coachesSheet);

console.log(`Total coaches in sheet: ${coaches.length}`);

// Count coaches with at least one non-empty field
let withData = 0;
let withoutData = 0;
const samples: any[] = [];

for (const coach of coaches as any[]) {
	const hasTwitter =
		coach.twitter_profile &&
		coach.twitter_profile !== "-" &&
		coach.twitter_profile.trim();
	const hasLinkedIn =
		coach.linkedin_profile &&
		coach.linkedin_profile !== "-" &&
		coach.linkedin_profile.trim();
	const hasInstagram =
		coach.instagram_profile &&
		coach.instagram_profile !== "-" &&
		coach.instagram_profile.trim();

	if (hasTwitter || hasLinkedIn || hasInstagram) {
		withData++;
	} else {
		withoutData++;
		if (samples.length < 10) {
			samples.push(coach);
		}
	}
}

console.log(`\nCoaches WITH social media data: ${withData}`);
console.log(`Coaches WITHOUT social media data: ${withoutData}`);
console.log(`\nSample coaches without data:`);
for (const sample of samples.slice(0, 5)) {
	console.log(
		`  - ${sample.full_name}: twitter="${sample.twitter_profile}" linkedin="${sample.linkedin_profile}" instagram="${sample.instagram_profile}"`,
	);
}
