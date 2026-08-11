import type { PageServerLoad } from './$types';
import { topByHitsStreak, topByDailyStreak } from '$lib/server/db/stats';

export const load: PageServerLoad = async () => {
	const [hits, daily] = await Promise.all([topByHitsStreak(10), topByDailyStreak(10)]);
	return { hits, daily };
};
