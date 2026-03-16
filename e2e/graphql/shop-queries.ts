import gql from 'graphql-tag';
import { BANNER_FRAGMENT } from './fragments';

export const GET_BANNER_BY_NAME = gql`
    query GetBannerByName($name: String!) {
        bannerByName(name: $name) {
            ...Banner
        }
    }
    ${BANNER_FRAGMENT}
`;

export const GET_BANNER_SHOP = gql`
    query GetBannerShop($id: ID!) {
        banner(id: $id) {
            ...Banner
        }
    }
    ${BANNER_FRAGMENT}
`;
