import { ParseTreeNode } from '@/lib/shell/ParseTree';
import { Data } from './data';

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

    interface EnvironmentVariables {
        [key: string]: any;
    }

    interface SystemAPI {
        clearTerminal: () => void;
        setEnvironmentVariables: React.Dispatch<React.SetStateAction<EnvironmentVariables>>;
        sendSIGKILLToProcess: (PID: number) => void;
        setOpennedProcessesData: React.Dispatch<React.SetStateAction<Data.OpennedProcessData[]>>;
        setCurrentShellUser: React.Dispatch<React.SetStateAction<string>>;
        setCurrentDirectory: React.Dispatch<React.SetStateAction<string>>;
        setFileSystem: React.Dispatch<React.SetStateAction<Data.FileSystem>>;
    }
}
