import { lines } from './000-lines/lines';
import { normalizeJsons } from './000-normalizeJsons/normalizeJsons';
import { organizeImports } from './010-prettier/organizeImports';
import { prettier } from './010-prettier/prettier';
import { updateDependency } from './105-updateDependency/updateDependency';
import { auditDependencies } from './110-auditDependencies/auditDependencies';
import { libraryBoilerplate } from './200-libraryBoilerplate/libraryBoilerplate';
import { license } from './300-license/license';
import { description } from './310-description/description';
import { descriptionInGithub } from './310-description/descriptionInGithub';
import { aiGeneratedWallpaperPrepare } from './315-ai-generated-wallpaper/0-aiGeneratedWallpaperPrepare';
import { aiGeneratedWallpaperLand } from './315-ai-generated-wallpaper/1-aiGeneratedWallpaperLand';
import { aiGeneratedWallpaperTrigger } from './315-ai-generated-wallpaper/2-aiGeneratedWallpaperTrigger';
import { aiGeneratedWallpaperHarvest } from './315-ai-generated-wallpaper/3-aiGeneratedWallpaperHarvest';
import { aiGeneratedWallpaperPick } from './315-ai-generated-wallpaper/4-aiGeneratedWallpaperPick';
import { aiGeneratedWallpaperUseInReadme } from './315-ai-generated-wallpaper/5-aiGeneratedWallpaperUseInReadme';
import { aiGeneratedWallpaperUseInGithub } from './315-ai-generated-wallpaper/6-aiGeneratedWallpaperUseInGithub';
import { authors } from './320-authors/authors';
import { repository } from './325-repository/repository';
import { normalizePackage } from './330-normalizePackage/normalizePackage';
import { onceWriteAnnotations } from './500-todos/onceWriteAnnotations';
import { badges } from './800-badges/badges';
import { contributing } from './810-contributing/contributing';
import { partners } from './820-partners/partners';
import { normalizeSvgs } from './900-assets/normalizeSvgs';
import { branchesRemoveMerged } from './branches-remove-merged/branches-remove-merged';
import { branchesUpdateFeatures } from './branches-update-features/branches-update-features';
import { collboardModuleNames } from './collboard-module-names/collboard-module-names';
import { IWorkflow } from './IWorkflow';
import { onceHarvestAllMidjourney } from './once-harvest-all-midjourney/once-harvest-all-midjourney';
import { onceRevertLastBpeCommit } from './once-revert-last-bpe-commit/once-revert-last-bpe-commit';
import { socialFacebookEventInterest } from './social/facebook-event-interest';
import { socialFacebookLikes } from './social/facebook-likes';
import { socialLinkedinLikes } from './social/linkedin-likes';
import { terminalsVersion } from './terminals-version/terminalsVersion';

export const WORKFLOWS: IWorkflow[] = [
    lines,
    // removeBom,
    // encoding,
    normalizeJsons,
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
    aiGeneratedWallpaperTrigger,
    aiGeneratedWallpaperHarvest,
    aiGeneratedWallpaperPick,
    aiGeneratedWallpaperUseInReadme,
    aiGeneratedWallpaperUseInGithub,
    authors,
    repository,
    normalizePackage,
    // TODO: Allow> normalizeTodos,
    onceWriteAnnotations,
    badges,
    contributing,
    partners,
    terminalsVersion,
    collboardModuleNames,
    branchesRemoveMerged,
    branchesUpdateFeatures,
    normalizeSvgs,
    prettier,
    organizeImports,
    socialLinkedinLikes,
    socialFacebookLikes,
    socialFacebookEventInterest,
    onceRevertLastBpeCommit,
    onceHarvestAllMidjourney,
];
