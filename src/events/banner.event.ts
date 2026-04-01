import { ID, RequestContext, VendureEvent } from '@vendure/core';

type BannerEventType = 'created' | 'updated' | 'deleted';

export class BannerEvent extends VendureEvent {
    constructor(
        public ctx: RequestContext,
        public bannerId: ID,
        public type: BannerEventType,
    ) {
        super();
    }
}
