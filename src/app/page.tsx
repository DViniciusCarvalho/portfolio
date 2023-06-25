"use client";

import Main from "@/components/workarea/Main";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";


export default function Home() {

    const getOpacity = () => {
        return 1
    };

    const isTouchDevice = 'ontouchstart' in window;

    return (
        <DndProvider backend={isTouchDevice? TouchBackend : HTML5Backend}>
            <Main/>
        </DndProvider>
    );
}
