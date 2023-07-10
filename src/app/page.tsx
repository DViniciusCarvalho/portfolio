"use client";

import Main from "@/components/workarea/Main";
import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";


export default function Home() {

    const touchBackendOptions = {
        enableMouseEvents: true, // Habilita eventos de mouse para compatibilidade com desktop
        ignoreContextMenu: true, // Ignora o menu de contexto para evitar interferências no arrastar e soltar
        delayTouchStart: 0, // Atraso em milissegundos antes de iniciar o arrastar em dispositivos móveis
    };

    return (
        <DndProvider backend={TouchBackend} options={touchBackendOptions}>
            <Main/>
        </DndProvider>
    );
}
