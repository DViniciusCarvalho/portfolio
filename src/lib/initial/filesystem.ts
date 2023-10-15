import { getFileOrDirectoryBytesSize } from '../shell/commands/common/directoryAndFile';
import { Directory } from '../shell/commands/models/Directory';
import { File } from '../shell/commands/models/File';


const WEBPAGE_START_TIMESTAMP = Date.now();

const INITIAL_FILESYSTEM_TIMESTAMPS = {
    access: WEBPAGE_START_TIMESTAMP,
    modify: WEBPAGE_START_TIMESTAMP,
    change: WEBPAGE_START_TIMESTAMP,
    birth: WEBPAGE_START_TIMESTAMP
};


const createInitialDir = (
    name: string,
    isSymlink: boolean,
    hasHowManyLinks: number,
    isSymlinkTo: string,
    perm: string
): Directory => {

    const directory = new Directory(
        name,
        {
            size: 0
        },
        {
            directories: [],
            files: []
        },
        {
            has: hasHowManyLinks,
            is: isSymlink,
            to: isSymlinkTo
        },
        {
            owner: 'root',
            group: 'root',
            permissionOctal: perm
        },
        INITIAL_FILESYSTEM_TIMESTAMPS
    );

    directory.data.size = getFileOrDirectoryBytesSize(directory);

    return directory;
}


const createInitialFile = (
    name: string,
    content: string,
    isSymlink: boolean,
    hasHowManyLinks: number,
    isSymlinkTo: string,
    perm: string
): File => {
    const file = new File(
        name,
        {
            content: content,
            size: 0
        },
        {
            has: hasHowManyLinks,
            is: isSymlink,
            to: isSymlinkTo
        },
        {
            owner: 'root',
            group: 'root',
            permissionOctal: perm
        },
        INITIAL_FILESYSTEM_TIMESTAMPS
    );

    file.data.size = getFileOrDirectoryBytesSize(file);

    return file;
}


const binDirectory = createInitialDir('bin', true, 1, '/usr/bin', '0777');
const devDirectory = createInitialDir('dev', false, 1, '', '0755');
const etcDirectory = createInitialDir('etc', false, 1, '', '0755');
const homeDirectory = createInitialDir('home', false, 1, '', '0755');
const visitorDirectory = createInitialDir('visitor', false, 1, '', '0755');

const documentsDirectory = createInitialDir('Documents', false, 1, '', '0755');
const downloadsDirectory = createInitialDir('Downloads', false, 1, '', '0700');
const musicDirectory = createInitialDir('Music', false, 1, '', '0755');
const picturesDirectory = createInitialDir('Pictures', false, 1, '', '0755');
const videosDirectory = createInitialDir('Videos', false, 1, '', '0755');
const localDirectory = createInitialDir('.local', false, 1, '', '0700');

const localShareDirectory = createInitialDir('share', false, 1, '', '0700');
const trashDirectory = createInitialDir('Trash', false, 1, '', '0700');

const procDirectory = createInitialDir('proc', false, 1, '', '0555');
const rootDirectory = createInitialDir('root', false, 1, '', '0700');
const sbinDirectory = createInitialDir('sbin', true, 1, '/usr/sbin', '0777');
const tmpDirectory = createInitialDir('tmp', false, 1, '', '1777');
const usrDirectory = createInitialDir('usr', false, 1, '', '0755');
const varDirectory = createInitialDir('var', false, 1, '', '0755');

const passwdFile = createInitialFile('passwd', '', false, 1, '', '0644');
const groupFile = createInitialFile('group', '', false, 1, '', '0644');
const shadowFile = createInitialFile('shadow', '', false, 1, '', '0640');
const gshadowFile = createInitialFile('gshadow', '', false, 1, '', '0640');
const trashmapFile = createInitialFile('trashmap', '', false, 1, '', '0755');


etcDirectory.children.files.push(passwdFile);
etcDirectory.children.files.push(groupFile);
etcDirectory.children.files.push(shadowFile);
etcDirectory.children.files.push(gshadowFile);
localShareDirectory.children.files.push(trashmapFile);

localDirectory.children.directories.push(localShareDirectory);
localShareDirectory.children.directories.push(trashDirectory);


visitorDirectory.children.directories.push(
    documentsDirectory,
    downloadsDirectory,
    musicDirectory,
    picturesDirectory,
    videosDirectory,
    localDirectory
);

homeDirectory.children.directories.push(visitorDirectory);


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