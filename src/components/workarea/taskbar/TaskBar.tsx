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
import { deepClone, generateUUID } from '@/lib/utils';


export default function TaskBar({ 
    taskBarRef 
}: Props.TaskBarProps) {

    const { 
        themeStyleClass, 
        layoutStyleClass, 
        applicationsAreBeingShowed
    } = useContext(MainContext);


    const nautilusProps: Props.ProcessIconProps = {
        processIconStaticImage: NautilusIcon,
        processName: 'Files',
        processElement: <Nautilus/>
    };

    const terminalProps: Props.ProcessIconProps = {
        processIconStaticImage: TerminalIcon,
        processName: 'Terminal',
        processElement: <Terminal/>
    };

    const userTrashProps: Props.ProcessIconProps = {
        processIconStaticImage: UserTrashIcon,
        processName: 'Trash',
        processElement: <UserTrash/>
    };

    const settingsProps: Props.ProcessIconProps = {
        processIconStaticImage: SettingsIcon,
        processName: 'Settings',
        processElement: <Settings/>
    };

    const [ favoriteProcessesIconProps, setFavoriteProcessesIconProps ] = useState([
        nautilusProps,
        terminalProps,
        settingsProps
    ]);




    return (
        <div 
            ref={taskBarRef}
            className={`
                ${taskBarStyles.container} 
                ${taskBarStyles[themeStyleClass]} 
                ${taskBarStyles[applicationsAreBeingShowed? 'applications__showed' : '']}
                ${taskBarStyles[layoutStyleClass]}
                `
            }
        >
            <div className={taskBarStyles.process__icons__first__wrapper}>
                {favoriteProcessesIconProps.map(favoriteProcessIconProps => (
                    <ProcessIcon 
                        key={favoriteProcessIconProps.processName} 
                        {...deepClone(favoriteProcessIconProps)}
                    />
                ))}
            </div>
            <hr className={taskBarStyles.process__trash__separator}/>
            <div className={taskBarStyles.process__icons__second__wrapper}>
                <ProcessIcon {...userTrashProps}/>
            </div>
            <div className={taskBarStyles.show__applications__wrapper}>
                <ShowApplications/>
            </div>
        </div>
    );
}
