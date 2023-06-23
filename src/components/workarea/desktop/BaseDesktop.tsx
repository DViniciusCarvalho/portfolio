import React, { useContext } from 'react';
import desktopStyles from '@/styles/workarea/Desktop.module.sass';
import { Props } from '@/types/props';
import { MainContext } from '../Main';
import { getCorrespondentDesktop } from '@/lib/utils';


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


    function getBaseDesktopResultantStyles(
        applicationsAreBeingShowed: boolean, 
        currentActiveDesktopUUID: string,
        applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>
    ): any {

        const anInvalidDesktopIsBeingShowed = !applicationsAreBeingShowed 
                                            && !getCorrespondentDesktop(
                                                    desktopActivitiesData, 
                                                    currentActiveDesktopUUID
                                                );

        const baseDesktopIsBeingShowed = currentActiveDesktopUUID === baseDesktopUUID 
                                         && !applicationsAreBeingShowed;

        const baseDesktopAndCanBeShowed = anInvalidDesktopIsBeingShowed || baseDesktopIsBeingShowed;

        const applicationsAreHiddenAndIsNotCurrentDesktop = !applicationsAreBeingShowed 
                                                            && currentActiveDesktopUUID 
                                                            !== baseDesktopUUID;

        const applicationsWindowWidth = applicationsWindowRef.current?.getBoundingClientRect().width;
        const applicationsWindowHeight = applicationsWindowRef.current?.getBoundingClientRect().height;

        const stylesWithoutTransform = {
            display: applicationsAreHiddenAndIsNotCurrentDesktop && !baseDesktopAndCanBeShowed? 'none' : 'block',
            position: baseDesktopAndCanBeShowed? 'absolute' : 'relative',
            width: baseDesktopAndCanBeShowed? applicationsWindowWidth : '220px',
            height: baseDesktopAndCanBeShowed? applicationsWindowHeight : '90%',
            top: baseDesktopAndCanBeShowed? 0 : 0,
            left: baseDesktopAndCanBeShowed? 0 : 0,
        };

        return {
            ...stylesWithoutTransform,
            transform: `scale(${baseDesktopAndCanBeShowed? 1 : 0.9})`
        };

    }


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
                ...getBaseDesktopResultantStyles(
                    applicationsAreBeingShowed, 
                    currentActiveDesktopUUID, 
                    applicationsWindowRef
                )
            }}
            id={baseDesktopUUID}
            onClick={() => handleChangeCurrentDesktop(baseDesktopUUID)}
        />   
    );
}

