import gql from 'graphql-tag';
import { BANNER_FRAGMENT } from './../types/fragments.graphql';

export const GET_BANNER = gql`
    query GetBanner($id: ID!) {
        banner(id: $id) {
            ...Banner
        }
    }
    ${BANNER_FRAGMENT}
`;

export const CREATE_BANNER = gql`
    mutation CreateBanner($input: CreateBannerInput!) {
        createBanner(input: $input) {
            ...Banner
        }
    }
    ${BANNER_FRAGMENT}
`;

export const UPDATE_BANNER = gql`
    mutation UpdateBanner($input: UpdateBannerInput!) {
        updateBanner(input: $input) {
            ...Banner
        }
    }
    ${BANNER_FRAGMENT}
`;

export const DELETE_BANNER_SECTION = gql`
    mutation DeleteBannerSection($input: DeleteBannerSectionInput!) {
        deleteBannerSection(input: $input)
    }
`;
