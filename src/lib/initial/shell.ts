import { Shell } from '@/types/shell';


export const ROOT_PROMPT = '#';

export const NORMAL_USER_PROMPT = '$';

export const INITIAL_TERMINAL_FONT_SIZE_IN_PIXELS = 18;

export const INITIAL_TERMINAL_USER_HOST_COLOR = '#26a269';

export const INITIAL_TERMINAL_ROOT_HOST_COLOR = '#c01c28';

export const INITIAL_TERMINAL_CURRENT_DIRECTORY_COLOR = '#12488b';

export const INITIAL_TERMINAL_DEFAULT_COLOR = '#ffffff';

export const INITIAL_TERMINAL_BACKGROUND_COLOR = '#380c2a';

export const SHELL_HOSTNAME = 'douglasportfolio';

export const INITIAL_ENVIRONMENT_VARIABLES: Shell.EnvironmentVariables = {
    PATH: '/usr/sbin:/usr/bin:/sbin:/bin',
    SHELL: '/usr/bin/bash',
    PWD: '/home/visitor',
    USER: 'visitor',
    HOME: `/home/visitor`,
    LS_COLORS: 'rf=#ffffff:di=#12488b:*.txt=#aaaaaa:sl=#2aa1b3:sb=#52ffbd:exec=#26a269',
    '?': 0
};

export const INITIAL_UMASK = '022';