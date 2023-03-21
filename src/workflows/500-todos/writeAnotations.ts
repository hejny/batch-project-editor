import { ElementHandle } from 'puppeteer-core';
import spaceTrim from 'spacetrim';
import { forTime } from 'waitasecond';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { getChatBingPage, prepareChatBingPage } from './utils/chatBingPage';

export async function writeAnotations({
    modifyFiles,
    modifyJsonFiles,
    commit,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const chatBingPage = getChatBingPage();

    await modifyFiles('**/*.{ts,tsx,js,jsx}', async (filePath, fileContent) => {
        if (fileContent.split('@@@').length !== 2) {
            console.info(`⬜ File ${filePath} has none or multiple anotation missing marks `);
            return null;
        }

        // TODO: !!! Omit things like imports, empty comments / anotations , code comments, indentation,...

        const fileContentEssentials = fileContent
            .split(/^import.*$/gm)
            .join('')
            .split(/^\s*\/\/.*$/gm)
            .join('')
            .split(/\/\*.*?\*\//gs)
            .join('');

        /*
        console.log('---------------------------------');
        console.log(fileContent);
        console.log('---------------------------------');
        console.log(fileContentEssentials);
        console.log('---------------------------------');
        */

        const requestText = spaceTrim(
            (block) => `

                Describe the following code:

                ${block(fileContentEssentials)}

             `,
        );

        // !!!!! requestMultilineText vs requestText
        // !!! Limit requestText to 2000 characters

        /**
         * Finds a new topic button inside multiple shadowRoot layers
         * DRY [0]
         */
        const newTopicButtonElementHandle = (await chatBingPage.evaluateHandle(() => {
            function traverse(
                node: Node,
                depth: number,
                callback: (node: Node, depth: number) => HTMLElement | null,
            ): HTMLElement | null {
                const result = callback(node, depth);

                if (result !== null) {
                    return result;
                }

                if (node.nodeType == 1 /* <- Element node */) {
                    for (var i = 0; i < node.childNodes.length; i++) {
                        const result = traverse(node.childNodes[i], depth + 1, callback);

                        if (result !== null) {
                            return result;
                        }
                    }
                } else if (node.nodeType == 3 /* <- Text node */) {
                    // Note: Text node can not be traversed
                }

                if (node instanceof HTMLElement && node.shadowRoot) {
                    for (var i = 0; i < node.shadowRoot.childNodes.length; i++) {
                        const result = traverse(node.shadowRoot.childNodes[i], depth + 1, callback);

                        if (result !== null) {
                            return result;
                        }
                    }
                }

                return null;
            }

            return traverse(window.document.body, 0, (node: Node, depth: number) => {
                if (!(node instanceof HTMLElement)) {
                    return null;
                }

                const element = node;

                if (!(element.tagName === 'DIV' && element.innerText === 'New topic')) {
                    return null;
                }

                return element;
            });
        })) as ElementHandle<HTMLElement>;

        /**
         * TODO: Make some util from this markElement + use in clickOnButton
         */
        await newTopicButtonElementHandle.evaluate((element) => {
            element.focus(/* [9] Redundant */);
            // TODO: [☮] Util markButton
            element.style.outline = '2px solid #00ff00';
        });

        await newTopicButtonElementHandle.click();

        await forTime(1000 * 5 /* seconds to switch new topic */);

        /**
         * Finds a new topic button inside multiple shadowRoot layers
         * DRY [0]
         */
        const preciseButtonElementHandle = (await chatBingPage.evaluateHandle(() => {
            function traverse(
                node: Node,
                depth: number,
                callback: (node: Node, depth: number) => HTMLElement | null,
            ): HTMLElement | null {
                const result = callback(node, depth);

                if (result !== null) {
                    return result;
                }

                if (node.nodeType == 1 /* <- Element node */) {
                    for (var i = 0; i < node.childNodes.length; i++) {
                        const result = traverse(node.childNodes[i], depth + 1, callback);

                        if (result !== null) {
                            return result;
                        }
                    }
                } else if (node.nodeType == 3 /* <- Text node */) {
                    // Note: Text node can not be traversed
                }

                if (node instanceof HTMLElement && node.shadowRoot) {
                    for (var i = 0; i < node.shadowRoot.childNodes.length; i++) {
                        const result = traverse(node.shadowRoot.childNodes[i], depth + 1, callback);

                        if (result !== null) {
                            return result;
                        }
                    }
                }

                return null;
            }

            return traverse(window.document.body, 0, (node: Node, depth: number) => {
                if (!(node instanceof HTMLElement)) {
                    return null;
                }

                const element = node;

                if (!(element.tagName === 'SPAN' && element.innerText === 'Precise')) {
                    return null;
                }

                return element;
            });
        })) as ElementHandle<HTMLElement>;

        /**
         * TODO: Make some util from this markElement + use in clickOnButton
         */
        await preciseButtonElementHandle.evaluate((element) => {
            element.focus(/* [9] Redundant */);
            // TODO: [☮] Util markButton
            element.style.outline = '2px solid #00ff00';
        });

        await preciseButtonElementHandle.click();

        await forTime(1000 * 5 /* seconds to switch precision level */);

        /**
         * Finds a searchbox element inside multiple shadowRoot layers
         * DRY [0]
         */
        const searchboxElementHandle = (await chatBingPage.evaluateHandle(() => {
            function traverse(
                node: Node,
                depth: number,
                callback: (node: Node, depth: number) => HTMLElement | null,
            ): HTMLElement | null {
                const result = callback(node, depth);

                if (result !== null) {
                    return result;
                }

                if (node.nodeType == 1 /* <- Element node */) {
                    for (var i = 0; i < node.childNodes.length; i++) {
                        const result = traverse(node.childNodes[i], depth + 1, callback);

                        if (result !== null) {
                            return result;
                        }
                    }
                } else if (node.nodeType == 3 /* <- Text node */) {
                    // Note: Text node can not be traversed
                }

                if (node instanceof HTMLElement && node.shadowRoot) {
                    for (var i = 0; i < node.shadowRoot.childNodes.length; i++) {
                        const result = traverse(node.shadowRoot.childNodes[i], depth + 1, callback);

                        if (result !== null) {
                            return result;
                        }
                    }
                }

                return null;
            }

            return traverse(window.document.body, 0, (node: Node, depth: number) => {
                // console.log(depth, node, node instanceof HTMLElement, (node as any).tagName);

                if (!(node instanceof HTMLElement)) {
                    return null;
                }

                const element = node;

                if (!(element.tagName === 'TEXTAREA' && element.id === 'searchbox')) {
                    return null;
                }

                const searchboxElement = element;

                console.log(depth, searchboxElement);

                return searchboxElement;
            });
        })) as ElementHandle<HTMLElement>;

        await searchboxElementHandle.type(
            requestText.split('\n').join(' ').split(/\s+/g).join(' ') /* <- TODO: How to input code + multiline text */,
            { delay: 100 },
        );
        await forTime(1000 * 3 /* seconds after write */);

        /**
         * Finds a searchbox element inside multiple shadowRoot layers
         * DRY [0]
         */
        const submitElementHandle = (await chatBingPage.evaluateHandle(() => {
            function traverse(
                node: Node,
                depth: number,
                callback: (node: Node, depth: number) => HTMLElement | null,
            ): HTMLElement | null {
                const result = callback(node, depth);

                if (result !== null) {
                    return result;
                }

                if (node.nodeType == 1 /* <- Element node */) {
                    for (var i = 0; i < node.childNodes.length; i++) {
                        const result = traverse(node.childNodes[i], depth + 1, callback);

                        if (result !== null) {
                            return result;
                        }
                    }
                } else if (node.nodeType == 3 /* <- Text node */) {
                    // Note: Text node can not be traversed
                }

                if (node instanceof HTMLElement && node.shadowRoot) {
                    for (var i = 0; i < node.shadowRoot.childNodes.length; i++) {
                        const result = traverse(node.shadowRoot.childNodes[i], depth + 1, callback);

                        if (result !== null) {
                            return result;
                        }
                    }
                }

                return null;
            }

            return traverse(window.document.body, 0, (node: Node, depth: number) => {
                if (!(node instanceof HTMLElement)) {
                    return null;
                }

                const element = node;

                if (!(element.tagName === 'BUTTON' && element.ariaLabel === 'Submit')) {
                    return null;
                }

                const submitElement = element;

                return submitElement;
            });
        })) as ElementHandle<HTMLElement>;

        console.info(`🤖 Clicking on submit`);
        await submitElementHandle.click();

        await forTime(1000 * 90 /* seconds to response */);

        // TODO: Scrape <cib-message><cib-shared/>

        /**
         * Finds a searchbox element inside multiple shadowRoot layers
         * DRY [0]
         */
        const responseElementHandle = (await chatBingPage.evaluateHandle(() => {
            function traverse(
                node: Node,
                depth: number,
                callback: (node: Node, depth: number) => HTMLElement | null,
            ): HTMLElement | null {
                const result = callback(node, depth);

                if (result !== null) {
                    return result;
                }

                if (node.nodeType == 1 /* <- Element node */) {
                    for (var i = 0; i < node.childNodes.length; i++) {
                        const result = traverse(node.childNodes[node.childNodes.length - 1 - i], depth + 1, callback);

                        if (result !== null) {
                            return result;
                        }
                    }
                } else if (node.nodeType == 3 /* <- Text node */) {
                    // Note: Text node can not be traversed
                }

                if (node instanceof HTMLElement && node.shadowRoot) {
                    for (var i = 0; i < node.shadowRoot.childNodes.length; i++) {
                        const result = traverse(
                            node.shadowRoot.childNodes[node.shadowRoot.childNodes.length - 1 - i],
                            depth + 1,
                            callback,
                        );

                        if (result !== null) {
                            return result;
                        }
                    }
                }

                return null;
            }

            return traverse(window.document.body, 0, (node: Node, depth: number) => {
                if (!(node instanceof HTMLElement)) {
                    return null;
                }

                const element = node;

                if (!(element.tagName.toLowerCase() === 'cib-shared')) {
                    return null;
                }

                const submitElement = element;

                return submitElement;
            });
        })) as ElementHandle<HTMLElement>;

        /**
         * TODO: Make some util from this markElement + use in clickOnButton
         */
        await responseElementHandle.evaluate((element) => {
            element.focus(/* [9] Redundant */);
            // TODO: [☮] Util markButton
            element.style.outline = '2px solid #00ff00';
        });

        const responseText = await responseElementHandle.evaluate((element) => {
            return element.innerText;
        });

        fileContent = fileContent.split('@@@').join(responseText.split('\n').join(' '));

        // TODO: Use modifyJsonFile not modifyJsonFiles - editing just one file
        await modifyJsonFiles<Array<{ requestText: string; responseText: string }>>(
            `documents/ai/prompts.json` /* <- TODO: Best place for the file */,
            (fileName, fileContent) => [...fileContent, { requestText, responseText }],
        );

        return fileContent;
    });

    return commit(
        spaceTrim(`
            💭 Write anotations

            Written by Chat Bing
        `), // <- TODO: More info about the chat thread, GPT version, date,...
    );
}

writeAnotations.initialize = prepareChatBingPage;
