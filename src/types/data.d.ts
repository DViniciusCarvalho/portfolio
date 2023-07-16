import { StaticImageData } from "next/image";

export namespace Data {

    interface OpennedProcessData {
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
        }
    }

    interface DesktopActivityData {
        UUID: string;

    }

    interface DraggableProcessWindow {
        dragRef: React.MutableRefObject<HTMLDivElement | null>;
        PID: number;
        pressedCoordinates: {
            x: number;
            y: number;
        };
    }

    interface ApplicationMetadata {
        metadata: {
            description: string;
            keyWords: string[];
            category: string[];
        }
    }

    interface ColorPaletteOptions {
        readonly [key: string]: {
            settingsColor: string;
            lightenedColor: string;
            opennedIndicatorColor: string;
            desktop: {
                backgroundImage: string;
            },
            taskbar: {
                backgroundImage: string;
                borderColor: string;
            }
        }
    }

    interface TerminalLine {
        element: JSX.Element;
        key: number;
    }

}