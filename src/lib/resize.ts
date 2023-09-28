import { Data } from '@/types/data';
import { TOUCHABLE_AREA_TO_START_RESIZING_IN_PIXELS } from './initial/process';


export const getNewHeightAndYAxisOnTop = (
    movementIsInFavorOfYAxis: boolean, 
    element: Data.OpennedProcessData,
    previousYAxis: number,
    currentYAxis: number
) => {

    const newHeight = movementIsInFavorOfYAxis
                    ? element!.dimensions.height - (currentYAxis - previousYAxis)
                    : element!.dimensions.height + (previousYAxis - currentYAxis);

    const newCoordinates = movementIsInFavorOfYAxis
                         ? element!.coordinates.y + (currentYAxis - previousYAxis) 
                         : element!.coordinates.y - (previousYAxis - currentYAxis);

    return {
        newHeight,
        newCoordinates
    };

}


export const getNewWidthOnRight = (
    movementIsInFavorOfXAxis: boolean, 
    element: Data.OpennedProcessData,
    previousXAxis: number,
    currentXAxis: number
) => {

    const newWidth = movementIsInFavorOfXAxis
                    ? element!.dimensions.width + (currentXAxis - previousXAxis)
                    : element!.dimensions.width - (previousXAxis - currentXAxis);

    return newWidth;
    
}


export const getNewHeightAndYAxisOnBottom = (
    movementIsInFavorOfYAxis: boolean, 
    element: Data.OpennedProcessData,
    previousYAxis: number,
    currentYAxis: number
) => {

    const newHeight = movementIsInFavorOfYAxis
                    ? element!.dimensions.height + (currentYAxis - previousYAxis)
                    : element!.dimensions.height - (previousYAxis - currentYAxis);

    return newHeight;

}


export const getNewWidthAndXAxisOnLeft = (
    movementIsInFavorOfXAxis: boolean, 
    element: Data.OpennedProcessData,
    previousXAxis: number,
    currentXAxis: number
) => {

    const newWidth = movementIsInFavorOfXAxis 
                    ? element!.dimensions.width - (currentXAxis - previousXAxis)
                    : element!.dimensions.width + (previousXAxis - currentXAxis);

    const newCoordinates = movementIsInFavorOfXAxis
                         ? element!.coordinates.x + (currentXAxis - previousXAxis) 
                         : element!.coordinates.x - (previousXAxis - currentXAxis);

    return {
        newWidth,
        newCoordinates
    };
    
}


export const getResizeSide = (
    clientX: number,
    clientY: number, 
    processWindowRef: React.MutableRefObject<HTMLDivElement | null>
): string | undefined => {

    const processWindowElement = processWindowRef.current! as HTMLDivElement;

    const processWindowElementTop = processWindowElement.getBoundingClientRect().top;
    const processWindowElementRight = processWindowElement.getBoundingClientRect().right;
    const processWindowElementBottom = processWindowElement.getBoundingClientRect().bottom;
    const processWindowElementLeft = processWindowElement.getBoundingClientRect().left;

    const resizingTop = clientY
                        >= processWindowElementTop
                        && clientY
                        <= processWindowElementTop + TOUCHABLE_AREA_TO_START_RESIZING_IN_PIXELS;

    const resizingRight = clientX
                        <= processWindowElementRight
                        && clientX
                        >= processWindowElementRight - TOUCHABLE_AREA_TO_START_RESIZING_IN_PIXELS;

    const resizingBottom = clientY
                        <= processWindowElementBottom
                        && clientY
                        >= processWindowElementBottom - TOUCHABLE_AREA_TO_START_RESIZING_IN_PIXELS;

    const resizingLeft = clientX
                        >= processWindowElementLeft
                        && clientX
                        <= processWindowElementLeft + TOUCHABLE_AREA_TO_START_RESIZING_IN_PIXELS;

    const isResizing = resizingTop || resizingRight || resizingBottom || resizingLeft;

    if (isResizing) {
        if (resizingTop) return 'top';
        if (resizingRight) return 'right';
        if (resizingBottom) return 'bottom';
        if (resizingLeft) return 'left';
    }
 
    return undefined;
}