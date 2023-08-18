import { Data } from "@/types/data";

export class BaseMetadata implements Data.FileAndDirectoryMetadata {
    constructor(
        public links: Data.LinkMetadata, 
        public management: Data.ManagementMetadata, 
        public timestamp: Data.TimestampMetadata
    ) {}
}