import React, { useContext } from 'react';
import settingsStyles from '@/styles/processes/Settings.module.sass';
import { MainContext } from '@/components/workarea/Main';
import BackgroundSection from '@/components/processes/settings/sections/BackgroundSection';
import ThemeSection from '@/components/processes/settings/sections/ThemeSection';
import TerminalSection from '@/components/processes/settings/sections/terminal_section/TerminalSection';


export default function Settings() {

    const {  
        systemTheme
    } = useContext(MainContext);

    return (
        <div 
            className={`
                ${settingsStyles.container}
                ${settingsStyles[systemTheme]}
                `
            }
        >
            <BackgroundSection/>
            <ThemeSection/>
            <TerminalSection/>
        </div>
    );
}