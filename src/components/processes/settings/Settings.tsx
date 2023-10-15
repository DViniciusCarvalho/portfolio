import React, { useContext } from 'react';
import settingsStyles from '@/styles/processes/settings/Settings.module.sass';
import { MainContext } from '@/components/workarea/Main';
import BackgroundSection from '@/components/processes/settings/sections/BackgroundSection';
import ThemeSection from '@/components/processes/settings/sections/ThemeSection';
import TerminalSection from '@/components/processes/settings/sections/terminal_section/TerminalSection';
import SettingsIconImage from '../../../../public/assets/preferences-desktop.png';


export const settingsProcessData = {
    processIconStaticImage: SettingsIconImage,
    processIconAlt: 'Settings icon: it\'s a light gray circle with a dark gray circle and a light gray gear inside.',
    processName: 'Settings',
    processElement: <Settings/>
};

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