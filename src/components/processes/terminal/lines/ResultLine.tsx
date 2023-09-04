import React, { useContext } from 'react';
import terminalStyles from '@/styles/processes/Terminal.module.sass';
import { Props } from '@/types/props';
import { MainContext } from '@/components/workarea/Main';

import { 
    BREAK_LINE,
    DOUBLE_QUOTE,
    END_COLORED_WORD_PATTERN, 
    FULL_COLORED_WORD_PATTERN, 
    SINGLE_QUOTE, 
    START_COLORED_WORD_PATTERN, 
    TABULATION
} from '@/lib/shell/commands/common/patterns';


export default function ResultLine({ commandResult }: Props.ResultLineProps) {

    const { terminalDefaultColor } = useContext(MainContext);


    const getColoredWordAndConvertEscapeSequences = (
        resultLineWord: string,
        index: number
    ): React.JSX.Element => {

        const escapedTabulationPattern = new RegExp(TABULATION, 'g');
        const escapedSingleQuotePattern = new RegExp(SINGLE_QUOTE, 'g');
        const escapedDoubleQuotePattern = new RegExp(DOUBLE_QUOTE, 'g');

        resultLineWord = resultLineWord.replace(escapedTabulationPattern, '\t');
        resultLineWord = resultLineWord.replace(escapedSingleQuotePattern, '\'');
        resultLineWord = resultLineWord.replace(escapedDoubleQuotePattern, '\"');

        if (resultLineWord.match(FULL_COLORED_WORD_PATTERN)) {
            const spanColorInHexadecimal = resultLineWord.slice(7, resultLineWord.indexOf('>'));

            resultLineWord = resultLineWord.replace(START_COLORED_WORD_PATTERN, '');
            resultLineWord = resultLineWord.replace(END_COLORED_WORD_PATTERN, '');

            return (
                <React.Fragment key={index}>
                    <span style={{color: spanColorInHexadecimal}}>
                        {resultLineWord}
                    </span>&nbsp;
                </React.Fragment>
            );
        }

        return (
            <React.Fragment key={index}>
                {resultLineWord}&nbsp;
            </React.Fragment>
        );
    }


    const getResultLine = (
        resultLine: string,
        index: number
    ): React.JSX.Element => {

        const resultLineWords = resultLine.split(' ');

        return (
            <React.Fragment key={index}>
                {resultLineWords.map(getColoredWordAndConvertEscapeSequences)}
                <br/>
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
            {commandResult.split(BREAK_LINE).map(getResultLine)}
        </pre>
    );
}
