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
        themeStyleClass, 
        layoutStyleClass, 
        applicationsAreBeingShowed, 
        currentActiveDesktopUUID,
        handleChangeCurrentDesktop
    } = useContext(MainContext);


    return (
        <div
            className={`
                ${desktopStyles.container} 
                ${desktopStyles[themeStyleClass]} 
                ${desktopStyles[layoutStyleClass]}
                ${desktopStyles[!applicationsAreBeingShowed? 'showed' : 'not__showed']}
                `
            }
            style={{
                ...getBaseDesktopStyles(
                    applicationsAreBeingShowed, 
                    currentActiveDesktopUUID, 
                    baseDesktopUUID,
                    desktopActivitiesData,
                    applicationsWindowRef
                )
            }}
            id={baseDesktopUUID}
            onClick={() => handleChangeCurrentDesktop(baseDesktopUUID)}
        />   
    );
}
