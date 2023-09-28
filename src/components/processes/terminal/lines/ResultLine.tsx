import React, { useContext } from 'react';
import terminalStyles from '@/styles/processes/Terminal.module.sass';
import { Props } from '@/types/props';
import { MainContext } from '@/components/workarea/Main';

import { 
    BREAK_LINE,
    DOUBLE_QUOTE,
    FULL_COLORED_WORD_PATTERN, 
    SINGLE_QUOTE, 
    TABULATION
} from '@/lib/shell/commands/common/patterns';


export default function ResultLine({ commandResult }: Props.ResultLineProps) {

    const { terminalDefaultColor } = useContext(MainContext);


    function getResultLineWithColoredWordAndConvertEscapeSequences(
        resultLine: string,
        index: number
    ): React.JSX.Element {

        const escapedTabulationPattern = new RegExp(TABULATION, 'g');
        const escapedSingleQuotePattern = new RegExp(SINGLE_QUOTE, 'g');
        const escapedDoubleQuotePattern = new RegExp(DOUBLE_QUOTE, 'g');

        resultLine = resultLine.replace(escapedTabulationPattern, '\t');
        resultLine = resultLine.replace(escapedSingleQuotePattern, '\'');
        resultLine = resultLine.replace(escapedDoubleQuotePattern, '\"');

        const coloredWords = resultLine.match(FULL_COLORED_WORD_PATTERN);

        if (coloredWords?.length) {
            coloredWords.forEach(coloredWord => {
                const firstGtSignalIndex = coloredWord.indexOf('>');
                const backSlashIndex = coloredWord.indexOf('\\');

                const spanColorInHexadecimal = coloredWord.slice(7, firstGtSignalIndex);
                const spanContent = coloredWord.slice(firstGtSignalIndex + 3, backSlashIndex - 2);

                const spanElement = `<span style="color:${spanColorInHexadecimal}">${spanContent}</span>`;

                resultLine = resultLine.replace(coloredWord, spanElement as any);
            });
        }

        return (
            <React.Fragment key={index}>
                <pre 
                    dangerouslySetInnerHTML={{ __html: resultLine }} 
                    className={terminalStyles.result__line}
                >
                </pre>
            </React.Fragment>
        );
    }

    return (
        <pre 
            className={terminalStyles.result__line}
            style={{
                color: terminalDefaultColor
            }}
        >
            {commandResult.split(BREAK_LINE).map(getResultLineWithColoredWordAndConvertEscapeSequences)}
        </pre>
    );
}
