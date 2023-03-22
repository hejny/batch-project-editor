export function normalizeTodosInSource(source: string): string {
    for (let i = 20; i !== 1; i--) {
        const tag = '!'.repeat(i);
        source = source.split(tag).join(`TODO: ${tag}`);
    }

    for (let i = 0; i < 20; i++) {
        source = source.split('TODO: TODO:').join('TODO:');
    }

    /*
    TODO: Be aware about indentation
    fileContent = fileContent.split('TODO:').join(' TODO: ');
    for (let i = 0; i < 3; i++) {
        fileContent = fileContent.split('  TODO:').join(' TODO:');
        fileContent = fileContent.split('TODO:  ').join(' TODO: ');
    }
    */

    return source;
}

/**
 * Note: The stupid name normalizeTodosInSource is because I want to avoid colision with the actual workflow normalizeTodos
 * TODO: NEVER chage code ONLY change comments
 * TODO: No more than one TODO on line> "TODO: [🧠] TODO: !!x return type Promisable<void>"
 */
