import gql from 'graphql-tag';
import { BANNER_FRAGMENT } from './../types/fragments.graphql';

export const GET_BANNERS = gql`
    query GetBanners($options: BannerListOptions) {
        banners(options: $options) {
            totalItems
            items {
                ...Banner
            }
        }
    }
    ${BANNER_FRAGMENT}
`;

export const DELETE_BANNER = gql`
    mutation DeleteBanner($input: DeleteBannerInput!) {
        deleteBanner(input: $input)
    }
`;
