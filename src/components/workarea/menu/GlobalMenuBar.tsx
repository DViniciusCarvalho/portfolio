import React, { useContext, useState } from 'react';
import globalMenuBarStyles from '@/styles/workarea/menu/GlobalMenuBar.module.sass';
import { MainContext } from '../Main';
import { getDateString } from '@/lib/utils';
import { Props } from '@/types/props';

export default function GlobalMenuBar({ globalMenuRef }: Props.GlobalMenuProps) {

    const { layoutStyleClass } = useContext(MainContext);

    const [ date, setDate ] = useState(getDateString());

    setInterval(() => setDate(previous => getDateString()), 30000);


    return (
        <div 
            className={`${globalMenuBarStyles.container} ${globalMenuBarStyles[layoutStyleClass]}`}
            ref={globalMenuRef}
        >
            <div className={globalMenuBarStyles.date}>
                {date}
            </div>
        </div>
    );
}
