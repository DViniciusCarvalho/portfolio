import React from 'react';
import processWindowStyles from '@/styles/workarea/window/ProcessWindow.module.sass';
import Image from 'next/image';
import { Props } from '@/types/props';

export default function ProcessWindowMinimalContentVersion({ 
    processIcon, 
    processIconAlt,
    processName 
}: Props.ProcessWindowMinimalContentVersionProps) {
    
    return (
        <div className={processWindowStyles.minimized__process__data}>
            <div className={processWindowStyles.process__window__icon__wrapper}>
                <Image src={processIcon} alt={processIconAlt}/>
            </div> 
			<p className={processWindowStyles.process__window__title}>{processName}</p>
		</div>
    );
}
