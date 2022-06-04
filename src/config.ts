import { Octokit } from '@octokit/rest';
import { ConfigChecker } from 'configchecker';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
const config = ConfigChecker.from(process.env);

export const BASE_PATH = config.get('BASE_PATH').required().value;

export const GITHUB_USERNAME = config.get('GITHUB_USERNAME').required().value;
export const GITHUB_ORGANIZATIONS = config.get('GITHUB_ORGANIZATIONS').list().required().value;
export const GITHUB_TOKEN = config.get('GITHUB_TOKEN', `@see https://github.com/settings/tokens`).required().value;

export const githubOctokit = new Octokit({ auth: GITHUB_TOKEN });
