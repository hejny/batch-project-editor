import gitlog from 'gitlog';
import moment from 'moment';
import { BATCH_PROJECT_EDITOR_COMMIT_SIGNATURE } from '../../config';
import { IAggregator, IAggregatorOptions } from '../IAggregator';

interface IGitHoursResult {
    allCommitsCount: number;
    filteredCommitsCount: number;
}

export class gitHours implements IAggregator<IGitHoursResult> {
    public initial = {
        allCommitsCount: 0,
        filteredCommitsCount: 0,
    };

    public async run({ projectPath }: IAggregatorOptions) {
        /*
        !!! rEMOVE
        const commitsString = await execCommandOnProject(
            `git log --pretty=format:'{%n  "commit": "%H",%n  "abbreviated_commit": "%h",%n  "tree": "%T",%n  "abbreviated_tree": "%t",%n  "parent": "%P",%n  "abbreviated_parent": "%p",%n  "refs": "%D",%n  "encoding": "%e",%n  "subject": "%s",%n  "sanitized_subject_line": "%f",%n  "body": "%b",%n  "commit_notes": "%N",%n  "verification_flag": "%G?",%n  "signer": "%GS",%n  "signer_key": "%GK",%n  "author": {%n    "name": "%aN",%n    "email": "%aE",%n    "date": "%aD"%n  },%n  "commiter": {%n    "name": "%cN",%n    "email": "%cE",%n    "date": "%cD"%n  }%n},'`,
        );
        const commits = JSON.parse(commitsString);

        */

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

        // !!! Exculude = skip BPE

        const filteredCommits = allCommits.filter(({ body }) => !body.includes(BATCH_PROJECT_EDITOR_COMMIT_SIGNATURE));

        let lastDate: null | Date = null;
        for (const commit of filteredCommits) {
            const { subject, authorDate, body } = commit; /* <- TODO: Destruct in for loop */
            const currentDate = new Date(authorDate);

            if (lastDate) {
                const duration = moment.duration({ milliseconds: lastDate.getTime() - currentDate.getTime() });

                if (duration.asHours() > 2 /* <- TODO: Configurable */) {
                    console.log('___');
                    // !!! TODO: LERP average duration of commit according to additions/deletions
                }

                // console.log(duration.asHours());
                console.log(subject, ' took ', duration.humanize(), ` changed ${commit.files.length} file`, body);

                // !!! TODO: Analyze that duration is not totally different (40%) from avarage

                // console.log(commit);
            }
            lastDate = currentDate;
        }

        //console.log(commits);

        return {
            allCommitsCount: allCommits.length,
            filteredCommitsCount: filteredCommits.length,
        };
    }

    public join(a: IGitHoursResult, b: IGitHoursResult) {
        return {
            allCommitsCount: a.allCommitsCount + b.allCommitsCount,
            filteredCommitsCount: a.filteredCommitsCount + b.filteredCommitsCount,
        };
        // TODO: return joinObjects(a,b);
    }

    public print(value: IGitHoursResult) {
        return value;
    }
}

/**
 * TODO: !!! Check that here all all the commits
 * TODO: What is the difference between authorDate and committerDate
 */
