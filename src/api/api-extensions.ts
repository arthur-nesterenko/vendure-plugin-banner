import { gql } from 'graphql-tag';

export const commonApiExtensions = gql`
    type Banner implements Node {
        id: ID!
        name: String!
        sections: [BannerSection!]
        createdAt: DateTime!
        updatedAt: DateTime!
        enabled: Boolean
    }

    type BannerSectionTranslation {
        id: ID!
        languageCode: LanguageCode!
        callToAction: String!
        title: String!
        description: String!
        createdAt: DateTime!
        updatedAt: DateTime!
    }

    type BannerSection {
        id: ID!
        translations: [BannerSectionTranslation!]
        languageCode: LanguageCode!
        callToAction: String!
        externalLink: String
        title: String!
        description: String!
        product: Product
        collection: Collection
        asset: Asset
        position: Int!
    }

    type BannerList implements PaginatedList {
        items: [Banner!]!
        totalItems: Int!
    }
`;

export const adminApiExtensions = gql`
    ${commonApiExtensions}

    input BannerListOptions

    input BannerSectionTranslationInput {
        id: ID
        languageCode: LanguageCode!
        callToAction: String!
        title: String!
        description: String!
    }

    input UpdateBannerInput {
        id: ID!
        enabled: Boolean
        name: String
        sections: [BannerSectionInput!]
    }

    input BannerSectionInput {
        id: ID
        productId: ID
        collectionId: ID
        assetId: ID
        externalLink: String
        translations: [BannerSectionTranslationInput!]
        position: Int
    }

    input CreateBannerInput {
        enabled: Boolean
        name: String
        sections: [BannerSectionInput!]
    }

    input DeleteBannerInput {
        id: ID!
    }

    input DeleteBannerSectionInput {
        id: ID!
    }

    extend type Query {
        banners(options: BannerListOptions): BannerList!
        banner(id: ID!): Banner
    }

    extend type Mutation {
        updateBanner(input: UpdateBannerInput!): Banner!
        createBanner(input: CreateBannerInput!): Banner!
        deleteBanner(input: DeleteBannerInput!): Boolean!
        deleteBannerSection(input: DeleteBannerSectionInput!): Boolean!
    }
`;

export const shopApiExtensions = gql`
    ${commonApiExtensions}

    extend type Query {
        banner(id: ID!): Banner
        bannerByName(name: String!): Banner
    }
`;
