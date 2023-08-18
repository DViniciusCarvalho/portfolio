import { Data } from "@/types/data";
import { BaseMetadata } from "./BaseMetadata";

export class Directory extends BaseMetadata {
    constructor(
        public name: string,
        public size: number, 
        public children: {
            directories: Data.SystemDirectory[],
            files: Data.SystemFile[]
        },
        links: Data.LinkMetadata,
        management: Data.ManagementMetadata,
        timestamp: Data.TimestampMetadata
    ) {
        super(links, management, timestamp);
    }
}