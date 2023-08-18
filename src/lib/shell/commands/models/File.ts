import { BaseMetadata } from "./BaseMetadata";
import { Data } from "@/types/data";

export class File extends BaseMetadata {
    constructor(
        public name: string,
        public size: number,
        public content: string,
        links: Data.LinkMetadata,
        management: Data.ManagementMetadata,
        timestamp: Data.TimestampMetadata
    ) {
       super(links, management, timestamp);
    }
}