import { Data } from "@/types/data";
import { Shell } from "@/types/shell";


export const TOUCHABLE_AREA_TO_START_RESIZING_IN_PIXELS = 5;

export const LIMIT_TO_CHANGE_INITIAL_PROCESS_WINDOW_DIMENSION_PERCENTAGE_IN_PIXELS = 800;

export const INITIAL_PROCESS_WINDOW_WIDTH_IN_PERCENTAGE = 80;

export const INITIAL_PROCESS_WINDOW_WIDTH_IN_PERCENTAGE_IF_WINDOW_LE_LIMIT = 90;

export const INITIAL_PROCESS_WINDOW_HEIGHT_IN_PERCENTAGE = 80;

// Process and process window
export const LAST_SYSTEM_ESSENTIAL_PID = 1; // systemd

export const INITIAL_PROCESS_WINDOW_HIGHEST_ZINDEX = 0;

// Settings
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

// Terminal
export const ROOT_PROMPT = '#';

export const NORMAL_USER_PROMPT = '$';

export const INITIAL_TERMINAL_FONT_SIZE_IN_PIXELS = 18;

export const INITIAL_TERMINAL_USER_HOST_COLOR = '#26a269';

export const INITIAL_TERMINAL_ROOT_HOST_COLOR = '#c01c28';

export const INITIAL_TERMINAL_CURRENT_DIRECTORY_COLOR = '#12488b';

export const INITIAL_TERMINAL_DEFAULT_COLOR = '#ffffff';

export const INITIAL_TERMINAL_BACKGROUND_COLOR = '#380c2a';

export const INITIAL_SHELL_USER = 'visitor';

export const SHELL_HOSTNAME = 'douglasportfolio';

export const INITIAL_CURRENT_DIRECTORY = '/home/visitor';

export const INITIAL_SHELL_ENVIRONMENT_VARIABLES: Shell.EnvironmentVariables = {
    PATH: '/usr/sbin:/usr/bin:/sbin:/bin',
    SHELL: '/usr/bin/bash',
    USERNAME: INITIAL_SHELL_USER,
    PWD: INITIAL_CURRENT_DIRECTORY,
    USER: INITIAL_SHELL_USER,
    HOME: `/home/${INITIAL_SHELL_USER}`,
    LS_COLORS: 'rf=#ffffff:di=#12488b',
    '?': 0
};

// Filesystem
const WEBPAGE_START_TIMESTAMP = Date.now();

const INITIAL_FILESYSTEM_TIMESTAMPS = {
    access: WEBPAGE_START_TIMESTAMP,
    modify: WEBPAGE_START_TIMESTAMP,
    change: WEBPAGE_START_TIMESTAMP,
    birth: WEBPAGE_START_TIMESTAMP
};

export const INITIAL_FILESYSTEM: Data.SystemDirectory = {
    name: '/',
    size: 0,
    children: {
        directories: [
            {
                name: 'bin',
                size: 0,
                children: {
                    directories: [],
                    files: []
                },
                timestamp: INITIAL_FILESYSTEM_TIMESTAMPS,
                links: {
                    has: 1,
                    is: true,
                    to: '/usr/bin'
                },
                management: {
                    owner: 'root',
                    group: 'root',
                    permissionOctal: '777'
                }
            },
            {
                name: 'dev',
                size: 0,
                children: {
                    directories: [],
                    files: []
                },
                timestamp: INITIAL_FILESYSTEM_TIMESTAMPS,
                links: {
                    has: 1,
                    is: false
                },
                management: {
                    owner: 'root',
                    group: 'root',
                    permissionOctal: '755'
                }
            },
            {
                name: 'etc',
                size: 0,
                children: {
                    directories: [],
                    files: []
                },
                timestamp: INITIAL_FILESYSTEM_TIMESTAMPS,
                links: {
                    has: 1,
                    is: false
                },
                management: {
                    owner: 'root',
                    group: 'root',
                    permissionOctal: '755'
                }
            },
            {
                name: 'home',
                size: 0,
                children: {
                    directories: [
                        {
                            name: 'visitor',
                            size: 0,
                            children: {
                                directories: [],
                                files: []
                            },
                            timestamp: INITIAL_FILESYSTEM_TIMESTAMPS,
                            links: {
                                has: 1,
                                is: false
                            },
                            management: {
                                owner: 'root',
                                group: 'root',
                                permissionOctal: '755'
                            }
                        }
                    ],
                    files: []
                },
                timestamp: INITIAL_FILESYSTEM_TIMESTAMPS,
                links: {
                    has: 1,
                    is: false
                },
                management: {
                    owner: 'root',
                    group: 'root',
                    permissionOctal: '755'
                }
            },
            {
                name: 'proc',
                size: 0,
                children: {
                    directories: [],
                    files: []
                },
                timestamp: INITIAL_FILESYSTEM_TIMESTAMPS,
                links: {
                    has: 1,
                    is: false
                },
                management: {
                    owner: 'root',
                    group: 'root',
                    permissionOctal: '555'
                }
            },
            {
                name: 'root',
                size: 0,
                children: {
                    directories: [],
                    files: []
                },
                timestamp: INITIAL_FILESYSTEM_TIMESTAMPS,
                links: {
                    has: 1,
                    is: false
                },
                management: {
                    owner: 'root',
                    group: 'root',
                    permissionOctal: '700'
                }
            },
            {
                name: 'sbin',
                size: 0,
                children: {
                    directories: [],
                    files: []
                },
                timestamp: INITIAL_FILESYSTEM_TIMESTAMPS,
                links: {
                    has: 1,
                    is: true,
                    to: '/usr/sbin'
                },
                management: {
                    owner: 'root',
                    group: 'root',
                    permissionOctal: '777'
                }
            },
            {
                name: 'tmp',
                size: 0,
                children: {
                    directories: [],
                    files: []
                },
                timestamp: INITIAL_FILESYSTEM_TIMESTAMPS,
                links: {
                    has: 1,
                    is: false
                },
                management: {
                    owner: 'root',
                    group: 'root',
                    permissionOctal: '755'
                }
            },
            {
                name: 'usr',
                size: 0,
                children: {
                    directories: [],
                    files: []
                },
                timestamp: INITIAL_FILESYSTEM_TIMESTAMPS,
                links: {
                    has: 1,
                    is: false
                },
                management: {
                    owner: 'root',
                    group: 'root',
                    permissionOctal: '755'
                }
            },
            {
                name: 'var',
                size: 0,
                children: {
                    directories: [],
                    files: []
                },
                timestamp: INITIAL_FILESYSTEM_TIMESTAMPS,
                links: {
                    has: 1,
                    is: false
                },
                management: {
                    owner: 'root',
                    group: 'root',
                    permissionOctal: '755'
                }
            }
        ],
        files: []
    },
    timestamp: INITIAL_FILESYSTEM_TIMESTAMPS,
    links: {
        is: false,
        has: 1
    },
    management: {
        owner: 'root',
        group: 'root',
        permissionOctal: '777'
    }
 
};

export const INITIAL_UMASK = '022';