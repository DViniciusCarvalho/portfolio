import React, { useContext } from 'react';
import taskBarStyles from '@/styles/workarea/taskbar/TaskBar.module.sass';
import { MainContext } from '@/components/workarea/Main';
import { Props } from '@/types/props';
import { generateJSXKey } from '@/lib/utils';
import { getTaskBarStyles } from '@/lib/style';
import { terminalProcessData } from '@/components/processes/terminal/Terminal';
import { userTrashProcessData } from '@/components/processes/files/UserTrash';
import { nautilusProcessData } from '@/components/processes/files/Nautilus';
import { settingsProcessData } from '@/components/processes/settings/Settings';
import ShowApplications from './ShowApplications';
import ProcessIcon from './ProcessIcon';


export default function TaskBar({ 
    taskBarRef,
    applicationsPropsDataInTaskbar
}: Props.TaskBarProps) {

    const { 
        systemColorPalette, 
        systemLayout, 
        applicationsAreBeingShowed
    } = useContext(MainContext);


    const favoriteProcessesIconProps: Props.ProcessIconProps[] = [
        nautilusProcessData,
        terminalProcessData,
        settingsProcessData
    ];

    const otherProcessesIconProps: Props.ProcessIconProps[] = [
        userTrashProcessData
    ];


    return (
        <div 
            className={`
                ${taskBarStyles.container} 
                ${taskBarStyles[systemLayout]}
                ${taskBarStyles[
                    applicationsAreBeingShowed? 'app--showed' : 'app--not--showed'
                ]}
                `
            }
            style={{
                ...getTaskBarStyles(
                    systemColorPalette
                )
            }}
            ref={taskBarRef}
        >
            <div className={taskBarStyles.process__icons__first__wrapper}>
                {
                    favoriteProcessesIconProps.map((favoriteProcessIconProps, index) => (
                        <ProcessIcon 
                            key={generateJSXKey(
                                'favorite-process-icon', 
                                favoriteProcessIconProps.processName, 
                                index
                            )} 
                            initialPID={0}
                            {...favoriteProcessIconProps}
                        />
                    ))
                }
            </div>
            <hr className={taskBarStyles.process__trash__separator}/>
            <div className={taskBarStyles.process__icons__second__wrapper}>
                {
                    [
                        ...otherProcessesIconProps, 
                        ...applicationsPropsDataInTaskbar
                    ].map((otherProcessIconProps, index) => (
                        <ProcessIcon 
                            key={generateJSXKey(
                                'other-process-icon', 
                                otherProcessIconProps.processName, 
                                index
                            )} 
                            initialPID={0}
                            {...otherProcessIconProps} 
                        />
                    ))
                }
            </div>
            <div className={taskBarStyles.show__applications__wrapper}>
                <ShowApplications/>
            </div>
        </div>
    );
}
