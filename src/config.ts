import { badges } from './workflows/badges/badges';
import { IWorkflow } from './workflows/IWorkflow';

export const BASE_PATH = 'C:/Users/me/autowork';
//export const BASE_PATH = 'G:/Backups/github';
export const WORKFLOWS: IWorkflow[] = [
    //auditDependencies,
    badges,
    //lines /* !!! List all and allow to pick via CLI flags */,
];
