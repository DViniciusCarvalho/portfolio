import React, { useContext } from 'react';
import workspaceStyles from '@/styles/workarea/Workspace.module.sass';
import { MainContext } from '@/components/workarea/Main';
import { Props } from '@/types/props';
import { getWorkspaceStyles } from '@/lib/style';
import { getCurrentWorkspaceProcessesWindow } from '@/lib/workspace';
import ProcessWindow from '../window/ProcessWindow';


export default function Workspace({ 
    UUID,
    opennedProcessesData, 
    applicationsWindowRef
}: Props.WorkspaceProps) {

    const { 
        systemColorPalette, 
        systemLayout, 
        backgroundIsImageBlob,
        backgroundImageUrl,
        applicationsAreBeingShowed, 
        currentActiveWorkspaceUUID,
        changeCurrentWorkspace,
    } = useContext(MainContext);


    return (
        <div
            className={`
                ${workspaceStyles.container} 
                ${workspaceStyles[systemLayout]}
                ${workspaceStyles[
                    applicationsAreBeingShowed? 'app--showed' : 'app--not--showed'
                ]}
                `
            }
            style={{
                ...getWorkspaceStyles(
                    applicationsAreBeingShowed, 
                    currentActiveWorkspaceUUID, 
                    UUID, 
                    applicationsWindowRef,
                    systemColorPalette,
                    backgroundIsImageBlob, 
                    backgroundImageUrl
                )
            }}
            id={UUID}
            onClick={() => changeCurrentWorkspace(UUID)}
        >
            {
                getCurrentWorkspaceProcessesWindow(opennedProcessesData, UUID)
                .map((opennedProcessData, index) => (
                    <ProcessWindow  
                        key={`${opennedProcessData.processTitle}-${opennedProcessData.PID}`}
                        {...opennedProcessData}
                    />
			    ))
            }   
        </div>
    );
}
