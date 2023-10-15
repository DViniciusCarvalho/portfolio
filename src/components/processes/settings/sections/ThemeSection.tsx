import React, { useContext } from 'react';
import themeSectionStyles from '@/styles/processes/settings/sections/ThemeSection.module.sass';
import { MainContext } from '@/components/workarea/Main';
import { COLOR_PALETTE_OPTIONS } from '@/lib/initial/settings';


export default function ThemeSection() {

    const { 
        systemColorPalette, 
        systemTheme, 
        changeSystemTheme 
    } = useContext(MainContext);

    return (
        <React.Fragment>
            <p 
                className={`
                    ${themeSectionStyles.theme__label}
                    ${themeSectionStyles[systemTheme]}
                    `
                }
                aria-label='theme styles section label'
            >
                Theme
            </p>
            <div 
                className={`
                    ${themeSectionStyles.theme__wrapper}
                    ${themeSectionStyles[systemTheme]}
                    `
                }
            
            >
                <div className={themeSectionStyles.light__theme__wrapper}>
                    <div 
                        className={`
                            ${themeSectionStyles.light__theme__previous}
                            ${themeSectionStyles[systemTheme === 'light'? 'selected-theme': '']}
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
                        tabIndex={0}
                    >
                        <div className={themeSectionStyles.light__theme__process__window__previous}>
                            <div className={themeSectionStyles.title__bar__previous}/>
                            <div className={themeSectionStyles.process__window__content__previous}/>
                        </div>
                        <div className={themeSectionStyles.system__theme__process__window}>
                            <div className={themeSectionStyles.title__bar__previous}/>
                            <div className={themeSectionStyles.process__window__content__previous}/>
                        </div>
                    </div>
                    <p className={themeSectionStyles.light__theme__label}>Light</p>
                </div>
                <div className={themeSectionStyles.dark__theme__wrapper}>
                    <div 
                        className={`
                            ${themeSectionStyles.dark__theme__previous}
                            ${themeSectionStyles[systemTheme === 'dark'? 'selected-theme': '']}
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
                        tabIndex={0}
                    >
                        <div className={themeSectionStyles.dark__theme__process__window__previous}>
                            <div className={themeSectionStyles.title__bar__previous}/>
                            <div className={themeSectionStyles.process__window__content__previous}/>
                        </div>
                        <div className={themeSectionStyles.system__theme__process__window}>
                            <div className={themeSectionStyles.title__bar__previous}/>
                            <div className={themeSectionStyles.process__window__content__previous}/>
                        </div>
                    </div>
                    <p className={themeSectionStyles.dark__theme__label}>Dark</p>
                </div>
            </div>
        </React.Fragment>
    );
}
