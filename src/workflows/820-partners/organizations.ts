import { IWorkflowOptions } from '../IWorkflow';

export function pickPartnersForProject({
    projectUrl,
    projectOrg,
    projectName,
}: Pick<IWorkflowOptions, 'projectUrl' | 'projectOrg' | 'projectName'>) {
    const { hedu, collboard, webgpt, promptbook, czechevents, sigmastamp } = ORGANIZATIONS;

    switch (projectOrg) {
        case 'webgptorg':
            return [webgpt, promptbook];
        case 'hejny':
            // TODO: Only for libraries, for non-libraties, use []
            return [collboard, webgpt];
        case 'collboard':
            return [
                /*hedu, collboard*/
            ];
        case 'sigmastamp':
            return [collboard, czechevents, sigmastamp];

        default:
            return [];
    }
}

const ORGANIZATIONS = {
    hedu: {
        title: `H-edu`,
        url: new URL(`https://www.h-edu.org/`),
        logoSrc: new URL(`https://www.h-edu.org/media/favicon.png`),
        width: 50,
    },
    collboard: {
        title: `Collboard`,
        url: new URL(`https://collboard.com/`),
        logoSrc: new URL(`https://collboard.fra1.cdn.digitaloceanspaces.com/assets/18.12.1/logo-small.png`),
        width: 50,
    },
    webgpt: {
        title: `WebGPT`,
        url: new URL(`https://github.com/webgptorg/promptbook`),
        logoSrc: new URL(`https://raw.githubusercontent.com/webgptorg/promptbook/main/other/design/logo-render-h1.png`),
        width: 70,
    },
    promptbook: {
        title: `Promptbook`,
        url: new URL(
            `https://webgpt.cz/?partner=ph&utm_medium=referral&utm_source=github-readme&utm_campaign=partner-ph`,
        ),
        logoSrc: new URL(`https://raw.githubusercontent.com/webgptorg/promptbook/main/other/design/logo.png`),
        width: 45,
    },
    //----
    czechevents: {
        title: `Czech.events`,
        url: new URL(`https://czech.events/`),
        logoSrc: new URL(`https://czech.events/design/logos/czech.events.transparent-logo.png`),
        width: 50,
    },
    sigmastamp: {
        title: `SigmaStamp`,
        url: new URL(`https://sigmastamp.ml/`),
        logoSrc: new URL(`https://www.sigmastamp.ml/sigmastamp-logo.white.svg`),
        width: 50,
    },
};
