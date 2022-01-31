import { auditDependencies } from './workflows/auditDependencies/auditDependencies';
import { badges } from './workflows/badges/badges';
import { IWorkflow } from './workflows/IWorkflow';
import { lines } from './workflows/lines/lines';

export const BASE_PATH = 'C:/Users/me/work';
export const WORKFLOWS: IWorkflow[] = [
    auditDependencies,
    badges,
    lines /* !!! List all and allow to pick via CLI flags */,
];
