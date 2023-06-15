import { isValidElement } from "react";
import { Data } from "@/types/data";

export function deepClone<T>(object: T): T {
    if (typeof object !== "object" || object === null) return object;
    if (isValidElement(object)) return object as unknown as T;
    
    const newObject: T | [] | {} = Array.isArray(object)? [] : {};
    for (let key in object) {
        const value = object[key];
        (newObject as T)[key] = deepClone(value);
    }
    return newObject as T;
}

export function getCorrespondentRunningProcess(
    opennedProcessesData: Data.OpennedProcessData[],
    PID: number
): Data.OpennedProcessData | undefined {

    const processFound = opennedProcessesData.find(
        processData => processData.PID === PID
    );
    
    return processFound;
}

export function getNewHeightAndYAxisOnTop(
    movementIsInFavorOfYAxis: boolean, 
    element: Data.OpennedProcessData,
    previousYAxis: number,
    currentYAxis: number
) {

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

export function getNewWidthOnRight(
    movementIsInFavorOfXAxis: boolean, 
    element: Data.OpennedProcessData,
    previousXAxis: number,
    currentXAxis: number
) {

    const newWidth = movementIsInFavorOfXAxis
                    ? element!.dimensions.width + (currentXAxis - previousXAxis)
                    : element!.dimensions.width - (previousXAxis - currentXAxis);

    return newWidth;
    
}

export function getNewHeightAndYAxisOnBottom(
    movementIsInFavorOfYAxis: boolean, 
    element: Data.OpennedProcessData,
    previousYAxis: number,
    currentYAxis: number
) {

    const newHeight = movementIsInFavorOfYAxis
                    ? element!.dimensions.height + (currentYAxis - previousYAxis)
                    : element!.dimensions.height - (previousYAxis - currentYAxis);

    return newHeight;

}

export function getNewWidthAndXAxisOnLeft(
    movementIsInFavorOfXAxis: boolean, 
    element: Data.OpennedProcessData,
    previousXAxis: number,
    currentXAxis: number
) {

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