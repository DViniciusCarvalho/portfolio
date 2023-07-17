import React, { useContext, useState } from 'react';
import taskBarStyles from '@/styles/workarea/taskbar/TaskBar.module.sass';
import ProcessIcon from './ProcessIcon';
import ShowApplications from './ShowApplications';

import NautilusIcon from '../../../../public/assets/nautilus.png';
import TerminalIcon from '../../../../public/assets/terminal.png';
import SettingsIcon from '../../../../public/assets/preferences-desktop.png';
import UserTrashIcon from '../../../../public/assets/user-trash.png';

import Nautilus from '@/components/processes/Nautilus';
import Terminal from '@/components/processes/terminal/Terminal';
import Settings from '@/components/processes/settings/Settings';
import UserTrash from '@/components/processes/UserTrash';

import { Props } from '@/types/props';
import { MainContext } from '@/components/workarea/Main';
import { generateJSXKey } from '@/lib/utils';

import { getTaskBarStyles } from '@/lib/style';


export default function TaskBar({ 
    taskBarRef,
    applicationsPropsDataInTaskbar
}: Props.TaskBarProps) {

    const { 
        systemColorPalette, 
        systemLayout, 
        backgroundIsImageBlob,
        applicationsAreBeingShowed
    } = useContext(MainContext);


    const favoriteProcessesIconProps: Props.ProcessIconProps[] = [
        {
            processIconStaticImage: NautilusIcon,
            processName: 'Files',
            processElement: <Nautilus/>
        },
        {
            processIconStaticImage: TerminalIcon,
            processName: 'Terminal',
            processElement: <Terminal/>
        },
        {
            processIconStaticImage: SettingsIcon,
            processName: 'Settings',
            processElement: <Settings/>
        }
    ];

    const otherProcessesIconProps: Props.ProcessIconProps[] = [
        {
            processIconStaticImage: UserTrashIcon,
            processName: 'Trash',
            processElement: <UserTrash/>
        }
    ];


    return (
        <div 
            className={`
                ${taskBarStyles.container} 
                ${taskBarStyles[applicationsAreBeingShowed? 'app-showed' : 'app-not-showed']}
                ${taskBarStyles[systemLayout]}
                `
            }
            style={{
                ...getTaskBarStyles(
                    systemColorPalette,
                    backgroundIsImageBlob
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
                            {...favoriteProcessIconProps}
                            initialPID={0}
                        />
                    ))
                }

            </div>
            <hr className={taskBarStyles.process__trash__separator}/>
            <div className={taskBarStyles.process__icons__second__wrapper}>

                {
                    [...otherProcessesIconProps, ...applicationsPropsDataInTaskbar]
                    .map((otherProcessIconProps, index) => (
                        <ProcessIcon 
                            key={generateJSXKey(
                                'other-process-icon', 
                                otherProcessIconProps.processName, 
                                index
                            )} 
                            {...otherProcessIconProps}
                            initialPID={0}
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
