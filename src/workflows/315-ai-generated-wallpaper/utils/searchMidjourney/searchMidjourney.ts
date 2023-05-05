import chalk from 'chalk';
import fetch from 'node-fetch';
import spaceTrim from 'spacetrim';
import { forTime } from 'waitasecond';
import { MIDJOURNEY_COOKIES } from '../../../../config';
import { forPlay } from '../../../../utils/forPlay';
import { IMidjourneyJob } from './IMidjourneyJob';

const MIDJOURNEY_AMOUNT_ON_PAGE = 50;

interface ISearchMidjourneyOptions {
    // TODO: [0] userId: number
    prompt: string | null;
    version: number | null;
    isRetrying: boolean;
}


export async function searchFromDownloaded(options: ISearchMidjourneyOptions): Promise<IMidjourneyJob[]> {
  const aggregatedResult: IMidjourneyJob[] = [];

  /*
  !!! Implement
    glob()

    for () {

  }
  */

  return aggregatedResult;
}

export async function searchMidjourney(options: ISearchMidjourneyOptions): Promise<IMidjourneyJob[]> {
    const aggregatedResult: IMidjourneyJob[] = [];

    for (let page = 1; page < 100000000 /* <- TODO: Unhardcode this limit */; page++) {
        console.info(
            chalk.blue(` ⏬  Listing midjourney page ${page} for prompt "${options.prompt?.substring(0, 100)}"`),
        );
        const pageResult = await searchMidjourneyOnPage({ ...options, page, amount: MIDJOURNEY_AMOUNT_ON_PAGE });

        console.info(
            (pageResult.length !== 0 ? chalk.gray : chalk.green)(
                `Listed ${pageResult.length} images on page ${page} for prompt "${options.prompt?.substring(0, 100)}"`,
            ),
        );

        aggregatedResult.push(...pageResult);

        if (pageResult.length < MIDJOURNEY_AMOUNT_ON_PAGE) {
            break;
        }
    }

    return aggregatedResult;
}

async function searchMidjourneyOnPage(
    options: ISearchMidjourneyOptions & { amount: number; page: number },
): Promise<IMidjourneyJob[]> {
    const { prompt, version, isRetrying, amount, page } = options;

    //toDate=2023-04-23+10%3A31%3A57.550116
    //userId=eeea95c6-92d3-43e4-94fd-3711f8d7eebe
    //user_id_ranked_score=null
    //_ql=todo&_qurl=https%3A%2F%2Fwww.midjourney.com%2Fapp%2F%3Fsearch%3DA%2Bpixel%2Bart-inspired%2Bwallpaper%2Bfeaturing%2Ba%2Bretro-style%2Brobot%252C%2Bwith%2Ba%2Blimited%2Bcolor%2Bpalette%2Band%2Bpixel
    const url = new URL(`https://www.midjourney.com/api/app/recent-jobs`);

    url.searchParams.set('amount', amount.toString());
    url.searchParams.set('page', page.toString());
    // url.searchParams.set('jobType', 'yfcc_upsample' /* <- TODO: What this means? */);
    url.searchParams.set('orderBy', 'new');
    url.searchParams.set('type', 'all');
    url.searchParams.set('jobStatus', 'completed');
    url.searchParams.set('jobType', 'upscale');
    url.searchParams.set('searchType', 'advanced');
    url.searchParams.set('service', 'null');
    url.searchParams.set('userId', 'eeea95c6-92d3-43e4-94fd-3711f8d7eebe' /* <- TODO: [0] Unhardcode */);
    // url.searchParams.set('userId', '310540068588879872' /* <- TODO: [0] Unhardcode */);
    url.searchParams.set('isPublished', 'true');
    url.searchParams.set('minRankingScore', '0' /* <- TODO: What this means? */);
    if (prompt) {
        url.searchParams.set('prompt', prompt);
    }
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
        const errorMessage = spaceTrim(`

          Internal server error on MidJourney
          ${url.href}
          Try to update MIDJOURNEY_COOKIES.__Secure-next-auth.session-token

        `);

        if (!isRetrying) {
            throw new Error(errorMessage);
        }

        console.info(
            chalk.gray(
                spaceTrim(
                    (block) => `
                        ${block(errorMessage)}

                        Retrying after 30 seconds...
                    `,
                ),
            ),
            { json },
        );

        await forTime(1000 * 30);
        await forPlay();

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
        jobs = jobs.filter((job) => job._parsed_params?.version === version);
    }
    return jobs;
}

/**
 * TODO: [0] Unhardcode userId=310540068588879872
 */
