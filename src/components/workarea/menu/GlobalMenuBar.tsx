import React, { 
    useContext, 
    useState 
} from 'react';

import globalMenuBarStyles from '@/styles/workarea/menu/GlobalMenuBar.module.sass';
import { MainContext } from '../Main';
import { Props } from '@/types/props';
import { getDateString } from '@/lib/utils';


export default function GlobalMenuBar({ globalMenuRef }: Props.GlobalMenuProps) {

    const { 
        systemLayout 
    } = useContext(MainContext);


    const [ 
        date, 
        setDate 
    ] = useState(getDateString());


    const THIRTY_SECONDS_IN_MILLISECONDS = 30 * 1000;

    setInterval(() => setDate(previous => getDateString()), THIRTY_SECONDS_IN_MILLISECONDS);


    return (
        <div 
            className={`
                ${globalMenuBarStyles.container} 
                ${globalMenuBarStyles[systemLayout]}
                `
            }
            ref={globalMenuRef}
        >
            <div className={globalMenuBarStyles.date}>
                {date}
            </div>
        </div>
    );
}
