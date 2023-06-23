import React, { useContext } from 'react';
import showApplicationsStyles from '@/styles/workarea/taskbar/ShowApplications.module.sass'; 
import Image from 'next/image';
import ShowApplicationsIcon from '../../../../public/assets/view-app-grid-symbolic.svg';
import { MainContext } from '../Main'; 

export default function ShowApplications() {

    const { 
        layoutStyleClass, 
        showAllApplicationsAndOpennedWindows, 
        applicationsAreBeingShowed 
    } = useContext(MainContext);
 
    return (
        <abbr 
			className={`
				${showApplicationsStyles.container} 
				${showApplicationsStyles[layoutStyleClass]} 
				${showApplicationsStyles[applicationsAreBeingShowed? 'applications__showed' : '']}
				`
			} 
			title='Show Applications' 
			onClick={showAllApplicationsAndOpennedWindows}
        >
            <Image 
                src={ShowApplicationsIcon} 
                alt='view apps grid icon' 
                className={showApplicationsStyles.icon}
            />
        </abbr>
    );
}
