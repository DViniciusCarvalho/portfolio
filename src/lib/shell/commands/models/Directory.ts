import { Data } from '@/types/data';
import { BaseMetadata } from './BaseMetadata';
import { File } from './File';


export class Directory extends BaseMetadata {
    constructor(
        public name: string,
        public data: {
            size: number
        }, 
        public children: {
            directories: Directory[],
            files: File[]
        },
        links: Data.LinkMetadata,
        management: Data.ManagementMetadata,
        timestamp: Data.TimestampMetadata
    ) {
        super(links, management, timestamp);
    }
}