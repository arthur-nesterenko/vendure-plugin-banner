import { ID, RequestContext, VendureEvent } from '@vendure/core';

/**
 * @description
 * The kind of mutation that produced a {@link BannerEvent}.
 */
export type BannerEventType = 'created' | 'updated' | 'deleted';

/**
 * @description
 * Published on the Vendure `EventBus` whenever a banner is created,
 * updated, or deleted. Subscribe to this event to invalidate caches,
 * write audit logs, or trigger any other side effect that needs to
 * react to banner changes.
 *
 * @example
 * ```ts
 * import { EventBus } from '@vendure/core';
 * import { BannerEvent } from 'vendure-banner-plugin';
 *
 * eventBus.ofType(BannerEvent).subscribe(event => {
 *     console.log(`Banner ${event.bannerId} was ${event.type}`);
 * });
 * ```
 *
 * @category Events
 */
export class BannerEvent extends VendureEvent {
    constructor(
        public ctx: RequestContext,
        public bannerId: ID,
        public type: BannerEventType,
    ) {
        super();
    }
}
