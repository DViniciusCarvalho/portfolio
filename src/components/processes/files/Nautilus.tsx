import React from 'react';
import { Props } from '@/types/props';
import FileManager from './FileManager';
import NautilusIconImage from '../../../../public/assets/nautilus.png';


export const nautilusProcessData = {
    processIconStaticImage: NautilusIconImage,
    processIconAlt: 'Nautilus icon: it\'s a gray folder with orange accents and a white horizontal line.',
    processName: 'Files',
    processElement: <Nautilus/>
};


export default function Nautilus() {
    const fileManagerProps: Props.FileManagerProps = {
        initiator: 'Nautilus'
    };

    return (
        <FileManager {...fileManagerProps}/>
    );
}