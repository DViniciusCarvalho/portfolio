import React, { useContext } from "react";
import taskBarStyles from "@/styles/workarea/taskbar/TaskBar.module.sass";
import ProcessIcon from "./ProcessIcon";
import ShowApplications from "./ShowApplications";

import NautilusIcon from "../../../../public/assets/nautilus.png";
import TerminalIcon from "../../../../public/assets/terminal.png";
import SettingsIcon from "../../../../public/assets/preferences-desktop.png";
import UserTrashIcon from "../../../../public/assets/user-trash.png";

import Nautilus from "@/components/processes/Nautilus";
import Terminal from "@/components/processes/Terminal";
import UserTrash from "@/components/processes/UserTrash";
import Settings from "@/components/processes/Settings";

import { Props } from "@/types/props";
import { MainContext } from "../Main";


export default function TaskBar({ 
    taskBarRef, 
    openProcess, 
    restorePreviousDimensions 
}: Props.TaskBarProps) {

    const { 
        themeStyleClass, 
        layoutStyleClass, 
    } = useContext(MainContext);

    const commonProperties = {
        startProcess: openProcess,
        restorePreviousDimensions: restorePreviousDimensions
    };

    const nautilusProps: Props.ProcessIconProps = {
        processIconStaticImage: NautilusIcon,
        processName: "Files",
        processElement: <Nautilus/>,
        ...commonProperties
    };

    const terminalProps: Props.ProcessIconProps = {
        processIconStaticImage: TerminalIcon,
        processName: "Terminal",
        processElement: <Terminal/>,
        ...commonProperties
    };

    const userTrashProps: Props.ProcessIconProps = {
        processIconStaticImage: UserTrashIcon,
        processName: "Trash",
        processElement: <UserTrash/>,
        ...commonProperties
    };

    const settingsProps: Props.ProcessIconProps = {
        processIconStaticImage: SettingsIcon,
        processName: "Settings",
        processElement: <Settings/>,
        ...commonProperties
    };


    return (
        <div 
          ref={taskBarRef}
          className={`
            ${taskBarStyles.container} 
            ${taskBarStyles[themeStyleClass]} 
            ${taskBarStyles[layoutStyleClass]}
            `
          }
        >
            <div className={taskBarStyles.process__icons__first__wrapper}>
                <ProcessIcon {...nautilusProps}/>
                <ProcessIcon {...terminalProps}/>
                <ProcessIcon {...settingsProps}/>
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
