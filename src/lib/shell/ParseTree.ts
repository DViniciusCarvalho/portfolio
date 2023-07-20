import { IParseTree } from "@/types/shell_interpreter";
import { ParseTreeNode } from "./ParseTreeNode";


export class ParseTree implements IParseTree {    
    public root: ParseTreeNode;

    constructor(root: ParseTreeNode) {
        this.root = root;
    }

    public insertRootRight(node: ParseTreeNode) {
        this.root.insertRight(node);
    }

    public insertRootLeft(node: ParseTreeNode) {
        this.root.insertLeft(node);
    }
}