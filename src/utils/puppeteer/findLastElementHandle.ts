import { ElementHandle, Page } from 'puppeteer-core';

/**
 * Finds the last element with given conditions
 *
 * Note: This function is going through shadowRoot structure
 * Note: We can not pass the filterCallback directly @see commit 8f8850cb77be2ce466735eef2b4a9d2246b2f61c
 *
 * @param page on which to search
 * @param where the conditions what attributes must element have
 * @returns ElementHandle or null
 */
export async function findLastElementHandle(
    page: Page,
    where: Record<string, string | number>,
): Promise<ElementHandle<HTMLElement> | null> {
    return (await page.evaluateHandle(
        ({ where }) => {
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
                    for (var i = node.childNodes.length - 1; i >= 0; i--) {
                        const result = traverse(node.childNodes[i], depth + 1, callback);

                        if (result !== null) {
                            return result;
                        }
                    }
                } else if (node.nodeType == 3 /* <- Text node */) {
                    // Note: Text node can not be traversed
                }

                if (node instanceof HTMLElement && node.shadowRoot) {
                    for (var i = node.shadowRoot.childNodes.length - 1; i >= 0; i--) {
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

                for (const [key, value] of Object.entries(where)) {
                    if (element[key] !== value) {
                        return null;
                    }
                }

                return element;
            });
        },
        { where },
    )) as ElementHandle<HTMLElement>;
}
