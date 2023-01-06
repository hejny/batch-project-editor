import chalk from 'chalk';
import fetch from 'node-fetch';
import spaceTrim from 'spacetrim';
import { forTime } from 'waitasecond';
import { MIDJOURNEY_COOKIES } from '../../../../config';
import { IMidjourneyJob } from './IMidjourneyJob';

interface ISearchMidjourneyOptions {
    // TODO: [0] userId: number
    prompt: string;
    version: number | null;
}

export async function searchMidjourney(options: ISearchMidjourneyOptions): Promise<IMidjourneyJob[]> {
    const { prompt, version } = options;

    const url = new URL(`https://www.midjourney.com/api/app/recent-jobs/`);

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

    const json = await response.text().then((jsonText) => {
        try {
            return JSON.parse(jsonText);
        } catch (error) {
            return { msg: 'Error: Internal server error', error, jsonText };
        }
    });

    if (json.msg === 'Error: Internal server error') {
        console.info(
            chalk.gray(
                spaceTrim(`

                  Internal server error on MidJourney
                  ${url.href}
                  Try to update MIDJOURNEY_COOKIES.__Secure-next-auth.session-token

                  Retrying after 5 minutes...

                `),
            ),
            { json },
        );
        await forTime(1000 * 60 * 5);
        return searchMidjourney(options);
    }

    if (!Array.isArray(json)) {
        // TODO: [🏯][🏯]!! This error should not occur on any project - TODO: Make some warning mechanism
        throw new Error(`Expected array, got ${JSON.stringify(json)}`);
    }

    if (json.length === 1 && json[0].msg === 'No jobs found.') {
        return [];
    }

    let jobs = json as IMidjourneyJob[];

    if (version !== null) {
        jobs = jobs.filter((job) => job.version === version);
    }
    return jobs;
}

/**
 * TODO: [0] Unhardcode userId=310540068588879872
 */
