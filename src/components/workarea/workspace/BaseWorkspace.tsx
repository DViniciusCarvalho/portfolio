import React, { useContext } from 'react';
import workspaceStyles from '@/styles/workarea/Workspace.module.sass';
import { Props } from '@/types/props';
import { MainContext } from '../Main';
import { getBaseWorkspaceStyles } from '@/lib/style';


export default function BaseWorkspace({ 
    baseWorkspaceUUID,
    workspaceActivitiesData,
    applicationsWindowRef
}: Props.BaseWorkspaceProps) {

    const { 
        systemColorPalette,
        systemLayout, 
        backgroundIsImageBlob, 
        backgroundImageUrl,
        applicationsAreBeingShowed, 
        currentActiveWorkspaceUUID,
        changeCurrentWorkspace
    } = useContext(MainContext);


    return (
        <div
            className={`
                ${workspaceStyles.container} 
                ${workspaceStyles[systemLayout]}
                ${workspaceStyles[applicationsAreBeingShowed? 'app-showed' : 'app-not-showed']}
                `
            }
            style={{
                ...getBaseWorkspaceStyles(
                    applicationsAreBeingShowed, 
                    currentActiveWorkspaceUUID, 
                    baseWorkspaceUUID,
                    workspaceActivitiesData,
                    applicationsWindowRef,
                    systemColorPalette,
                    backgroundIsImageBlob, 
                    backgroundImageUrl
                )
            }}
            id={baseWorkspaceUUID}
            onClick={() => changeCurrentWorkspace(baseWorkspaceUUID)}
        />   
    );
}

