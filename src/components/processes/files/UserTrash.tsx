import React, { useContext } from 'react';
import { MainContext } from '@/components/workarea/Main';
import { Props } from '@/types/props';
import FileManager from './FileManager';
import UserTrashIconImage from '../../../../public/assets/user-trash.png';


export const userTrashProcessData = {
    processIconStaticImage: UserTrashIconImage,
    processIconAlt: 'Trash icon: it\'s a light gray rectangle, with a dark gray rectangular hole on the top and a green recycle symbol on the middle',
    processName: 'Trash',
    processElement: <UserTrash/>
};


export default function UserTrash() {

    const {
        systemEnvironmentVariables
    } = useContext(MainContext);

    const fileManagerProps: Props.FileManagerProps = {
        initiator: 'Trash',
        initialPath: `${systemEnvironmentVariables['HOME']}/.local/share/Trash` 
    };

    return (
        <FileManager {...fileManagerProps}/>
    );
}
