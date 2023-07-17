import React, { useContext } from 'react';
import settingsStyles from '@/styles/processes/Settings.module.sass';
import { COLOR_PALETTE_OPTIONS } from '@/lib/constants';
import { MainContext } from '@/components/workarea/Main';

export default function ThemeSection() {

    const { 
        systemColorPalette, 
        systemTheme, 
        changeSystemTheme 
    } = useContext(MainContext);

    return (
        <React.Fragment>
            <p className={`${settingsStyles.theme__label} ${settingsStyles.label}`}>
                Theme
            </p>
            <div className={`${settingsStyles.theme__wrapper} ${settingsStyles.wrapper}`}>
                <div className={settingsStyles.light__theme__wrapper}>
                    <div 
                        className={`
                            ${settingsStyles.light__theme__previous}
                            ${settingsStyles[systemTheme === 'light'? 'selected-theme': '']}
                            `
                        }
                        style={{
                            backgroundImage: `linear-gradient(
                                to top, 
                                ${COLOR_PALETTE_OPTIONS[systemColorPalette].settingsColor}, 
                                ${COLOR_PALETTE_OPTIONS[systemColorPalette].lightenedColor}
                            )`,
                            outlineColor: COLOR_PALETTE_OPTIONS[systemColorPalette].settingsColor,
                            boxShadow: `
                                inset 
                                0px 
                                0px 
                                3px 
                                ${COLOR_PALETTE_OPTIONS[systemColorPalette].settingsColor}
                            `
                        }}
                        onClick={() => changeSystemTheme('light')}
                    >
                        <div className={settingsStyles.light__theme__process__window__previous}>
                            <div className={settingsStyles.title__bar__previous}/>
                            <div className={settingsStyles.process__window__content__previous}/>
                        </div>
                        <div className={settingsStyles.system__theme__process__window}>
                            <div className={settingsStyles.title__bar__previous}/>
                            <div className={settingsStyles.process__window__content__previous}/>
                        </div>
                    </div>
                    <p className={settingsStyles.light__theme__label}>Light</p>
                </div>
                <div className={settingsStyles.dark__theme__wrapper}>
                    <div 
                        className={`
                            ${settingsStyles.dark__theme__previous}
                            ${settingsStyles[systemTheme === 'dark'? 'selected-theme': '']}
                            `
                        }
                        style={{
                            backgroundImage: `linear-gradient(
                                to top, 
                                ${COLOR_PALETTE_OPTIONS[systemColorPalette].settingsColor}, 
                                ${COLOR_PALETTE_OPTIONS[systemColorPalette].lightenedColor}
                            )`,
                            outlineColor: COLOR_PALETTE_OPTIONS[systemColorPalette].settingsColor,
                            boxShadow: `
                                inset 
                                0px 
                                0px 
                                3px 
                                ${COLOR_PALETTE_OPTIONS[systemColorPalette].settingsColor}
                            `
                        }}
                        onClick={() => changeSystemTheme('dark')}
                    >
                        <div className={settingsStyles.dark__theme__process__window__previous}>
                            <div className={settingsStyles.title__bar__previous}/>
                            <div className={settingsStyles.process__window__content__previous}/>
                        </div>
                        <div className={settingsStyles.system__theme__process__window}>
                            <div className={settingsStyles.title__bar__previous}/>
                            <div className={settingsStyles.process__window__content__previous}/>
                        </div>
                    </div>
                    <p className={settingsStyles.dark__theme__label}>Dark</p>
                </div>
            </div>
        </React.Fragment>
    );
}
