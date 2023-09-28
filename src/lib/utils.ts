import { isValidElement } from 'react';


export const delay = (ms: number): Promise<null> => {
    return new Promise(res => setTimeout(() => res(null), ms));
}


export const deepClone = <T>(object: T): T => {

    if (typeof object !== 'object' || object === null) return object;

    if (isValidElement(object)) return object as unknown as T;
    
    const newObject: T | [] | {} = Array.isArray(object)? [] : {};

    for (let key in object) {
        const value = object[key];
        (newObject as T)[key] = deepClone(value);
    }

    return newObject as T;
}


export const debounce = <T extends Function>(func: T, wait: number, immediate: boolean) => {
    let timeout: ReturnType<typeof setTimeout> | null;
    return function(this: any, ...args: any) {
        const context = this;
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout!);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}


export const generateUUID = (): string => {
    const replaceFunction = (char: string): string => {
        const randomNumber = (Math.random() * 16) | 0;
        const value = (char === 'x') ? randomNumber : (randomNumber & 0x3) | 0x8;

        return value.toString(16);
    };

    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, replaceFunction);

    return uuid;
}


export const generateJSXKey = (type: string, name: string, index: number): string => {
    const key = `${type}-${name}:${index}`;

    return key;
}


export const getDateString = (): string => {
    const currentDate = new Date();

    const weekDay = currentDate.toLocaleDateString('en-us', { weekday: 'short' }).toLowerCase();
    const month = currentDate.toLocaleDateString('en-us', { month: 'short' }).toLowerCase();
    const monthDay = currentDate.toLocaleDateString('en-us', { day: '2-digit' });

    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');

    return `${weekDay} ${month} ${monthDay} ${hours}:${minutes}`;
}