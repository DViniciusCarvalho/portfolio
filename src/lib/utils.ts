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