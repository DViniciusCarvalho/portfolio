import React, { useContext } from 'react';
import settingsStyles from '@/styles/processes/Settings.module.sass';
import { COLOR_PALETTE_OPTIONS } from '@/lib/constants';
import { MainContext } from '@/components/workarea/Main';


export default function PreviousTerminal({
    terminalUserIsRootUser
}: { terminalUserIsRootUser: boolean }) {

    const { 
        systemColorPalette, 
        terminalFontSizeInPixels,
		terminalUserHostColor,
		terminalRootHostColor,
		terminalCurrentDirectoryColor,
		terminalDefaultColor,
		terminalBackgroundColor,
    } = useContext(MainContext);

    return (
        <div className={settingsStyles.terminal__previous__wrapper}>
            <div
                className={settingsStyles.terminal__previous}
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
                    className={settingsStyles.previous__terminal__container}
                >
                    <div className={settingsStyles.terminal__title__bar}>
                        <div
                            className={settingsStyles.terminal__title__bar__buttons}
                        >
                            <button />
                            <button />
                            <button />
                        </div>
                    </div>
                    <div
                        className={settingsStyles.previous__terminal__background}
                        style={{
                            backgroundColor: terminalBackgroundColor
                        }}
                    >
                        <div 
                            className={settingsStyles.previous__terminal__line}
                            style={{
                                color: terminalDefaultColor
                            }}
                        >
                            <span className={settingsStyles.previous__terminal__prompt}>
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
