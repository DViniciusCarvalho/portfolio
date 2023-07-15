import { Data } from "@/types/data";

export const TOUCHABLE_AREA_TO_START_RESIZING_IN_PIXELS = 5;

export const LIMIT_TO_CHANGE_INITIAL_PROCESS_WINDOW_DIMENSION_PERCENTAGE_IN_PIXELS = 800;

export const INITIAL_PROCESS_WINDOW_WIDTH_IN_PERCENTAGE = 80;

export const INITIAL_PROCESS_WINDOW_WIDTH_IN_PERCENTAGE_IF_WINDOW_LE_LIMIT = 90;

export const INITIAL_PROCESS_WINDOW_HEIGHT_IN_PERCENTAGE = 80;

export const LAST_SYSTEM_ESSENTIAL_PID = 1; // systemd

export const INITIAL_PROCESS_WINDOW_HIGHEST_ZINDEX = 0;

export const INITIAL_SYSTEM_LAYOUT = 'row';

export const INITIAL_SYSTEM_COLOR_PALETTE = 'orange';

export const INITIAL_SYSTEM_THEME = 'dark';

export const COLOR_PALETTE_OPTIONS: Data.ColorPaletteOptions = {
    red: {
        settingsColor: '#d33a3a',
        lightenedColor: '#f08686',
        opennedIndicatorColor: '#d33a3a',
        desktop: {
            backgroundImage: 'linear-gradient(to top left, #d33a3a, #521515)'
        },
        taskbar: {
            backgroundImage: 'linear-gradient(to bottom left, #471414 60%, #4b1919)',
            borderColor: '#331414ab'
        }
    },
    orange: {
        settingsColor: '#ff7755',
        lightenedColor: '#faa893',
        opennedIndicatorColor: '#e74b03',
        desktop: {
            backgroundImage: 'linear-gradient(to top left, #ff7755, #58233e)'
        },
        taskbar: {
            backgroundImage: 'linear-gradient(to bottom left, #3b1424 60%, #2b151c)',
            borderColor: '#350d1f94'
        }
    },
    yellow: {
        settingsColor: '#fdbf4c',
        lightenedColor: '#faeacd',
        opennedIndicatorColor: '#fdbf4c',
        desktop: {
            backgroundImage: 'linear-gradient(to top left, #fdbf4c, #ff9c3f)'
        },
        taskbar: {
            backgroundImage: 'linear-gradient(to bottom left, #943d03 60%, #ad4a07)',
            borderColor: '#7c3b05ea'
        }
    },
    green: {
        settingsColor: '#63f89c',
        lightenedColor: '#cffce0',
        opennedIndicatorColor: '#63f89c',
        desktop: {
            backgroundImage: 'linear-gradient(to top left, #63f89c, #2d4220)'
        },
        taskbar: {
            backgroundImage: 'linear-gradient(to bottom left, #132e1e 60%, #132b1c)',
            borderColor: '#102217be'
        }
    },
    blue: {
        settingsColor: '#395e88',
        lightenedColor: '#729ccc',
        opennedIndicatorColor: '#88c0ff',
        desktop: {
            backgroundImage: 'linear-gradient(to top left, #88c0ff, #395e88)'
        },
        taskbar: {
            backgroundImage: 'linear-gradient(to bottom left, #22334b 60%, #293f5f)',
            borderColor: '#22334b'
        }
    },
    purple: {
        settingsColor: '#6a25a3',
        lightenedColor: '#ad74db',
        opennedIndicatorColor: '#c988ff',
        desktop: {
            backgroundImage: 'linear-gradient(to top left, #c988ff, #6a25a3)'
        },
        taskbar: {
            backgroundImage: 'linear-gradient(to bottom left, #3c224b 60%, #4a2c5c)',
            borderColor: '#3b1f42'
        }
    },
    pink: {
        settingsColor: '#ffbcdb',
        lightenedColor: '#ffe6f1',
        opennedIndicatorColor: '#ffe7f2',
        desktop: {
            backgroundImage: 'linear-gradient(to top left, #ffbcdb, #ff9dcb)'
        },
        taskbar: {
            backgroundImage: 'linear-gradient(to bottom left, #ff84b7 60%, #f37eaf)',
            borderColor: '#f869a5'
        }
    },
};

export const INITIAL_SHELL_ENVIRONMENT_VARIABLES = {
    PATH: '/usr/sbin:/usr/bin:/sbin:/bin',
    SHELL: '/usr/bin/bash',
    USERNAME: 'douglas',
    PWD: '/home/douglas',
    USER: '',
    '?': 0,
    HOME: '/home/douglas'
};