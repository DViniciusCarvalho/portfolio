export const alignLineItems = (
    lines: string[],
    separator: string,
    alignSide: 'left' | 'right'
): string[] => {

    const alignFunction = alignSide === 'left'
                          ? (text: string, maxLength: number) => text.padEnd(maxLength, ' ')
                          : (text: string, maxLength: number) => text.padStart(maxLength, ' ');

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