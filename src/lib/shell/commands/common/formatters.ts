import { Shell } from '@/types/shell';

import { 
    BREAK_LINE, 
    COLORED_WORD_TEMPLATE 
} from './patterns';


export const alignLineItems = (
    lines: string[],
    separator: string,
    alignSide: 'left' | 'right'
): string[] => {

    const alignLeft = (text: string, maxLength: number) => text.padEnd(maxLength, ' ');
    const alignRight = (text: string, maxLength: number) => text.padStart(maxLength, ' ');

    const alignFunction = alignSide === 'left'
                          ? alignLeft
                          : alignRight;

    const separatedLines = lines.map(line => line.split(separator));

    const indexesLargestRefMapping = separatedLines.reduce((
        acc: {[key: string]: number},
        lineParts,
    ) => {

        for (let index = 0; index < lineParts.length; index++) {
            const isLastIndex = index === lineParts.length - 1;

            if (isLastIndex) break;

            const linePart = lineParts[index];
            const stringIndex = String(index);

            if (!(stringIndex in acc)) {
                acc[stringIndex] = linePart.length;
            }
            else if (acc[stringIndex] < linePart.length) {
                acc[stringIndex] = linePart.length;
            }

        }
        

        return acc;

    }, {});

    const joinedFormattedLines = separatedLines.map(lineParts => {
        const paddedLineParts = lineParts.map((linePart, index, array) => {
            const isLastIndex = index === array.length - 1;

            if (isLastIndex) return linePart;

            const stringIndex = String(index);

            return alignFunction(linePart, indexesLargestRefMapping[stringIndex]);
        });

        return paddedLineParts.join(separator);
    });

    return joinedFormattedLines;
}


export const helpPageSectionsAssembler = (
    name: string,
    synopsis: string,
    description: string
): string => {

    const SECTION_LABEL_COLOR = '#bcfbee';

    const nameLabel = COLORED_WORD_TEMPLATE
                      .replace('[COLOR]', SECTION_LABEL_COLOR)
                      .replace('[CONTENT]', 'NAME:');

    const synopsisLabel = COLORED_WORD_TEMPLATE
                          .replace('[COLOR]', SECTION_LABEL_COLOR)
                          .replace('[CONTENT]', 'SYNOPSIS:');

    const descriptionLabel = COLORED_WORD_TEMPLATE
                             .replace('[COLOR]', SECTION_LABEL_COLOR)
                             .replace('[CONTENT]', 'DESCRIPTION:');

    const nameSection = `${nameLabel}${BREAK_LINE}${name}`;
    const synopsisSection = `${synopsisLabel}${BREAK_LINE}${synopsis}`;
    const descriptionSection = `${descriptionLabel}${BREAK_LINE}${description}`;

    const stdout = `${nameSection}${BREAK_LINE}${synopsisSection}${BREAK_LINE}${descriptionSection}`;

    return stdout;
}


export const formatHelpPageOptions = (
    commandOptions: Shell.CommandOption[],
    regexSubstitutions?: Map<any, any>
): string => {

    const OPTION_LABEL_COLOR = '#80e5b9';

    const optionsParagraphs = commandOptions.reduce((
        acc,
        current
    ) => {

        const shortOption = current.short;
        const longOption = current.long instanceof RegExp
                           ? regexSubstitutions?.get(current.long)
                           : current.long;

        const joinedOptions = shortOption && longOption
                              ? `${shortOption}, ${longOption}`
                              : shortOption ?? longOption;

        const description = current.description;

        const optionLabel = COLORED_WORD_TEMPLATE
                            .replace('[COLOR]', OPTION_LABEL_COLOR)
                            .replace('[CONTENT]', joinedOptions!);

        const optionSection = `${optionLabel} ${description}`;

        acc.push(optionSection);

        return acc;
    }, [] as string[]);

    return optionsParagraphs.join(BREAK_LINE);
}