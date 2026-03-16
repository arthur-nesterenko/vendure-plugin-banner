import { gql } from 'graphql-tag';

export const BANNER_SECTION_FRAGMENT = gql`
    fragment BannerSection on BannerSection {
        id
        asset {
            id
            preview
            name
        }
        product {
            id
            name
        }
        collection {
            id
            name
        }
        externalLink
        translations {
            id
            languageCode
            callToAction
            title
            description
        }
        position
    }
`;

export const BANNER_FRAGMENT = gql`
    fragment Banner on Banner {
        id
        name
        createdAt
        updatedAt
        enabled
        sections {
            ...BannerSection
        }
    }
    ${BANNER_SECTION_FRAGMENT}
`;
