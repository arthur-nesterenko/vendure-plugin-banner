import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BaseEntityResolver, DataService } from '@vendure/admin-ui/core';

import { GetBannerQuery, GetBannerQueryVariables, BannerFragment } from './../generated/ui';
import { GET_BANNER } from './banner-detail.graphql';

@Injectable()
export class BannerDetailResolver extends BaseEntityResolver<BannerFragment> {
    constructor(router: Router, dataService: DataService) {
        super(
            router as any,
            {
                __typename: 'Banner',
                id: '',
                name: '',
                createdAt: '',
                updatedAt: '',
                enabled: true,
                sections: [],
            },
            id => {
                return dataService
                    .query<GetBannerQuery, GetBannerQueryVariables>(GET_BANNER, {
                        id: id,
                    })
                    .mapStream(data => {
                        return data.banner;
                    });
            },
        );
    }
}
