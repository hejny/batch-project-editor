export const IMAGINE_VERSION = 4;

export const IMAGINE_OPTIONAL_FLAGS: string[] = [
    //'--hd',
    // '--version 3',
    //'--quality 2',
    // '--stylize 1250',
];

export const IMAGINE_REQUIRED_FLAGS: string[] = [
    `--version ${IMAGINE_VERSION}`,
    //'--aspect 2:1'
];

export const IMAGINE_TEMPLATES: string[] = [
    '%',
    // 'Banner for %',
    // 'Wallpaper in minimalistic style for project that %'
    //'Banner for social media for project that %',

    /*
    '% in minimalistic style',
    '% by Kazimir Malevich',
    '% by Vincent van Gogh',
    '% by Pablo Picasso',
    '% by Leonardo da Vinci',
    '% by Michelangelo',
    '% as a realistic photography',
    '% as a realistic painting',
    */
];
