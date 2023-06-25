import React from 'react';
import settingsStyles from '@/styles/processes/Settings.module.sass';

export default function Settings() {
    return (
        <div className={settingsStyles.container}>
            <div className={settingsStyles.options__category__wrapper}></div>
            <div className={settingsStyles.options__wrapper}></div>
        </div>
    );
}