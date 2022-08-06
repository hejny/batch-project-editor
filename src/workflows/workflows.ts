import { lines } from './000-lines/lines';
import { prettier } from './010-prettier/prettier';
import { auditDependencies } from './100-auditDependencies/auditDependencies';
import { libraryBoilerplate } from './200-libraryBoilerplate/libraryBoilerplate';
import { license } from './300-license/license';
import { description } from './310-description/description';
import { aiGeneratedWallpaper } from './315-ai-generated-wallpaper/ai-generated-wallpaper';
import { authors } from './320-authors/authors';
import { repository } from './325-repository/repository';
import { normalizePackage } from './330-normalizePackage/normalizePackage';
import { badges } from './800-badges/badges';
import { contributing } from './810-contributing/contributing';
import { partners } from './820-partners/partners';
import { branchesRemoveMerged } from './branches-remove-merged/branches-remove-merged';
import { branchesUpdateFeatures } from './branches-update-features/branches-update-features';
import { collboardModuleNames } from './collboard-module-names/collboard-module-names';
import { IWorkflow } from './IWorkflow';
import { terminalsVersion } from './terminals-version/terminalsVersion';

export const WORKFLOWS: IWorkflow[] = [
    // ...RARE_WORKFLOWS
    prettier,
    auditDependencies,
    libraryBoilerplate,
    license,
    description,
    aiGeneratedWallpaper,
    authors,
    repository,
    normalizePackage,
    badges,
    contributing,
    partners,
    terminalsVersion,
    collboardModuleNames,
    branchesRemoveMerged,
    branchesUpdateFeatures,
];

/**
 * Rare workflows are workflows that need to be used once but it would be too inefficient to run them every time.
 */

export const RARE_WORKFLOWS: IWorkflow[] = [lines];
