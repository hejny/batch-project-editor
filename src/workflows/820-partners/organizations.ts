import { IWorkflowOptions } from '../IWorkflow';

export function pickPartnersForProject({
    projectUrl,
    projectOrg,
    projectName,
}: Pick<IWorkflowOptions, 'projectUrl' | 'projectOrg' | 'projectName'>) {
    const { hedu, collboard, webgpt, promptbook } = ORGANIZATIONS;

    switch (projectOrg) {
        case 'webgptorg':
            return [webgpt, promptbook];
        case 'hejny':
            // TODO: Only for libraries, for non-libraties, use []
            return [collboard, webgpt, promptbook];
        case 'collboard':
            return [
                collboard,
                /*hedu, collboard*/
            ];

        default:
            return [];
    }
}

const ORGANIZATIONS = {
    hedu: {
        title: `H-edu`,
        url: new URL(`https://www.h-edu.org/`),
        logoLightModeSrc: new URL(`https://www.h-edu.org/media/favicon.png`),
        logoDarkModeSrc: new URL(`https://www.h-edu.org/media/favicon.png`),
        height: 60,
    },
    collboard: {
        title: `Collboard`,
        url: new URL(`https://collboard.com/`),
        logoLightModeSrc: new URL(`https://collboard.fra1.cdn.digitaloceanspaces.com/assets/18.12.1/logo-small.png`),
        logoDarkModeSrc: new URL(`https://collboard.fra1.cdn.digitaloceanspaces.com/assets/18.12.1/logo-small.png`),
        height: 60,
    },
    webgpt: {
        title: `WebGPT`,
        url: new URL(
            `https://webgpt.cz/?partner=ph&utm_medium=referral&utm_source=github-readme&utm_campaign=partner-ph`,
        ),
        logoLightModeSrc: new URL(`https://webgpt.cz/_next/static/media/webgpt-black.8d958d25.png`),
        logoDarkModeSrc: new URL(`https://webgpt.cz/_next/static/media/webgpt-white.7e7069eb.png`),
        height: 60,
    },
    promptbook: {
        title: `Promptbook`,
        url: new URL(`https://github.com/webgptorg/promptbook`),
        logoLightModeSrc: new URL(
            `https://raw.githubusercontent.com/webgptorg/promptbook/main/other/design/logo.png`,
        ) /* <- !!! Text after logo */,
        logoDarkModeSrc: new URL(
            `https://raw.githubusercontent.com/webgptorg/promptbook/main/other/design/logo.png`,
        ) /* <- !!! Light mode logo */,
        height: 60,
    },
    //----
    /*
    czechevents: {
        title: `Czech.events`,
        url: new URL(`https://czech.events/`),
        logoSrc: new URL(`https://czech.events/design/logos/czech.events.transparent-logo.png`),
    },
    sigmastamp: {
        title: `SigmaStamp`,
        url: new URL(`https://sigmastamp.ml/`),
        logoSrc: new URL(`https://www.sigmastamp.ml/sigmastamp-logo.white.svg`),
    },
    */
};
