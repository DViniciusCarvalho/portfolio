import React, { useContext } from 'react';
import { useDrop } from 'react-dnd';
import desktopStyles from '@/styles/workarea/Desktop.module.sass';
import ProcessWindow from '../window/ProcessWindow';
import { Data } from '@/types/data';
import { Props } from '@/types/props';
import { MainContext } from '../Main';
import { getDesktopStyles } from '@/lib/style';
import { getCurrentDesktopProcessesWindow } from '@/lib/utils';


export default function Desktop({ 
    UUID,
    opennedProcessesData, 
    applicationsWindowRef
}: Props.DesktopProps) {

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
                ${desktopStyles[!applicationsAreBeingShowed? 'app-showed' : 'app-not-showed']}
                `
            }
            style={{
                ...getDesktopStyles(
                    applicationsAreBeingShowed, 
                    currentActiveDesktopUUID, 
                    UUID, 
                    applicationsWindowRef,
                    systemColorPalette,
                    backgroundIsImageBlob, 
                    backgroundImageUrl
                ),

            }}
            id={UUID}
            onClick={() => changeCurrentDesktop(UUID)}
        >
            {
                getCurrentDesktopProcessesWindow(opennedProcessesData, UUID).map(opennedProcessData => (
                    <ProcessWindow  
                        key={`${opennedProcessData.processTitle}-${opennedProcessData.PID}`}
                        {...opennedProcessData}
                    />
			    ))
            }   
        </div>
    );
}
