import { githubOctokit, GITHUB_ORGANIZATIONS, GITHUB_USERNAME } from '../config';

export async function findAllProjectsRemote(): Promise<Record<string, string[]>> {
    const aggregatedData: Record<string, string[]> = {};

    {
        const { data } = await githubOctokit.rest.repos.listForUser({
            username: GITHUB_USERNAME,
            per_page: 100,
        });
        aggregatedData[GITHUB_USERNAME] = data.filter(({ archived }) => !archived).map(({ html_url }) => html_url);
    }

    for (const org of GITHUB_ORGANIZATIONS) {
        const { data } = await githubOctokit.rest.repos.listForOrg({
          
            org,
            per_page: 100,
        });
        aggregatedData[org] = data.filter(({ archived }) => !archived).map(({ html_url }) => html_url);
    }

    return aggregatedData;
}

/**
 * TODO: Iterate thorugh pages
 */
