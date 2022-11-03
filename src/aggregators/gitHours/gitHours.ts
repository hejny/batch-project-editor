import gitlog from 'gitlog';
import moment from 'moment';
import { BATCH_PROJECT_EDITOR_COMMIT_SIGNATURE } from '../../config';
import { IAggregator, IAggregatorOptions } from '../IAggregator';

interface IGitHoursResult {
    allCommitsCount: number;
    leadingCommitsCount: number;
    commitsCount: number;
    time: moment.Duration;
}

export class gitHours implements IAggregator<IGitHoursResult> {
    public initial = {
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

        let leadingCommitsCount = 0;
        let time = moment.duration({ minutes: 0 });
        let lastDate: null | Date = null;
        for (const commit of commits) {
            const { subject, authorDate, body } = commit; /* <- TODO: Destruct in for loop */
            const currentDate = new Date(authorDate);

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
            allCommitsCount: allCommits.length,
            leadingCommitsCount,
            commitsCount: commits.length,
            time,
        };
    }

    public join(a: IGitHoursResult, b: IGitHoursResult) {
        return {
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
 * TODO: [🐎] Filter the work by the author (to be able to count work on the forks)
 * TODO: [🐎] Count all branches
 * TODO: [🐎] Check that here all all the commits
 * TODO: What is the difference between authorDate and committerDate
 */
