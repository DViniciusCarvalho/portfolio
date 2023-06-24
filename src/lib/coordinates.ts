
export const getXAxisInterference = (
    taskBarRef: React.MutableRefObject<HTMLDivElement | null>,
    currentLayoutStyleClass: string
): number => {

    const taskBarElement = taskBarRef.current! as HTMLDivElement;
    const taskBarWidth = taskBarElement.getBoundingClientRect().width;

    const isCurrentLayoutRowStyle = currentLayoutStyleClass === 'row__style';
    const isLessThanOrEqualMediaQuery = window.innerWidth <= 500;

    return isCurrentLayoutRowStyle && !isLessThanOrEqualMediaQuery? taskBarWidth : 0;
}


export const getYAxisInterference = (
    globalMenuRef: React.MutableRefObject<HTMLDivElement | null>
): number => {

    const globalMenuElement = globalMenuRef.current! as HTMLDivElement;
    const globalMenuHeight = globalMenuElement.getBoundingClientRect().height;

    return globalMenuHeight;
}