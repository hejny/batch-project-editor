import { readFile } from 'fs/promises';
import { join } from 'path';
import spaceTrim from 'spacetrim';
import { forTime } from 'waitasecond';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { getDiscordPage, prepareDiscordPage } from './utils/discordPage';
import { DISCORD_SEARCHRESULTS_QUERYSELECTOR, DISCORD_SEARCH_QUERYSELECTOR } from './utils/discordQuerySelectors';

// !!! Not done yet
export async function aiGeneratedWallpaperTrigger({
    skippingBecauseOf,
    projectPath,
    packageJson,
}: IWorkflowOptions): Promise<WorkflowResult> {
    // !!! Dry to some util
    const wallpaperPath = join(projectPath, '/assets/ai/wallpaper/');
    const wallpaperImaginePath = join(wallpaperPath, 'imagine');
    const wallpaperImagineContents = await readFile(wallpaperImaginePath, 'utf8');
    const imagine = spaceTrim(wallpaperImagineContents).split('\n\n')[0].split('\n').join(' ').split('  ').join(' ');
    const imagineSentence = spaceTrim(
        imagine.split(/--[a-zA-Z]+\s+[^\s]+\s*/g).join(''),
        // TODO: LIB spacetrim should be able to modify prototype of string and add there a .spaceTrim() method
    );

    const discordPage = getDiscordPage();

    //
    // !!! Comment why not> const search = `od: MidJourney Bot#9282 "${imagineSentence}"`; /* <- TODO: [🍷] Unhardcode Czech language */
    const search = `"${imagineSentence}"`;
    // !!!!!!!!!!!!!! Restore>
    // const search = `6224401`;

    await discordPage.type(DISCORD_SEARCH_QUERYSELECTOR, search, { delay: 50 });
    await discordPage.keyboard.press('Enter');

    await discordPage.waitForSelector(DISCORD_SEARCHRESULTS_QUERYSELECTOR);
    const searchResultsElement = await discordPage.$(DISCORD_SEARCHRESULTS_QUERYSELECTOR);

    if (!searchResultsElement) {
        throw new Error(`No search results element found via selector "${DISCORD_SEARCHRESULTS_QUERYSELECTOR}"`);
    }

    // TODO: Debug with> await forConsoleKeyPress();
    //       @see https://stackoverflow.com/questions/18193953/waiting-for-user-to-enter-input-in-node-jswindows 

    await searchResultsElement.waitForSelector(`li[aria-labelledby^="search-result-"]`);

    for (const searchResultsItemElement of await searchResultsElement.$$(`li[aria-labelledby^="search-result-"]`)) {
        await searchResultsItemElement.click({ offset: { x: 10, y: 10 } });

        // !!! Remove all console logs
        //console.log(searchResultsItemElement);

        const ariaLabelledby = await searchResultsItemElement.evaluate((node) => node.getAttribute('aria-labelledby'));

        // !!! Remove const ariaLabelledby = await (await searchResultsItemElement.getProperty('aria-labelledby')).jsonValue();

        if (!ariaLabelledby) {
            throw new Error(`Missing attribute aria-labelledby `);
        }

        const messageId = ariaLabelledby.split('-').pop();

        //  !!! DRY
        await discordPage.waitForSelector(`li[id="chat-messages-${messageId}"]`);
        const messageElement = await discordPage.$(`li[id="chat-messages-${messageId}"]`);

        if (!messageElement) {
            throw new Error(`No message element found for message id "${messageId}"`);
        }

        // !!!
        // console.log(await messageElement.evaluate((element) => element.outerHTML));

        // !!!
        messageElement.screenshot({ path: 'messageElement.png' });
        //console.log(messageElement.screenshot({ path: 'messageElement.png' }));
        //await forEver();

        // !!! Note selector .component-ifCTxY not working !!! OR is it?
        // *[class*="component-ifCTxY"]
        const buttonElements = await messageElement.$$(`.component-ifCTxY`);
        console.log({ buttonElements });

        for (const buttonElement of buttonElements) {
            try {
                await buttonElement.click();
                await forTime(1000 * 20);
                console.log(`Clicked on`, await buttonElement.evaluate((element) => element.outerHTML));
            } catch (error) {
                console.error(error);
            }
        }

        // !!!!!!!!!!!!!!!
        // await forEver();
        /*
        for (const buttonText of ['U1', 'U2', 'U3', 'U4']) {
            // !!! Only if not pressed
            // !!! `div[contains(text(),"${buttonText}")]`
            const buttonElement = await messageElement.$();
            // !!!
            console.log({ buttonElement });
            //const [buttonElement] = xxx;

            if (!buttonElement) {
                throw new Error(`No button ["${buttonText}"] for message id "${messageId}"`);
            }

            await (buttonElement as any).click();

            await forTime(1000 * 20);
        }
        */
    }

    return WorkflowResult.SideEffect;
}

aiGeneratedWallpaperTrigger.initialize = prepareDiscordPage;

/*

    !!! Remove unused and better organize
    DISCORD_SEARCHRESULTS_QUERYSELECTOR;
    DISCORD_SEARCHRESULTS_ITEM__QUERYSELECTOR;
    DISCORD_MESSAGE__QUERYSELECTOR;

    */
