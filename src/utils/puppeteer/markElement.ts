import { ElementHandle } from 'puppeteer-core';

/**
 * Marks the given element with outline color
 * It is usefull for visual feedback - what is going on in the page during the scraping process
 *
 * @param elementHandle
 * @param color
 */
export async function markElement(elementHandle: ElementHandle<HTMLElement>, color = '#00ff00'): Promise<void> {
    await elementHandle.evaluate(
        (element, { color }) => {
            element.style.outline = `2px solid ${color}`;
            element.style.outlineOffset = `5px`;

            if (element.style.borderRadius === '' || parseFloat(element.style.borderRadius) === 0) {
                element.style.borderRadius = '5px';
            }
        },
        { color },
    );
}

/**
 * TODO: Use everywhere where is mark [☮]
 */
