import chalk from 'chalk';
import { forTime } from 'waitasecond';
import { MIDJOURNEY_COOKIES } from '../../../../config';
import { IMidjourneyJob } from './IMidjourneyJob';

interface ISearchMidjourneyOptions {
    // TODO: [0] userId: number
    prompt: string;
}

export async function searchMidjourney(options: ISearchMidjourneyOptions): Promise<IMidjourneyJob[]> {
    const { prompt } = options;

    const url = new URL(` https://www.midjourney.com/api/app/recent-jobs/`);

    url.searchParams.set('amount', '500' /* <- TODO: Implement pagination */);
    url.searchParams.set('jobType', 'yfcc_upsample' /* <- TODO: What this means? */);
    url.searchParams.set('orderBy', 'new');
    url.searchParams.set('jobStatus', 'completed');
    url.searchParams.set('userId', '310540068588879872' /* <- TODO: [0] Unhardcode */);
    url.searchParams.set('isPublished', 'true');
    url.searchParams.set('minRankingScore', '0' /* <- TODO: What this means? */);
    url.searchParams.set('prompt', prompt);
    url.searchParams.set('dedupe', 'true' /* <- TODO: What this means? */);
    url.searchParams.set('refreshApi', '0' /* <- TODO: What this means? */);

    const cookie = Object.entries(MIDJOURNEY_COOKIES)
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');

    const response = await fetch(url.href, {
        headers: {
            cookie,
        },
    });

    const json = await response.json();

    if (json.msg === 'Internal server error') {
        await forTime(1000 * 60 * 5);
        console.info(chalk.gray('Internal server error on MidJourney, retrying after 5 minutes...'));
        return searchMidjourney(options);
    }

    if (!Array.isArray(json)) {
        // TODO: !!! This error should not occur on any project - TODO: Make some warning mechanism
        throw new Error(`Expected array, got ${JSON.stringify(json)}`);
    }

    if (json.length === 1 && json[0].msg === 'No jobs found.') {
        return [];
    }

    const jobs = json as IMidjourneyJob[];

    return jobs;
}

/**
 * TODO: [0] Unhardcode userId=310540068588879872
 */
