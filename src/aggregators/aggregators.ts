import { gitHours } from './gitHours/gitHours';
import { IAggregator } from './IAggregator';

export const AGGREGATORS: IAggregator<any>[] = [new gitHours()];
