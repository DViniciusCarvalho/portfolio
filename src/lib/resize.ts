import { Data } from "@/types/data";


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