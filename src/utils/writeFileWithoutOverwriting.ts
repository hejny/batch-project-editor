import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname } from 'path';
import spaceTrim from 'spacetrim';
import { buffer2hex } from './buffer2hex';
import { isFileExisting } from './isFileExisting';

/**
 *  Save file but before saving it checks if it alreasy exists:
 *  - If no, it recursively creates a folder and saves
 *  - If yes, it checks if existing one is same as new one:
 *      - If yes, it does nothing
 *      - If no, it throws an error
 *
 *
 */
export async function writeFileWithoutOverwriting(
    filePath: string,
    content: ArrayBuffer,
    contentOriginUrl?: string,
): Promise<void> {
    // [🖼️] Note: Check if file already exists...
    if (!(await isFileExisting(filePath))) {
        // [🖼️❌] Note: ... if it does not, make folder for it and just simply save
        await mkdir(dirname(filePath), { recursive: true });
        await writeFile(filePath, new DataView(content), 'binary');
    } else {
        // [🖼️✔️] Note: ... if it does, compare the existing file with downloaded one ...

        const imageExistingContentsHex = await readFile(filePath, 'hex');
        const imageNewContentsHex = buffer2hex(content);

        if (imageExistingContentsHex !== imageNewContentsHex) {
            throw new Error(
                spaceTrim(`
                    Files which should be identical are different:

                    Existing:
                    ${filePath}
                    ${imageExistingContentsHex.substring(0, 100)}...

                    vs.

                    New:
                    ${contentOriginUrl}
                    ${imageNewContentsHex.substring(0, 100)}...

                `),
            );
        }
    }
}
