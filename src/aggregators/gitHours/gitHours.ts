import { IAggregator, IAggregatorOptions } from '../IAggregator';

export class gitHours implements IAggregator<number> {
    public initial = 0;

    public run({}: IAggregatorOptions) {
        return 1;
    }

    public join(a: number, b: number) {
        return a + b;
    }

    public print(value: number) {
        return value;
    }
}
