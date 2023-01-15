import { basename } from 'path';

export function getMidjourneyLink(path: string) {
    return new URL(
        `https://www.midjourney.com/app/jobs/${
            basename(path)
                .split('.')[0]
                .split(/-[0-9]_[0-9]$/)[0]
        }`,
    );
}
