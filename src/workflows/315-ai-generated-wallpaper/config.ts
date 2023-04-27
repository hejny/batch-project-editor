export const IMAGINE_VERSION = 5;

export const CALL_MIDJOURNEY_API_IN_SERIES = true;

export const IMAGINE_OPTIONAL_FLAGS: string[] = [
    //'--hd',
    // '--version 3',
    //'--quality 2',
    // '--stylize 1250',
];

export const IMAGINE_REQUIRED_FLAGS: string[] = [
    // Note: Version is automatically set by default flags in MJ
    //     > `--version ${IMAGINE_VERSION}`,
];

export const IMAGINE_TEMPLATES: string[] = [
    '%',
    // 'Banner for social media for %',
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
