import { ParseTreeNode } from "@/lib/shell/ParseTree";

export interface Token {
    type: string;
    value?: any;
}

export interface IParseTree {
    root: ParseTreeNode;
    insertRootRight: (node: ParseTreeNode) => void;
    insertRootLeft: (node: ParseTreeNode) => void;
}

export interface IParseTreeNode {
    rightNode: IParseTreeNode | null;
    leftNode: IParseTreeNode | null;
    insertRight: (node: ParseTreeNode) => void;
    insertLeft: (node: ParseTreeNode) => void;
}