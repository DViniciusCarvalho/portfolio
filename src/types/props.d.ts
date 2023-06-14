import { StaticImageData } from "next/image";
import { Data } from "./data";

export namespace Props {

    interface TaskBarProps {
        taskBarRef: React.MutableRefObject<null>;
        openProcess: (processTitle: string, processElement: JSX.Element) => number;
        restorePreviousDimensions: (PID: number) => void;
    }

    interface ProcessIconProps {
        processIconStaticImage: StaticImageData;
        processName: string;
        processElement: JSX.Element;
        startProcess: (processTitle: string, processElement: JSX.Element) => number;
        restorePreviousDimensions: (PID: number) => void;
    }

    interface DesktopProps {
        desktopRef: React.MutableRefObject<HTMLDivElement | null>;
        opennedProcessesData: Data.OpennedProcessData[];
        updateProcessCoordinates: (PID: number, XAxis: number, YAxis: number) => void;
    }
    
    interface ProcessWindowProps {
        PID: number;
        processTitle: string;
        processElement: JSX.Element;
        zIndex: number;
        isMinimized: boolean;
        isMaximized: boolean;
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