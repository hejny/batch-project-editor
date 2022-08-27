import chalk from 'chalk';
import { execCommand } from './execCommand';

export async function openFolder(path: string) {
    path = path.split('\\').join('/');
    console.info(chalk.bgGrey(` 📂  Opening ${path}`));
    await execCommand({ command: `explorer ${path}`, crashOnError: false });
}

/*



 📂  Opening C:/Users/me/autowork/hejny/batch-project-editor/assets/ai/wallpaper/gallery
C:\Users\me\work\hejny\batch-project-editor explorer C:/Users/me/autowork/hejny/batch-project-editor/assets/ai/wallpaper/gallery
Command "explorer" exited with code 1
Command "explorer" exited with code 1


*/
