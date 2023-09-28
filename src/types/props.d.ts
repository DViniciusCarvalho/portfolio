import { StaticImageData } from 'next/image';
import { Data } from './data';
import { MutableRefObject } from 'react';

export namespace Props {

    interface GlobalMenuProps {
        globalMenuRef: React.MutableRefObject<HTMLDivElement | null>;
    }

    interface TaskBarProps {
        taskBarRef: React.MutableRefObject<HTMLDivElement | null>; 
        applicationsPropsDataInTaskbar: Props.ProcessIconProps[];
    }

    interface ApplicationsWindowProps {
        applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>;
        opennedProcessesData: Data.OpennedProcessData[];
        workspaceActivitiesData: Data.WorkspaceActivityData[];
        baseWorkspaceUUID: string;
    }

    interface ProcessIconProps {
        processIconStaticImage: StaticImageData;
        processIconAlt: string;
        processName: string;
        processElement: JSX.Element;
        initialPID?: number;
    }

    interface ApplicationIconProps {
        applicationIconStaticImage: StaticImageData;
        applicationIconAlt: string;
        applicationName: string;
        applicationElement: JSX.Element;
    }

    interface WorkspaceProps {
        UUID: string;
        opennedProcessesData: Data.OpennedProcessData[];
        applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>;
    }

    interface BaseWorkspaceProps {
        baseWorkspaceUUID: string;
        workspaceActivitiesData: Data.WorkspaceActivityData[];
        applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>;
    }
    
    interface ProcessWindowProps {
        PID: number;
        processTitle: string;
        processIcon: StaticImageData;
        processIconAlt: string;
        processElement: JSX.Element;
        zIndex: number;
        isMinimized: boolean;
        isMaximized: boolean;
        parentWorkspaceUUID: string;
        coordinates: {
            x: number;
            y: number;
        };
        dimensions: {
            width: number,
            height: number
        }; 
    }

    interface ProcessWindowMinimalContentVersionProps {
        processIcon: StaticImageData;
        processIconAlt: string;
        processName: string;
    }

    interface CommandLineProps {
        user: string;
        domain: string;
        directory: string;
    }

    interface ResultLineProps {
        commandResult: string;
    }

    interface NautilusProps {
        initialPath?: string;
    }

    interface NautilusIconProps {
        name: string;
        path: string;
        type: string;
    }

    interface ContextMenuProps {
        origin: {
            x: number;
            y: number;
        };
        options: {
            text: string;
            handler: any;
        }[];
        targetPath: string;
    }

    interface RenameFilePromptProps {
        currentPath: string;
        oldName: string;
        closePrompts: () => void;
    }

    interface NewFolderPromptProps {
        currentPath: string;
        closePrompts: () => void;
    }

    interface LocationDirButtonProps {
        title: string;
        iconSrc: StaticImageData;
        iconAlt: string;
        locationPath: string;
        openDirectory: (path: string) => void
    }
}