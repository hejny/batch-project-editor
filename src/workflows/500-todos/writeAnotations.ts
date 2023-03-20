import { ElementHandle } from 'puppeteer-core';
import spaceTrim from 'spacetrim';
import { forEver, forTime } from 'waitasecond';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { getChatBingPage, prepareChatBingPage } from './utils/chatBingPage';

export async function writeAnotations({ modifyFiles, commit }: IWorkflowOptions): Promise<WorkflowResult> {
    const chatBingPage = getChatBingPage();

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

    await searchboxElementHandle.type('Hello');
    await forTime(500);
    await submitElementHandle.click();

    // TODO: Scrape <cib-message><cib-shared/>

    await forEver();

    await modifyFiles('**/*.{ts,tsx,js,jsx}', (filePath, fileContent) => {
        chatBingPage.type(`#searchbox`, 'Hello');

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
