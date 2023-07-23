import React, { useContext } from 'react';
import terminalStyles from '@/styles/processes/Terminal.module.sass';
import { Props } from '@/types/props';
import { MainContext } from '@/components/workarea/Main';

export default function ResultLine({ commandResult }: Props.ResultLineProps) {

    const { terminalDefaultColor } = useContext(MainContext);

    return (
        <p 
            className={terminalStyles.result__line}
            style={{
                color: terminalDefaultColor
            }}
        >
            {commandResult}
        </p>
    );
}
