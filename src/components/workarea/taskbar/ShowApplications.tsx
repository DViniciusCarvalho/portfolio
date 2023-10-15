import React, { useContext } from 'react';
import Image from 'next/image';
import showApplicationsStyles from '@/styles/workarea/taskbar/ShowApplications.module.sass'; 
import { MainContext } from '../Main'; 
import ShowApplicationsIcon from '../../../../public/assets/view-app-grid-symbolic.svg';


export default function ShowApplications() {

    const { 
        systemLayout, 
        changeApplicationsAreBeingShowed, 
        applicationsAreBeingShowed 
    } = useContext(MainContext);
 
    return (
        <abbr 
			className={`
				${showApplicationsStyles.container} 
				${showApplicationsStyles[systemLayout]} 
				${showApplicationsStyles[
                    applicationsAreBeingShowed? 'app--showed' : 'app--not--showed'
                ]}
				`
			} 
			onClick={() => changeApplicationsAreBeingShowed(!applicationsAreBeingShowed)}
            title={'Show Applications' }
        >
            <Image 
                src={ShowApplicationsIcon} 
                alt={'App view icon: 3x3 grid of white squares.'} 
                className={showApplicationsStyles.icon}
            />
        </abbr>
    );
}
