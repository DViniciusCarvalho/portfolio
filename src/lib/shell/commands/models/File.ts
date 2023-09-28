import { BaseMetadata } from './BaseMetadata';
import { Data } from '@/types/data';

export class File extends BaseMetadata {
    constructor(
        public name: string,
        public data: {
            content: string,
            size: number
        },
        links: Data.LinkMetadata,
        management: Data.ManagementMetadata,
        timestamp: Data.TimestampMetadata
    ) {
       super(links, management, timestamp);
    }
}