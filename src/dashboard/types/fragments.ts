import { graphql } from '@/gql';

export const bannerSectionFragment = graphql(`
    fragment BannerSection on BannerSection {
        id
        asset {
            preview
            id
            name
            width
            height
            source
        }
        product {
            id
            name
            featuredAsset {
                preview
            }
        }
        collection {
            id
            name
            featuredAsset {
                preview
            }
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
`);

export const bannerFragment = graphql(
    `
        fragment Banner on Banner {
            id
            name
            updatedAt
            createdAt
            enabled
            sections {
                ...BannerSection
            }
        }
    `,
    [bannerSectionFragment],
);
