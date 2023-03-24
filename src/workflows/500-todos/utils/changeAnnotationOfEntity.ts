interface ChangeAnnotationOfEntityParams {
    source: string;
    entityName: string;
    annotation: string;
}
export function changeAnnotationOfEntity({ source, entityName, annotation }: ChangeAnnotationOfEntityParams): string {
    const lines = source.split('\n');
    const outputLines: string[] = [];
    let foundEntity = false;
    let inExistingAnnotation = false;
    let existingAnnotation = '';
    for (const line of lines) {
        if (line.includes(`/**`) && !foundEntity) {
            inExistingAnnotation = true;
            continue;
        }
        if (inExistingAnnotation) {
            if (line.includes(`*/`)) {
                inExistingAnnotation = false;
            } else {
                existingAnnotation += line.trim().slice(2).trim();
            }
            continue;
        }
        if (
            line.includes(`const ${entityName} =`) ||
            line.includes(`let ${entityName} =`) ||
            line.includes(`var ${entityName} =`) ||
            line.includes(`function ${entityName}(`) ||
            line.includes(`async function ${entityName}(`) ||
            line.includes(`class ${entityName}`) ||
            line.includes(`interface ${entityName}`) ||
            line.includes(`type ${entityName} =`)
        ) {
            if (existingAnnotation !== annotation) {
                outputLines.push(`/**`);
                outputLines.push(` * ${annotation}`);
                outputLines.push(` */`);
                existingAnnotation = '';
            }
            foundEntity = true;
        }
        outputLines.push(line);
    }
    if (!foundEntity) {
        throw new Error(`Could not find entity with name: ${entityName}`);
    }
    return outputLines.join('\n');
}
