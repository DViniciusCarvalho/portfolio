import { StaticImageData } from "next/image";
import { Data } from "./data";

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
        desktopActivitiesData: Data.DesktopActivityData[];
        baseDesktopUUID: string;
    }

    interface ProcessIconProps {
        processIconStaticImage: StaticImageData;
        processName: string;
        processElement: JSX.Element;
        initialPID?: number;
    }

    interface ApplicationIconProps {
        applicationIconStaticImage: StaticImageData;
        applicationName: string;
        applicationElement: JSX.Element;
    }

    interface DesktopProps {
        UUID: string;
        opennedProcessesData: Data.OpennedProcessData[];
        applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>;
    }

    interface BaseDesktopProps {
        baseDesktopUUID: string;
        desktopActivitiesData: Data.DesktopActivityData[];
        applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>;
    }
    
    interface ProcessWindowProps {
        PID: number;
        processTitle: string;
        processIcon: StaticImageData;
        processElement: JSX.Element;
        zIndex: number;
        isMinimized: boolean;
        isMaximized: boolean;
        parentDesktopUUID: string;
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
        processName: string;
    }

}