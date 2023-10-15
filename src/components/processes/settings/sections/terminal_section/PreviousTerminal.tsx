import React, { useContext } from 'react';
import terminalSectionStyles from '@/styles/processes/settings/sections/TerminalSection.module.sass';
import { MainContext } from '@/components/workarea/Main';
import { Props } from '@/types/props';
import { COLOR_PALETTE_OPTIONS } from '@/lib/initial/settings';


export default function PreviousTerminal({
    terminalUserIsRootUser
}: Props.PreviousTerminal) {

    const { 
        systemColorPalette, 
		terminalUserHostColor,
		terminalRootHostColor,
		terminalCurrentDirectoryColor,
		terminalDefaultColor,
		terminalBackgroundColor,
    } = useContext(MainContext);

    return (
        <div className={terminalSectionStyles.terminal__previous__wrapper}>
            <div
                className={terminalSectionStyles.terminal__previous}
                style={{
                    backgroundImage: `linear-gradient(
                        to top, 
                        ${COLOR_PALETTE_OPTIONS[systemColorPalette].settingsColor}, 
                        ${COLOR_PALETTE_OPTIONS[systemColorPalette].lightenedColor}
                    )`,
                    boxShadow: `
                        inset 
                        0px 
                        0px 
                        3px 
                        ${COLOR_PALETTE_OPTIONS[systemColorPalette].settingsColor}
                    `
                }}
            >
                <div
                    className={terminalSectionStyles.previous__terminal__container}
                >
                    <div className={terminalSectionStyles.terminal__title__bar}>
                        <div
                            className={terminalSectionStyles.terminal__title__bar__buttons}
                        >
                            <button tabIndex={1}/>
                            <button tabIndex={1}/>
                            <button tabIndex={1}/>
                        </div>
                    </div>
                    <div
                        className={terminalSectionStyles.previous__terminal__background}
                        style={{
                            backgroundColor: terminalBackgroundColor
                        }}
                    >
                        <div 
                            className={terminalSectionStyles.previous__terminal__line}
                            style={{
                                color: terminalDefaultColor
                            }}
                        >
                            <span className={terminalSectionStyles.previous__terminal__prompt}>
                                <span style={{
                                    color: terminalUserIsRootUser
                                           ? terminalRootHostColor
                                           : terminalUserHostColor
                                }}>
                                    {terminalUserIsRootUser? 'root@domain' : 'username@domain'}
                                </span>
                                :
                                <span style={{color: terminalCurrentDirectoryColor}}>
                                    ~
                                </span>
                                {terminalUserIsRootUser? '#' : '$'}
                            </span>
                            <span>
                                clear
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {terminalUserIsRootUser? 'Root User' : 'Normal User'}
        </div>
    );
}
