import React, { useContext, useRef } from 'react';
import settingsStyles from '@/styles/processes/Settings.module.sass';
import { COLOR_PALETTE_OPTIONS } from '@/lib/constants';
import { generateJSXKey } from '@/lib/utils';
import { MainContext } from '@/components/workarea/Main';

export default function BackgroundSection() {

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const { 
        systemColorPalette, 
        systemLayout, 
        backgroundIsImageBlob, 
        backgroundImageUrl,
        changeBackgroundToImage,
        changeBackgroundDefaultColorPalette
    } = useContext(MainContext);


    const changeBackgroundStyleMiddleware = (
        colorPalette?: string
    ): void => {

        const files = fileInputRef.current!.files!;
  
        if (files.length) {
            const reader = new FileReader();
        
            reader.addEventListener('load', () => {
                const imageUrl = reader.result;
                const isImageFile = String(imageUrl).startsWith('data:image/');
    
                if (isImageFile) changeBackgroundToImage(imageUrl);
                
            });
            
            reader.readAsDataURL(files[0x0]);

            return;
        }

        changeBackgroundDefaultColorPalette(colorPalette);

    }


    return (
        <React.Fragment>
            <p className={`${settingsStyles.background__label} ${settingsStyles.label}`}>
                Background
            </p>
            <div className={`${settingsStyles.background__wrapper} ${settingsStyles.wrapper}`}>
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
                            backgroundImage: COLOR_PALETTE_OPTIONS[systemColorPalette]
                                             .taskbar.backgroundImage
                        }}
                    />
                    <div 
                        className={settingsStyles.background__previous__desktop}
                        style={{
                            backgroundImage: backgroundIsImageBlob
                                            ? `url(${backgroundImageUrl})`
                                            : COLOR_PALETTE_OPTIONS[systemColorPalette]
                                              .desktop.backgroundImage
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
                        {
                            fileInputRef.current?.files!.length
                            ? fileInputRef.current!.files![0x0].name 
                            : ''
                        }
                    </p>
                </div>

            </div>
        </React.Fragment>
    )
}
