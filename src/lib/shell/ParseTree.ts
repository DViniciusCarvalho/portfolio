import { Shell } from "@/types/shell";
import { ParseTreeNode } from "./ParseTreeNode";


export class ParseTree implements Shell.IParseTree {    
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