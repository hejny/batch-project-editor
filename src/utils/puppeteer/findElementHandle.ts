import { ElementHandle, Page } from 'puppeteer-core';

export async function findElementHandle(
    page: Page,
    filterCallback: (element: HTMLElement) => boolean,
): Promise<ElementHandle<HTMLElement>> {
    /**
     * Finds a new topic button inside multiple shadowRoot layers
     * DRY [0]
     */
    const elementHandle = await page.evaluateHandle(
        ({ filterCallbackSerialized, foo }) => {
            const filterCallback = new Function(filterCallbackSerialized);

            console.log(new Function(`(n) => n+1`));
            console.log({ filterCallbackSerialized, filterCallback, foo });

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

                if (!filterCallback(element)) {
                    return null;
                }

                return element;
            });
        },
        { filterCallbackSerialized: filterCallback.toString(), foo: 'bar' },
    );

    if (!(elementHandle instanceof ElementHandle)) {
        throw new Error(`Something get wrong; Expected ElementHandle but got something else`);
    }

    return elementHandle as ElementHandle<HTMLElement>;
}

/**
 * TODO: findAllElementsHandles equivalent
 */
