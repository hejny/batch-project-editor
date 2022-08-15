import puppeteer from 'puppeteer-core';

export const pageContainer: { page: puppeteer.Page | null } = { page: null };

/**
 * TODO: !!! Do sharing of puppeteer.Page across the workflows more universally and in better place
 */
