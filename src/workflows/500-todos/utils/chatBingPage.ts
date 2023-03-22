import chalk from 'chalk';
import { locateEdge } from 'locate-app';
import { join } from 'path';
import puppeteer from 'puppeteer-core';
import { edgePageContainer } from '../../page';

export function getChatBingPage(): puppeteer.Page {
    if (!edgePageContainer.page) {
        throw new Error(
            `Chat Bing page not initialized\n In workflow you are using the page you need to add initialize.`,
        );
    }
    return edgePageContainer.page;
}

export async function prepareChatBingPage() {
    if (edgePageContainer.page) {
        return;
    }

    // TODO: Use here puppeteer-cluster to be able to run multiple browser-based workflows at once
    const browser = await puppeteer.launch({
        // TODO: [0]
        executablePath: await locateEdge(),
        headless: false,
        defaultViewport: null,
        userDataDir: join(process.cwd(), '.tmp', 'puppeteer', 'ai-user-data-edge'),
        // TODO: Do not show "Restore" dialog
    });

    edgePageContainer.page = await browser.newPage();
    await edgePageContainer.page.goto(`https://www.bing.com/chat`);

    console.info(chalk.bgYellow(` 🚀  Please log in into Bing `));

    // !!! Find the selector> await edgePageContainer.page.waitForSelector(`#searchbox`, { timeout: 1000 * 60 * 15 /* minutes */ });
}

/**
 * TODO: [🏏] Common stuff for discordPage, githubPage and chatBingPage
 */
