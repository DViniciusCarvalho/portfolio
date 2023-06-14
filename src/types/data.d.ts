export namespace Data {

    interface OpennedProcessData {
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
        }
    }

    interface DraggableProcessWindow {
        dragRef: React.MutableRefObject<HTMLDivElement | null>;
        PID: number;
        pressedCoordinates: {
            x: number;
            y: number;
        };
    }
}