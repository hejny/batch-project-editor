import { IWorkflowOptions } from '../IWorkflow';

export function pickPartnersForProject({
    projectUrl,
    projectOrg,
    projectName,
}: Pick<IWorkflowOptions, 'projectUrl' | 'projectOrg' | 'projectName'>) {
    const { hedu, collboard, czechevents, sigmastamp } = ORGANIZATIONS;

    switch (projectOrg) {
        case 'hejny':
            // TODO: Only for libraries, for non-libraties, use []
            return [collboard, czechevents, sigmastamp];
        case 'collboard':
            return [hedu, collboard];
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
    },
    collboard: {
        title: `Collboard`,
        url: new URL(`https://Collboard.com/`),
        logoSrc: new URL(`https://collboard.fra1.cdn.digitaloceanspaces.com/assets/18.12.1/logo-small.png`),
    },
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
};
