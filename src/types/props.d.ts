import { StaticImageData } from "next/image";
import { Data } from "./data";

export namespace Props {

    interface GlobalMenuProps {
        globalMenuRef: React.MutableRefObject<HTMLDivElement | null>;
    }

    interface TaskBarProps {
        taskBarRef: React.MutableRefObject<HTMLDivElement | null>;
        openProcess: (processTitle: string, processElement: JSX.Element) => number;
        restorePreviousDimensions: (PID: number) => void;
    }

    interface ApplicationsWindowProps {
        applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>;
        opennedProcessesData: Data.OpennedProcessData[];
        updateProcessCoordinates: (PID: number, XAxis: number, YAxis: number) => void;
        desktopActivities: Data.DesktopActivityData[];
        baseDesktopUUID: string;
    }

    interface ProcessIconProps {
        processIconStaticImage: StaticImageData;
        processName: string;
        processElement: JSX.Element;
        startProcess: (processTitle: string, processElement: JSX.Element) => number;
        restorePreviousDimensions: (PID: number) => void;
    }

    interface DesktopProps {
        UUID: string;
        opennedProcessesData: Data.OpennedProcessData[];
        updateProcessCoordinates: (PID: number, XAxis: number, YAxis: number) => void;
        applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>;
    }
    
    interface ProcessWindowProps {
        PID: number;
        processTitle: string;
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
}