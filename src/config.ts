import { ConfigChecker } from 'configchecker';
import dotenv from 'dotenv';
import path from 'path';
import { lines } from './workflows/000-lines/lines';
import { prettier } from './workflows/010-prettier/prettier';
import { auditDependencies } from './workflows/100-auditDependencies/auditDependencies';
import { libraryBoilerplate } from './workflows/200-libraryBoilerplate/libraryBoilerplate';
import { license } from './workflows/300-license/license';
import { description } from './workflows/310-description/description';
import { authors } from './workflows/320-authors/authors';
import { normalizePackage } from './workflows/330-normalizePackage/normalizePackage';
import { badges } from './workflows/800-badges/badges';
import { contributing } from './workflows/810-contributing/contributing';
import { partners } from './workflows/820-partners/partners';
import { IWorkflow } from './workflows/IWorkflow';

/**
 * Rare workflows are workflows that need to be used once but it would be too inefficient to run them every time.
 */
export const RARE_WORKFLOWS: IWorkflow[] = [lines];

export const WORKFLOWS: IWorkflow[] = [
    // ...RARE_WORKFLOWS
    prettier,
    auditDependencies,
    libraryBoilerplate,
    license,
    description,
    authors,
    normalizePackage,
    badges,
    contributing,
    partners,
];

dotenv.config({ path: path.join(process.cwd(), '.env') });
const config = ConfigChecker.from(process.env);

export const BASE_PATH = config.get('BASE_PATH').required().value;

export const GITHUB_USERNAME = config.get('GITHUB_USERNAME').required().value;
export const GITHUB_ORGANIZATIONS = config.get('GITHUB_ORGANIZATIONS').list().required().value;
export const GITHUB_TOKEN = config.get('GITHUB_TOKEN').required().value;
