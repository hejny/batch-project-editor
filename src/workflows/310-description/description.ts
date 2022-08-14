import markdownToTxt from 'markdown-to-txt';
import fetch from 'node-fetch';
import { GITHUB_TOKEN } from '../../config';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export const DESCRIPTION_IN_MARKDOWN =
    /(?<heading>^#[^\n]*$)(\s*)((<!--Badges-->(?<badges>.*)<!--\/Badges-->)?)(\s*)(?<description>^.*?$)?(\n{2,})/ims;

export async function description({
    projectOrg,
    projectName,
    readFile,
    modifyPackage,
    commit,
    skippingBecauseOf,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const description = (await readFile('README.md')).match(DESCRIPTION_IN_MARKDOWN)?.groups?.description;

    if (!description) {
        return skippingBecauseOf(`No description extracted from README.md`);
    }

    let descriptionText = markdownToTxt(description).split('\n').join(' ');

    descriptionText = descriptionText.split(' created via @collboard/modules-sdk.').join('');

    await modifyPackage((packageJson) => {
        packageJson.description = descriptionText;
    });
    return commit('✍🏻 Description of the project into package.json');

    // TODO: !!! Probbably call it only if there is an unupdated description
    const response = await fetch(`https://api.github.com/repos/${projectOrg}/${projectName}`, {
        method: 'PATCH',
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
        body: JSON.stringify({ description: descriptionText }),
    });
    console.info({ response });
}

// ✍🏾 ✍🏼 ✍🏿 ✍🏽 📓
// !!! Fulltext rename projectOrg to projectOwner

/*
  TODO: Make with graphql

  githubOctokit.graphql(`
    mutation{
      updateRepository(){

      }
    }
  `);
*/

/*

  Note: I just can not figure out how to make this call via Octokit work (so I made it through raw rest call):

  const result = await githubOctokit.rest.repos.update({
      owner: projectOrg,
      repo: projectName,
      description: descriptionText,
  });

*/

/**
 * TODO: [🏨] Some common config to parse readme - DESCRIPTION_IN_MARKDOWN
 */