"use client";

import Main from "@/components/workarea/Main";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";


export default function Home() {
    return (
        <DndProvider backend={HTML5Backend}>
            <Main/>
        </DndProvider>
    );
}
