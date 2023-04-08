import gitlog from 'gitlog';
import moment from 'moment';
import { BATCH_PROJECT_EDITOR_COMMIT_SIGNATURE } from '../../config';
import { IAggregator, IAggregatorOptions } from '../IAggregator';

/**
 * Interface for the result of GitHours ⁘
 */
interface IGitHoursResult {
    outCommitsCount: number;
    allCommitsCount: number;
    leadingCommitsCount: number;
    commitsCount: number;
    time: moment.Duration;

    // <- TODO: [🎆] Would be this automatically annotated even if there is not @ mark for each prop
}

/**
 * Class that implements the IAggregator interface for GitHoursResult ⁘
 */
export class gitHours implements IAggregator<IGitHoursResult> {
    public initial = {
        outCommitsCount: 0,
        allCommitsCount: 0,
        leadingCommitsCount: 0,
        commitsCount: 0,
        time: moment.duration({ minutes: 0 }),
    };

    public async run({ projectPath }: IAggregatorOptions) {
        const allCommits = await gitlog({
            repo: projectPath,
            number: 100000 /* <- TODO: Want Infinite */,
            // author: "Dom Harrington",
            fields: [
                'hash',
                'abbrevHash',
                'subject',
                'authorName',
                'authorDate',
                'committerDate',
                'body',
                /* <- TODO: Filter only needed */
            ],
            execOptions: { maxBuffer: 1000 * 1024 * 1024 * 1024 * 1024 /* <- TODO: Want Infinite */ },
        });

        const commits = allCommits.filter(({ body }) => !body.includes(BATCH_PROJECT_EDITOR_COMMIT_SIGNATURE));

        // !! Better name for outCommitsCount
        let outCommitsCount = 0;
        let leadingCommitsCount = 0;
        let time = moment.duration({ minutes: 0 });
        let lastDate: null | Date = null;
        for (const commit of commits) {
            const { subject, authorDate, body } = commit; /* <- TODO: Destruct in for loop */
            const currentDate = new Date(authorDate);

            if (
                !(
                    currentDate.getTime() > new Date(`2022-11-1`).getTime() &&
                    currentDate.getTime() > new Date(`2022-12-31`).getTime()
                )
            ) {
                // TODO: !! Time span should be passed as a parameter
                // TODO: !! leading times should be before this
                outCommitsCount++;
                continue;
            }

            if (lastDate) {
                let commitTime = moment.duration({ milliseconds: lastDate.getTime() - currentDate.getTime() });

                if (
                    commitTime.asHours() > 2
                    /* <- TODO: Configurable */
                    /* <- TODO: Add different limit through different daytimes (4h day, 2h night) */
                ) {
                    // console.info('___');
                    leadingCommitsCount++;
                    commitTime = moment.duration({
                        minutes: 30 /* <- TODO: [🐎] LERP average duration of commit according to additions/deletions */,
                    });
                }

                time.add(commitTime);

                // console.info(subject, ' took ', commitTime.humanize(), ` changed ${commit.files.length} file`, body);

                // TODO: [🐎] Analyze (and report if) that duration is not totally different (40%) from avarage
            }
            lastDate = currentDate;
        }

        //console.log(commits);

        return {
            outCommitsCount,
            allCommitsCount: allCommits.length,
            leadingCommitsCount,
            commitsCount: commits.length,
            time,
        };
    }

    public join(a: IGitHoursResult, b: IGitHoursResult) {
        return {
            outCommitsCount: a.outCommitsCount + b.outCommitsCount,
            allCommitsCount: a.allCommitsCount + b.allCommitsCount,
            leadingCommitsCount: a.leadingCommitsCount + b.leadingCommitsCount,
            commitsCount: a.commitsCount + b.commitsCount,
            time: a.time.add(b.time),
        };
        // TODO: return joinObjects(a,b);
    }

    public print(result: IGitHoursResult) {
        const { time } = result;
        return {
            ...result,
            time: time.humanize(),
            timeAsHours: Math.round(time.asHours() * 100) / 100,
        };
    }
}

/**
 * Note: All important gitHours TODOs are marked with [🐎]
 * TODO: [🐎] Split by months
 * TODO: [🐎] Split subprojects by purpose
 * TODO: [🐎] Filter out generated code
 * TODO: [🐎] Special rules for non-text-edited files (Like Inkscape SVG)
 * TODO: [🐎] LERP should be file-specific like svgs-to-svgs, ts(x)-to-ts(x) ,...
 * TODO: [🐎] Filter the work by the author (to be able to count work on the forks)
 * TODO: [🐎] Count all branches
 * TODO: [🐎] Check that here all all the commits
 * TODO: What is the difference between authorDate and committerDate
 */
