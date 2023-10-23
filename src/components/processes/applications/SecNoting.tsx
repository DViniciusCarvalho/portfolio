import React, { useState } from 'react'
import ApplicationWrapper from './common/ApplicationWrapper'
import TutorialWrapper from './common/TutorialWrapper';
import { StaticImageData } from 'next/image';

import SC1 from '../../../../public/assets/screenshots/secnoting-sc-1.png';
import SC2 from '../../../../public/assets/screenshots/secnoting-sc-2.png';
import SC3 from '../../../../public/assets/screenshots/secnoting-sc-3.png';
import SC4 from '../../../../public/assets/screenshots/secnoting-sc-4.png';
import SC5 from '../../../../public/assets/screenshots/secnoting-sc-5.png';
import SC6 from '../../../../public/assets/screenshots/secnoting-sc-6.png';
import SC7 from '../../../../public/assets/screenshots/secnoting-sc-7.png';


export default function SecNoting() {

    const [ applicationURL, setApplicationURL ] = useState('');
    const [ canDisplayWrapper, setCanDisplayWrapper ] = useState(false);

    const REPOSITORY_URL = 'https://github.com/DViniciusCarvalho/secnoting';
    const APP_NAME = 'SecNoting';

    const SECNOTING_SCREENSHOTS: StaticImageData[] = [
        SC1,
        SC2,
        SC3,
        SC4,
        SC5,
        SC6,
        SC7
    ];

    const SECNOTING_DESCRIPTION = 'Secnoting is a note manager, that stores your notes and allows you to update, delete and create new notes.';
    
    

    return (
        <>
            {canDisplayWrapper
             ? <ApplicationWrapper url={applicationURL}/> 
             : <TutorialWrapper 
                    name={APP_NAME}
                    description={SECNOTING_DESCRIPTION}
                    screenshots={SECNOTING_SCREENSHOTS}
                    repoUrl={REPOSITORY_URL}
                    setURL={setApplicationURL} 
                    setCanDisplayAppWrapper={setCanDisplayWrapper}
               />
            }
        </>
    )
}