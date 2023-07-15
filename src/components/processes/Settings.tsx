import React, { useContext, useRef } from 'react';
import settingsStyles from '@/styles/processes/Settings.module.sass';
import { MainContext } from '@/components/workarea/Main';
import { COLOR_PALETTE_OPTIONS } from '@/lib/constants';
import { generateJSXKey } from '@/lib/utils';



export default function Settings() {

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const { 
        systemColorPalette, 
        systemTheme,
        systemLayout, 
        backgroundIsImageBlob,
        backgroundImageUrl,
        changeBackgroundStyle,
        changeSystemTheme
    } = useContext(MainContext);


    const changeBackgroundStyleMiddleware = (
        colorPalette?: string
    ): void => {

        const files = fileInputRef.current!.files!;
  
        if (!files.length) {
            changeBackgroundStyle(
                false, 
                '', 
                colorPalette
            );

            return;
        }

        const reader = new FileReader();
        
        reader.addEventListener('load', () => {
            const imageUrl = reader.result;
            const isImageFile = String(imageUrl).startsWith('data:image/');

            if (isImageFile) changeBackgroundStyle(true, imageUrl);
            
        });
        
        reader.readAsDataURL(files[0x0]);

    }


    return (
        <div 
            className={`
                ${settingsStyles.container}
                ${settingsStyles[systemTheme]}
                `
            }
        >
            <p className={settingsStyles.background__label}>Background</p>
            <div className={settingsStyles.background__wrapper}>
                <div 
                    className={`
                        ${settingsStyles.background__previous}
                        ${settingsStyles[systemLayout]}
                        `
                    }
                >
                    <div 
                        className={settingsStyles.background__previous__taskbar}
                        style={{
                            backgroundImage: COLOR_PALETTE_OPTIONS[systemColorPalette].taskbar.backgroundImage
                        }}
                    />
                    <div 
                        className={settingsStyles.background__previous__desktop}
                        style={{
                            backgroundImage: backgroundIsImageBlob
                                            ? `url(${backgroundImageUrl})`
                                            : COLOR_PALETTE_OPTIONS[systemColorPalette].desktop.backgroundImage
                        }}
                    />
                </div>
                
                <div className={settingsStyles.background__color__palette__radios__wrapper}>

                    {
                        Object.keys(COLOR_PALETTE_OPTIONS).map((colorPaletteOptionName, index) => (
                            <input
                                key={generateJSXKey(
                                    'radio-color-pallete',
                                    colorPaletteOptionName,
                                    index
                                )}
                                type='radio'
                                name='backgroundColorPalette'
                                value={colorPaletteOptionName}
                                checked={systemColorPalette === colorPaletteOptionName? true : false}
                                className={settingsStyles.background__color__palette__radio}
                                style={{
                                    backgroundColor: COLOR_PALETTE_OPTIONS[colorPaletteOptionName].settingsColor,
                                    outlineColor: COLOR_PALETTE_OPTIONS[colorPaletteOptionName].settingsColor
                                }}
                                onChange={() => changeBackgroundStyleMiddleware(colorPaletteOptionName)}
                            />
                        ))
                    }

                </div>

                <div className={settingsStyles.select__background__file__wrapper}>
                    <input 
                        type='file' 
                        id='select__background__file'
                        className={settingsStyles.select__background__file__input}
                        onChange={() => changeBackgroundStyleMiddleware(systemColorPalette)} 
                        ref={fileInputRef}
                    />
                    <label 
                        htmlFor='select__background__file'
                        className={settingsStyles.select__background__file__label}
                    >
                        Select Background
                    </label>
                    <p className={settingsStyles.select__background__file__name}>
                        {fileInputRef.current?.files!.length? fileInputRef.current!.files![0x0].name : ''}
                    </p>
                </div>

            </div>
            <p className={settingsStyles.theme__label}>Theme</p>
            <div className={settingsStyles.theme__wrapper}>
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
        </div>
    );
}