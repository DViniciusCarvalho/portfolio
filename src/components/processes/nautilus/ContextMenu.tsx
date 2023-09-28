import React, { useContext } from 'react';
import nautilusStyles from '@/styles/processes/Nautilus.module.sass';
import { Props } from '@/types/props';
import { NautilusContext } from './Nautilus';

export default function ContextMenu({
    origin,
    options,
    targetPath
}: Props.ContextMenuProps) {
 
    const {
        contextMenuRef,
        clickContextMenuOptionDecorator
    } = useContext(NautilusContext);

    return (
        <ul 
            className={nautilusStyles.menu__wrapper}
            ref={contextMenuRef}
            style={{
                left: origin.x,
                top: origin.y
            }}
        >
            {options.map((option, index) => (
                <li 
                    className={nautilusStyles.menu__option}
                    onClick={(event) => clickContextMenuOptionDecorator(
                        event, 
                        option.handler, 
                        targetPath
                    )}
                    key={index}
                >
                    {option.text}
                </li>
            ))}
        </ul>
    );
}
