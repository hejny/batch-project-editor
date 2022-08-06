import { githubOctokit, GITHUB_ORGANIZATIONS, GITHUB_USERNAME, PROJECT_FLAGS } from '../config';

export async function findAllProjectsRemote(): Promise<Record<string, URL[]>> {
    const aggregatedData: Record<string, URL[]> = {};

    {
        const { data } = await githubOctokit.rest.repos.listForUser({
            username: GITHUB_USERNAME,
            per_page: 100,
        });
        aggregatedData[GITHUB_USERNAME] = data
            // Note: Filtering archived with isProjectArchived
            //       .filter(({ archived }) => !archived)
            .map(({ html_url }) => new URL(html_url));

        for (const { html_url, private: isPrivate, archived: isArchived, fork: isFork } of data) {
            PROJECT_FLAGS[html_url] = PROJECT_FLAGS[html_url] || {};
            if (isPrivate !== undefined) {
                PROJECT_FLAGS[html_url].isPrivate = isPrivate;
            }

            if (isArchived !== undefined) {
                PROJECT_FLAGS[html_url].isArchived = isArchived;
            }

            if (isFork !== undefined) {
                PROJECT_FLAGS[html_url].isFork = isFork;
            }
        }
    }

    for (const org of GITHUB_ORGANIZATIONS) {
        const { data } = await githubOctokit.rest.repos.listForOrg({
            org,
            per_page: 100,
        });
        aggregatedData[org] = data
            // Note: Filtering archived with isProjectArchived
            //       .filter(({ archived }) => !archived)
            .map(({ html_url }) => new URL(html_url));

        for (const { html_url, private: isPrivate, archived: isArchived, fork: isFork } of data) {
            PROJECT_FLAGS[html_url] = PROJECT_FLAGS[html_url] || {};
            if (isPrivate !== undefined) {
                PROJECT_FLAGS[html_url].isPrivate = isPrivate;
            }

            if (isArchived !== undefined) {
                PROJECT_FLAGS[html_url].isArchived = isArchived;
            }

            if (isFork !== undefined) {
                PROJECT_FLAGS[html_url].isFork = isFork;
            }
        }
    }

    return aggregatedData;
}

/**
 * TODO: Iterate thorugh pages
 */
