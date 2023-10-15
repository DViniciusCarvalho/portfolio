import React, { useContext } from 'react';
import contextMenuStyles from '@/styles/processes/files/menus/ContextMenu.module.sass';
import { FileManagerContext } from '../FileManager';
import { MainContext } from '@/components/workarea/Main';
import { Props } from '@/types/props';


export default function ContextMenu({
    origin,
    options,
    targetPath
}: Props.ContextMenuProps) {
 
    const {
        systemTheme
    } = useContext(MainContext);

    const {
        contextMenuRef,
        clickContextMenuOptionDecorator
    } = useContext(FileManagerContext);

    return options.length? (
        <ul 
            className={`
                ${contextMenuStyles.menu__wrapper}
                ${contextMenuStyles[systemTheme]}
                `
            }
            ref={contextMenuRef}
            style={{
                left: origin.x,
                top: origin.y
            }}
        >
            {options.map((option, index) => (
                <li 
                    className={contextMenuStyles.menu__option}
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
    ) : <></>;
}
