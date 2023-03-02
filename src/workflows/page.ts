import puppeteer from 'puppeteer-core';

export const pageContainer: { browser: puppeteer.Browser | null; page: puppeteer.Page | null } = {
    browser: null,
    page: null,
};

/**
 * TODO: [🏯] Do sharing of puppeteer.Page across the workflows more universally and in better place
 */
