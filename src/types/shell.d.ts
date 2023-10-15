import { Data } from './data';
import { ParseTreeNode } from '@/lib/shell/ParseTree';
import { Directory } from '@/lib/shell/commands/models/Directory';


export namespace Shell {
    interface Token {
        [key: string]: string;
        type: string;
        value: any;
    }
    
    interface ParseTreeToken {
        commandContext: string;
        type: string;
        value?: any;
    }
    
    interface IParseTree {
        root: ParseTreeNode;
        insertRootRight: (node: ParseTreeNode) => void;
        insertRootLeft: (node: ParseTreeNode) => void;
    }
    
    interface IParseTreeNode {
        rightNode: IParseTreeNode | null;
        leftNode: IParseTreeNode | null;
        insertRight: (node: ParseTreeNode) => void;
        insertLeft: (node: ParseTreeNode) => void;
    }
    
    interface ExitFlux {
        stdout: string | null;
        stderr: string | null;
        exitStatus: number;
    }

    interface PromptVariableData {
        currentUser: string;
        currentDirectory: string;
    }

    interface EnvironmentVariables {
        [key: string]: any;
    }

    interface SystemAPI {
        clearTerminal: () => void;
        environmentVariables: EnvironmentVariables;
        setEnvironmentVariables: React.Dispatch<React.SetStateAction<EnvironmentVariables>>;
        setSystemEnvironmentVariables: React.Dispatch<React.SetStateAction<EnvironmentVariables>>;
        opennedProcessesData: Data.OpennedProcessData[];
        setOpennedProcessesData: React.Dispatch<React.SetStateAction<Data.OpennedProcessData[]>>;
        startNonGraphicalProcess: (processTitle: string) => number;
        finishNonGraphicalProcess: (PID: number) => void;
        finishGraphicalProcess: (PID: number) => void;
        fileSystem: Directory;
        setFileSystem: React.Dispatch<React.SetStateAction<Directory>>;
        umask: string;
        setUmask: React.Dispatch<React.SetStateAction<string>>;
    }

    interface CommandOption {
        short: string | null;
        long: string | null | RegExp;
        description: string;
    }

    interface Signal {
        number: number;
        name: string;
        handler: any;
    }

}