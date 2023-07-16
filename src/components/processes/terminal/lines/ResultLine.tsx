import React from 'react';
import terminalStyles from '@/styles/processes/Terminal.module.sass';
import { Props } from '@/types/props';

export default function ResultLine({ commandResult }: Props.ResultLineProps) {
    return (
        <div className={terminalStyles.result__line}>{commandResult}</div>
    );
}
