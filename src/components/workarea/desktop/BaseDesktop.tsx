import React, { useContext } from 'react';
import desktopStyles from '@/styles/workarea/Desktop.module.sass';
import { Props } from '@/types/props';
import { MainContext } from '../Main';
import { getBaseDesktopStyles } from '@/lib/style';


export default function BaseDesktop({ 
    baseDesktopUUID,
    desktopActivitiesData,
    applicationsWindowRef
}: Props.BaseDesktopProps) {

    const { 
        systemColorPalette,
        systemLayout, 
        backgroundIsImageBlob, 
        backgroundImageUrl,
        applicationsAreBeingShowed, 
        currentActiveDesktopUUID,
        changeCurrentDesktop
    } = useContext(MainContext);


    return (
        <div
            className={`
                ${desktopStyles.container} 
                ${desktopStyles[systemLayout]}
                ${desktopStyles[applicationsAreBeingShowed? 'app-showed' : 'app-not-showed']}
                `
            }
            style={{
                ...getBaseDesktopStyles(
                    applicationsAreBeingShowed, 
                    currentActiveDesktopUUID, 
                    baseDesktopUUID,
                    desktopActivitiesData,
                    applicationsWindowRef,
                    systemColorPalette,
                    backgroundIsImageBlob, 
                    backgroundImageUrl
                )
            }}
            id={baseDesktopUUID}
            onClick={() => changeCurrentDesktop(baseDesktopUUID)}
        />   
    );
}

