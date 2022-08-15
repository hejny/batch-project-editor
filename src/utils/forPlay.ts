import chalk from 'chalk';
import readline from 'readline';

/**
 * @private
 */
let isInitialized = false;

/**
 * @private
 */
let isPlaying = false;

/**
 * @private
 */
let resumePromise: Promise<void>;

/**
 * @private
 */
let resumePromiseResolve: () => void;

/**
 * @private
 */
function pause(isLogged = true) {
    isPlaying = false;
    if (isLogged) {
        console.info(chalk.bgYellowBright(`[ Pausing ]`));
    }
    resumePromise = new Promise((resolve) => {
        resumePromiseResolve = resolve;
    });
}

/**
 * @private
 */
function resume() {
    isPlaying = true;
    if (resumePromiseResolve) {
        console.info(chalk.bgGreen(`[ Resuming ]`));
        resumePromiseResolve();
    }
}

/**
 * @private
 */
function initForPlay() {
    if (isInitialized) {
        return;
    }

    isInitialized = true;
    isPlaying = true;

    readline.emitKeypressEvents(process.stdin);

    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
    }

    process.stdin.on('keypress', (chunk, key) => {
        if (key && key.name == 'p') {
            if (isPlaying) {
                pause();
            } else {
                resume();
            }
        } else if (key && key.name == 'c' && key.ctrl) {
            // Note: When set raw mode, Ctrl+C will not cause SIGINT so we need to do it manually
            console.info(chalk.bgRed(`[ Terminated ]`));
            process.exit();
        }
        // TODO: Pause by [ space ]
    });
}

/**
 * Wait until script should continue working
 * When running just resolves
 * When the script is paused by shortcut [p] this function resolves after the user presses [p] again
 *
 * Tip: This is typically used at the begining or end of some task
 *
 * Note: On first run this function will register stdin callback so it contains ! SIDE EFFECTS !
 * Note: Only aviable in node environment
 */

export async function forPlay(): Promise<void> {
    initForPlay();

    if (!isPlaying) {
        console.info(chalk.bgYellow(`[ Paused ]`));
        await resumePromise;
    }
}

/**
 * Wait until user press key to continue
 */

export async function forKeyPress(): Promise<void> {
    pause(false);
    return forPlay();
}

/**
 * TODO: Probbably to waitasecond
 * TODO: Split into multiple files
 */
