export function isResizeAction(
    event: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent, 
    processWindowRef: React.MutableRefObject<HTMLDivElement | null>
): string | false {

    const touchableAreaToResizeInPixels = 4;

    const processWindowElement = processWindowRef.current! as HTMLDivElement;

    const processWindowElementTop = processWindowElement.getBoundingClientRect().top;
    const processWindowElementRight = processWindowElement.getBoundingClientRect().right;
    const processWindowElementBottom = processWindowElement.getBoundingClientRect().bottom;
    const processWindowElementLeft = processWindowElement.getBoundingClientRect().left;

    const resizingTop = event.clientY 
                        >= processWindowElementTop
                        && event.clientY 
                        <= processWindowElementTop + touchableAreaToResizeInPixels;

    const resizingRight = event.clientX
                        <= processWindowElementRight
                        && event.clientX 
                        >= processWindowElementRight - touchableAreaToResizeInPixels;

    const resizingBottom = event.clientY
                        <= processWindowElementBottom
                        && event.clientY
                        >= processWindowElementBottom - touchableAreaToResizeInPixels;

    const resizingLeft = event.clientX
                        >= processWindowElementLeft
                        && event.clientX
                        <= processWindowElementLeft + touchableAreaToResizeInPixels;

    const isResizing = resizingTop || resizingRight || resizingBottom || resizingLeft;

    if (isResizing) {
        if (resizingTop) return "top";
        if (resizingRight) return "right";
        if (resizingBottom) return "bottom";
        if (resizingLeft) return "left";
    }
 
    return false;
}