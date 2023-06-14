import React, { useContext } from "react";
import taskBarStyles from "@/styles/workarea/taskbar/TaskBar.module.sass";
import { MainContext } from "../Main";

import ProcessIcon from "./ProcessIcon";
import NautilusIcon from "../../../../public/assets/nautilus.png";
import TerminalIcon from "../../../../public/assets/terminal.png";
import UserTrash from "../../../../public/assets/user-trash.png";

import { Props } from "@/types/props";


export default function TaskBar({ 
    taskBarRef, 
    openProcess, 
    restorePreviousDimensions 
}: Props.TaskBarProps) {

    const { 
        themeStyleClass, 
        layoutStyleClass, 
    } = useContext(MainContext);

    const nautilusProps: Props.ProcessIconProps = {
        processIconStaticImage: NautilusIcon,
        processName: "Files",
        processElement: <></>,
        startProcess: openProcess,
        restorePreviousDimensions: restorePreviousDimensions
    };

    const terminalProps: Props.ProcessIconProps = {
        processIconStaticImage: TerminalIcon,
        processName: "Terminal",
        processElement: <></>,
        startProcess: openProcess,
        restorePreviousDimensions: restorePreviousDimensions
    };

    const userTrash: Props.ProcessIconProps = {
        processIconStaticImage: UserTrash,
        processName: "Trash",
        processElement: <></>,
        startProcess: openProcess,
        restorePreviousDimensions: restorePreviousDimensions
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
            </div>
            <hr className={taskBarStyles.process__trash__separator}/>
            <div className={taskBarStyles.process__icons__second__wrapper}>
                <ProcessIcon {...userTrash}/>
            </div>
        </div>
    );
}
