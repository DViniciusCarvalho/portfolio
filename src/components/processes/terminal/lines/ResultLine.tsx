import React, { useContext } from 'react';
import terminalStyles from '@/styles/processes/Terminal.module.sass';
import { Props } from '@/types/props';
import { MainContext } from '@/components/workarea/Main';

export default function ResultLine({ commandResult }: Props.ResultLineProps) {

    const { terminalDefaultColor } = useContext(MainContext);


    const getColoredWordAndConvertEscapeSequences = (
        resultLineWord: string,
        index: number
    ): React.JSX.Element => {

        const ESCAPED_TABULATION_PATTERN = /!<tabulation>!/g;
        const ESCAPED_SINGLE_QUOTE_PATTERN = /!<single_quote>!/g;
        const ESCAPED_DOUBLE_QUOTE_PATTERN = /!<double_quote>!/g;
        const COLORED_WORD_PATTERN = /^!<span<#[A-Fa-f0-9]+>>!.+!<\\span>!$/g;

        resultLineWord = resultLineWord.replace(ESCAPED_TABULATION_PATTERN, '\t');
        resultLineWord = resultLineWord.replace(ESCAPED_SINGLE_QUOTE_PATTERN, '\'');
        resultLineWord = resultLineWord.replace(ESCAPED_DOUBLE_QUOTE_PATTERN, '"');

        if (resultLineWord.match(COLORED_WORD_PATTERN)) {
            const spanColorInHexadecimal = resultLineWord.slice(7, resultLineWord.indexOf('>'));

            resultLineWord = resultLineWord.replace(/^!<span<#[A-Fa-f0-9]+>>!/g, '');
            resultLineWord = resultLineWord.replace(/!<\\span>!$/g, '');

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
            {commandResult.split('!<break_line>!').map(getResultLine)}
        </pre>
    );
}
