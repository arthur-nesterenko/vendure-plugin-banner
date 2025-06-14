import gql from 'graphql-tag';

export const getAssetListDocument = gql`
    query GetAssetList($options: AssetListOptions) {
        assets(options: $options) {
            items {
                id
                preview
            }
            totalItems
        }
    }
`;

export const getBannerByNameDocument = gql`
    query getBannerByName($name: String!) {
        bannerByName(name: $name) {
            id
            sections {
                position
                callToAction
                title
                description
                id
                externalLink
                asset {
                    preview
                }
                product {
                    slug
                }
                collection {
                    slug
                }
            }
        }
    }
`;
