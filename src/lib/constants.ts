import { Data } from "@/types/data";
import { Shell } from "@/types/shell";
import { Directory } from "./shell/commands/models/Directory";
import { getFileOrDirectoryBytesSize } from "./shell/commands/common/directoryAndFile";


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
    PWD: INITIAL_CURRENT_DIRECTORY,
    USER: INITIAL_SHELL_USER,
    HOME: `/home/${INITIAL_SHELL_USER}`,
    LS_COLORS: 'rf=#ffffff:di=#12488b:*.txt=#aaaaaa:*.tome=#ffaacc:sl=#2aa1b3:sb=#52ffbd:exec=#26a269',
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

const binDirectory = new Directory(
    'bin',
    {
        size: 0
    },
    {
        directories: [],
        files: []
    },
    {
        has: 1,
        is: true,
        to: '/usr/bin'
    },
    {
        owner: 'root',
        group: 'root',
        permissionOctal: '0777'
    },
    INITIAL_FILESYSTEM_TIMESTAMPS
);

const devDirectory = new Directory(
    'dev',
    {
        size: 0
    },
    {
        directories: [],
        files: []
    },
    {
        has: 1,
        is: false
    },
    {
        owner: 'root',
        group: 'root',
        permissionOctal: '0755'
    },
    INITIAL_FILESYSTEM_TIMESTAMPS
);

const etcDirectory = new Directory(
    'etc',
    {
        size: 0
    },
    {
        directories: [],
        files: []
    },
    {
        has: 1,
        is: false
    },
    {
        owner: 'root',
        group: 'root',
        permissionOctal: '0755'
    },
    INITIAL_FILESYSTEM_TIMESTAMPS
);



const homeDirectory = new Directory(
    'home',
    {
        size: 0
    },
    {
        directories: [],
        files: []
    },
    {
        has: 1,
        is: false
    },
    {
        owner: 'root',
        group: 'root',
        permissionOctal: '0755'
    },
    INITIAL_FILESYSTEM_TIMESTAMPS

);

const visitorDirectory = new Directory(
    'visitor',
    {
        size: 0
    },
    {
        directories: [],
        files: []
    },
    {
        has: 1,
        is: false
    },
    {
        owner: 'root',
        group: 'root',
        permissionOctal: '0755'
    },
    INITIAL_FILESYSTEM_TIMESTAMPS
);

const procDirectory = new Directory(
    'proc',
    {
        size: 0
    },
    {
        directories: [],
        files: []
    },
    {
        has: 1,
        is: false
    },
    {
        owner: 'root',
        group: 'root',
        permissionOctal: '0555'
    },
    INITIAL_FILESYSTEM_TIMESTAMPS
);

const rootDirectory = new Directory(
    'root',
    {
        size: 0
    },
    {
        directories: [],
        files: []
    },
    {
        has: 1,
        is: false
    },
    {
        owner: 'root',
        group: 'root',
        permissionOctal: '0700'
    },
    INITIAL_FILESYSTEM_TIMESTAMPS
);

const sbinDirectory = new Directory(
    'sbin',
    {
        size: 0
    },
    {
        directories: [],
        files: []
    },
    {
        has: 1,
        is: true,
        to: '/usr/sbin'
    },
    {
        owner: 'root',
        group: 'root',
        permissionOctal: '0777'
    },
    INITIAL_FILESYSTEM_TIMESTAMPS
);

const tmpDirectory = new Directory(
    'tmp',
    {
        size: 0
    },
    {
        directories: [],
        files: []
    },
    {
        has: 1,
        is: false
    },
    {
        owner: 'root',
        group: 'root',
        permissionOctal: '1777'
    },
    INITIAL_FILESYSTEM_TIMESTAMPS
);

const usrDirectory = new Directory(
    'usr',
    {
        size: 0
    },
    {
        directories: [],
        files: []
    },
    {
        has: 1,
        is: false
    },
    {
        owner: 'root',
        group: 'root',
        permissionOctal: '0755'
    },
    INITIAL_FILESYSTEM_TIMESTAMPS
);

const varDirectory = new Directory(
    'var',
    {
        size: 0
    },
    {
        directories: [],
        files: []
    },
    {
        has: 1,
        is: false
    },
    {
        owner: 'root',
        group: 'root',
        permissionOctal: '0755'
    },
    INITIAL_FILESYSTEM_TIMESTAMPS
);

binDirectory.data.size = getFileOrDirectoryBytesSize(binDirectory);
devDirectory.data.size = getFileOrDirectoryBytesSize(devDirectory);
etcDirectory.data.size = getFileOrDirectoryBytesSize(etcDirectory);
homeDirectory.data.size = getFileOrDirectoryBytesSize(homeDirectory);

homeDirectory.children.directories.push(visitorDirectory);

visitorDirectory.data.size = getFileOrDirectoryBytesSize(visitorDirectory);
procDirectory.data.size = getFileOrDirectoryBytesSize(procDirectory);
rootDirectory.data.size = getFileOrDirectoryBytesSize(rootDirectory);
sbinDirectory.data.size = getFileOrDirectoryBytesSize(sbinDirectory);
tmpDirectory.data.size = getFileOrDirectoryBytesSize(tmpDirectory);
usrDirectory.data.size = getFileOrDirectoryBytesSize(usrDirectory);
varDirectory.data.size = getFileOrDirectoryBytesSize(varDirectory);


export const INITIAL_FILESYSTEM: Directory = new Directory(
    '/',
    {
        size: 0
    },
    {
        directories: [
            binDirectory,
            devDirectory,
            etcDirectory,
            homeDirectory,
            procDirectory,
            rootDirectory,
            sbinDirectory,
            tmpDirectory,
            usrDirectory,
            varDirectory
        ],
        files: []
    },
    {
        is: false,
        has: 1
    },
    {
        owner: 'root',
        group: 'root',
        permissionOctal: '0755'
    },
    INITIAL_FILESYSTEM_TIMESTAMPS
);

export const INITIAL_UMASK = '022';