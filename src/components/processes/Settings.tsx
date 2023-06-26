import React, { useContext, useRef } from 'react';
import settingsStyles from '@/styles/processes/Settings.module.sass';
import { MainContext } from '../workarea/Main';

export default function Settings() {

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const { changeBackgroundStyle } = useContext(MainContext);

    function changeBackgroundStyleMiddleware(
        fileInputRef: React.MutableRefObject<HTMLInputElement | null>
    ): void {

        const files = fileInputRef.current!.files!;
  
        if (files.length) {
            const base64ImageBlob = files[0x0];
            changeBackgroundStyleToBase64EncodedImageBlob(base64ImageBlob);

            return;
        }




    }

    function changeBackgroundStyleToBase64EncodedImageBlob(backgroundImageFile: File): void {
        const reader = new FileReader();
        
        reader.addEventListener('load', () => {
            const imageUrl = reader.result;
            changeBackgroundStyle(true, imageUrl);
        });
        
        reader.readAsDataURL(backgroundImageFile);
    }

    return (
        <div className={settingsStyles.container}>
            <div className={settingsStyles.background__wrapper}>
                <input 
                    type="file" 
                    onInput={() => changeBackgroundStyleMiddleware(fileInputRef)} 
                    ref={fileInputRef}
                />
            </div>
            <div className={settingsStyles.appearance__wrapper}>

            </div>
        </div>
    );
}