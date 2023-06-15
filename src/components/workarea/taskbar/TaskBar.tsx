import React, { useContext } from "react";
import taskBarStyles from "@/styles/workarea/taskbar/TaskBar.module.sass";
import ProcessIcon from "./ProcessIcon";
import NautilusIcon from "../../../../public/assets/nautilus.png";
import TerminalIcon from "../../../../public/assets/terminal.png";
import UserTrash from "../../../../public/assets/user-trash.png";
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
        processElement: <></>,
        ...commonProperties
    };

    const terminalProps: Props.ProcessIconProps = {
        processIconStaticImage: TerminalIcon,
        processName: "Terminal",
        processElement: <></>,
        ...commonProperties
    };

    const userTrash: Props.ProcessIconProps = {
        processIconStaticImage: UserTrash,
        processName: "Trash",
        processElement: <></>,
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
            </div>
            <hr className={taskBarStyles.process__trash__separator}/>
            <div className={taskBarStyles.process__icons__second__wrapper}>
                <ProcessIcon {...userTrash}/>
            </div>
        </div>
    );
}
