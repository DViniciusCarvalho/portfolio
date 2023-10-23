import React, { useState } from 'react';
import ApplicationWrapper from './common/ApplicationWrapper';
import TutorialWrapper from './common/TutorialWrapper';
import { StaticImageData } from 'next/image';

import SC1 from '../../../../public/assets/screenshots/goalcket-sc-1.png';
import SC2 from '../../../../public/assets/screenshots/goalcket-sc-2.png';
import SC3 from '../../../../public/assets/screenshots/goalcket-sc-3.png';
import SC4 from '../../../../public/assets/screenshots/goalcket-sc-4.png';
import SC5 from '../../../../public/assets/screenshots/goalcket-sc-5.png';
import SC6 from '../../../../public/assets/screenshots/goalcket-sc-6.png';
import SC7 from '../../../../public/assets/screenshots/goalcket-sc-7.png';
import SC8 from '../../../../public/assets/screenshots/goalcket-sc-8.png';
import SC9 from '../../../../public/assets/screenshots/goalcket-sc-9.png';

export default function Goalcket() {

    const [ applicationURL, setApplicationURL ] = useState('');
    const [ canDisplayWrapper, setCanDisplayWrapper ] = useState(false);

    const REPOSITORY_URL = 'https://github.com/DViniciusCarvalho/goalcket';
    const APP_NAME = 'Goalcket';

    const GOALCKET_SCREENSHOTS: StaticImageData[] = [
        SC1,
        SC2,
        SC3,
        SC4,
        SC5,
        SC6,
        SC7,
        SC8,
        SC9
    ];
    
    const GOALCKET_DESCRIPTION = 'Goalcket is a kanban, that allows you to manage your enterprise goals, you can also manage your team.';
    
    

    return (
        <>
            {canDisplayWrapper
             ? <ApplicationWrapper url={applicationURL}/> 
             : <TutorialWrapper 
                    name={APP_NAME}
                    description={GOALCKET_DESCRIPTION}
                    screenshots={GOALCKET_SCREENSHOTS}
                    repoUrl={REPOSITORY_URL}
                    setURL={setApplicationURL} 
                    setCanDisplayAppWrapper={setCanDisplayWrapper}
               />
            }
        </>
    )
}