import React, { useContext, useState } from 'react';
import taskBarStyles from '@/styles/workarea/taskbar/TaskBar.module.sass';
import ProcessIcon from './ProcessIcon';
import ShowApplications from './ShowApplications';

import NautilusIcon from '../../../../public/assets/nautilus.png';
import TerminalIcon from '../../../../public/assets/terminal.png';
import SettingsIcon from '../../../../public/assets/preferences-desktop.png';
import UserTrashIcon from '../../../../public/assets/user-trash.png';

import Nautilus from '@/components/processes/Nautilus';
import Terminal from '@/components/processes/Terminal';
import UserTrash from '@/components/processes/UserTrash';
import Settings from '@/components/processes/Settings';

import { Props } from '@/types/props';
import { MainContext } from '../Main';
import { deepClone, generateJSXKey } from '@/lib/utils';

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


    const [ 
        favoriteProcessesIconProps, 
        setFavoriteProcessesIconProps 
    ] = useState<Props.ProcessIconProps[]>([
        {
            processIconStaticImage: NautilusIcon,
            processName: 'Files',
            processElement: <Nautilus/>,
            initialPID: 0
        },
        {
            processIconStaticImage: TerminalIcon,
            processName: 'Terminal',
            processElement: <Terminal/>,
            initialPID: 0
        },
        {
            processIconStaticImage: SettingsIcon,
            processName: 'Settings',
            processElement: <Settings/>,
            initialPID: 0
        }
    ]);

    const [
        otherProcessesIconProps,
        setOtherProcessesIconProps
    ] = useState<Props.ProcessIconProps[]>([
        {
            processIconStaticImage: UserTrashIcon,
            processName: 'Trash',
            processElement: <UserTrash/>,
            initialPID: 0
        }
    ]);




    return (
        <div 
            ref={taskBarRef}
            className={`
                ${taskBarStyles.container} 
                ${taskBarStyles[applicationsAreBeingShowed? 'applications__showed' : '']}
                ${taskBarStyles[systemLayout]}
                `
            }
            style={{
                ...getTaskBarStyles(
                    systemColorPalette,
                    backgroundIsImageBlob
                )
            }}
        >
            <div className={taskBarStyles.process__icons__first__wrapper}>

                {favoriteProcessesIconProps.map((favoriteProcessIconProps, index) => (
                    <ProcessIcon 
                        key={generateJSXKey(
                            'favorite-process-icon', 
                            favoriteProcessIconProps.processName, 
                            index
                        )} 
                        {...deepClone(favoriteProcessIconProps)}
                    />
                ))}

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
                            {...deepClone(otherProcessIconProps)}
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
