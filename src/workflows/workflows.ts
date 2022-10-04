import { lines } from './000-lines/lines';
import { prettier } from './010-prettier/prettier';
import { updateDependency } from './105-updateDependency/updateDependency';
import { auditDependencies } from './110-auditDependencies/auditDependencies';
import { libraryBoilerplate } from './200-libraryBoilerplate/libraryBoilerplate';
import { license } from './300-license/license';
import { description } from './310-description/description';
import { descriptionInGithub } from './310-description/descriptionInGithub';
import { aiGeneratedWallpaperPrepare } from './315-ai-generated-wallpaper/0-aiGeneratedWallpaperPrepare';
import { aiGeneratedWallpaperLand } from './315-ai-generated-wallpaper/1-aiGeneratedWallpaperLand';
import { aiGeneratedWallpaperHarvest } from './315-ai-generated-wallpaper/3-aiGeneratedWallpaperHarvest';
import { aiGeneratedWallpaperPick } from './315-ai-generated-wallpaper/4-aiGeneratedWallpaperPick';
import { aiGeneratedWallpaperUseInReadme } from './315-ai-generated-wallpaper/5-aiGeneratedWallpaperUseInReadme';
import { aiGeneratedWallpaperUseInGithub } from './315-ai-generated-wallpaper/6-aiGeneratedWallpaperUseInGithub';
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
    // TODO: updateDependency('touchcontroller'),
    // TODO: updateDependency('configchecker'),
    updateDependency('waitasecond'),
    updateDependency('xyzt'),
    // TODO: updateDependency('everstorage'),
    // updateDependency('pdfmk'),
    updateDependency('destroyable'),
    updateDependency('n12'),
    updateDependency('locate-app'),
    updateDependency('spacetrim'),
    // updateDependency('save-ukraine'),
    // updateDependency('unundefined'),
    auditDependencies,
    libraryBoilerplate,
    license,
    description,
    descriptionInGithub,
    aiGeneratedWallpaperPrepare,
    aiGeneratedWallpaperLand,
    // !!! aiGeneratedWallpaperTrigger,
    aiGeneratedWallpaperHarvest,
    aiGeneratedWallpaperPick,
    aiGeneratedWallpaperUseInReadme,
    aiGeneratedWallpaperUseInGithub,
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
