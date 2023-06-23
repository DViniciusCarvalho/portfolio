import { isValidElement } from 'react';
import { Data } from '@/types/data';

export function deepClone<T>(object: T): T {
    if (typeof object !== 'object' || object === null) return object;
    if (isValidElement(object)) return object as unknown as T;
    
    const newObject: T | [] | {} = Array.isArray(object)? [] : {};
    for (let key in object) {
        const value = object[key];
        (newObject as T)[key] = deepClone(value);
    }
    return newObject as T;
}

export function generateUUID(): string {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0;
        const v = (c === 'x') ? r : (r & 0x3) | 0x8;

        return v.toString(16);
    });

    return uuid;
}

export function getDateString(): string {
    const currentDate = new Date();

    const weekDay = currentDate.toLocaleDateString('en-us', { weekday: 'short' }).toLowerCase();
    const month = currentDate.toLocaleDateString('en-us', { month: 'short' }).toLowerCase();
    const monthDay = currentDate.toLocaleDateString('en-us', { day: '2-digit' });

    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');

    return `${weekDay} ${month} ${monthDay} ${hours}:${minutes}`;
}

export function getCorrespondentRunningProcess(
    opennedProcessesData: Data.OpennedProcessData[],
    PID: number
): Data.OpennedProcessData | undefined {

    const processFound = opennedProcessesData.find(processData => 
        processData.PID === PID
    );
    
    return processFound;
}

export function getCorrespondentDesktop(
    desktopActivitiesData: Data.DesktopActivityData[],
    UUID: string
): Data.DesktopActivityData | undefined {

    const desktopFound = desktopActivitiesData.find(desktopActivityData => 
        desktopActivityData.UUID === UUID
    );
    
    return desktopFound;
}

export function getParentDesktopUUID(
    currentActiveDesktopUUID: string, 
    currentActiveDesktopDoesNotExists: boolean,
    baseDesktopUUID: string
): string {

    const currentUUIDEqualsToBaseDesktopUUID = currentActiveDesktopUUID === baseDesktopUUID;
    const invalidUUID = currentActiveDesktopDoesNotExists || currentUUIDEqualsToBaseDesktopUUID;

    return invalidUUID? generateUUID() : currentActiveDesktopUUID;
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

export function getRelativeInitialDimension(
    axis: string, 
    percentage: number, 
    applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>
) {
    
    const applicationsWindowElement = applicationsWindowRef.current as HTMLDivElement;

    const applicationsWindowWidth = applicationsWindowElement.getBoundingClientRect().width;
    const applicationsWindowHeight = applicationsWindowElement.getBoundingClientRect().height;

    return axis === 'x'
            ? applicationsWindowWidth * percentage / 100
            : applicationsWindowHeight * percentage / 100;
}