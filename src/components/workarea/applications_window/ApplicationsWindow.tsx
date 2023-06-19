import React, { useContext } from "react";
import applicationsWindowStyles from "@/styles/workarea/applications/ApplicationsWindow.module.sass";
import Image from "next/image";
import SearchIcon from "../../../../public/assets/system-search-symbolic.symbolic.png";
import { MainContext } from "../Main";

export default function ApplicationsWindow() {

    const { layoutStyleClass, applicationsAreBeingShowed } = useContext(MainContext);
    
    return (
        <div 
          className={`
            ${applicationsWindowStyles.container} 
            ${applicationsWindowStyles[layoutStyleClass]}
            ${applicationsWindowStyles[applicationsAreBeingShowed? "applications__showed" : ""]}
            `
          }
        >
            <div className={applicationsWindowStyles.search__wrapper}>
                <div className={applicationsWindowStyles.search__icon__wrapper}>
		  			<Image src={SearchIcon} alt="search icon" className={applicationsWindowStyles.icon}/>
                </div>
                <input 
				  type="text" 
				  className={applicationsWindowStyles.search__input} 
				  placeholder="Type to search"
				/>
            </div>
            <div className={applicationsWindowStyles.activities__wrapper}></div>
            <div className={applicationsWindowStyles.applications__wrapper}></div>
        </div>
    );
}
