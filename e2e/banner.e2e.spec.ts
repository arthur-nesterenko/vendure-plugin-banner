import {
    SqljsInitializer,
    registerInitializer,
    testConfig,
    TestServer,
    SimpleGraphQLClient,
    createTestEnvironment,
} from '@vendure/testing';
import { LanguageCode, mergeConfig } from '@vendure/core';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { headlessConfig } from '../dev-server/vendure-config';
import { initialData } from './fixtures/initial-data';
import {
    CREATE_BANNER,
    UPDATE_BANNER,
    GET_BANNER,
    DELETE_BANNER_SECTION,
} from '../src/ui/banner-detail/banner-detail.graphql';
import { DELETE_BANNER } from '../src/ui/banner-list/banner-list.graphql';
import {
    CreateBannerMutation,
    CreateBannerInput,
    DeleteBannerMutation,
    UpdateBannerMutation,
    DeleteBannerSectionMutation,
    BannerSectionFragment,
    BannerSectionInput,
} from '../src/ui/generated-types';
import { getAssetListDocument, getBannerByNameDocument } from './graphql';

const sqliteDataDir = path.join(__dirname, '__data__');

let server: TestServer;
let adminClient: SimpleGraphQLClient;
let shopClient: SimpleGraphQLClient;
let serverStarted = false;

const getAssets = async () => {
    const result = await adminClient.query(getAssetListDocument);
    return result.assets.items;
};

const generateBannerSections = (assetId: string, count = 1) => {
    return Array.from({ length: count }, (_, i) => ({
        externalLink: 'https://section1.com',
        position: i + 1,
        assetId: assetId,
        translations: [
            {
                languageCode: LanguageCode.en,
                title: `Section ${i + 1} EN`,
                description: `Desc ${i + 1} EN`,
                callToAction: `CTA ${i + 1} EN`,
            },
            {
                languageCode: LanguageCode.uk,
                title: `Section ${i + 1} UK`,
                description: `Desc ${i + 1} UK`,
                callToAction: `CTA ${i + 1} UK`,
            },
        ],
    }));
};

const convertToBannerSectionInput = (
    sections: BannerSectionFragment[],
    extraSections: BannerSectionInput[] = [],
): BannerSectionInput[] => {
    return sections
        .map<BannerSectionInput>(({ asset, product, collection, ...section }) => ({
            ...section,
            productId: product?.id ?? undefined,
            collectionId: collection?.id ?? undefined,
            assetId: asset?.id ?? undefined,
            translations: section.translations,
        }))
        .concat(extraSections);
};

const createBanner = async ({
    name = 'Test Banner',
    input,
}: {
    name?: string;
    input?: CreateBannerInput;
} = {}) => {
    const [asset] = await getAssets();

    const payload = {
        name,
        enabled: true,
        sections: generateBannerSections(asset.id),
    };
    const result = await adminClient.query<CreateBannerMutation>(CREATE_BANNER, {
        input: input ?? payload,
    });

    return result.createBanner;
};

beforeAll(async () => {
    registerInitializer('sqljs', new SqljsInitializer(sqliteDataDir));
    const config = mergeConfig(testConfig, {
        ...headlessConfig,
        assetOptions: {
            permittedFileTypes: ['image/*', '.pdf', '.zip'],
        },
        importExportOptions: {
            importAssetsDir: path.join(__dirname, 'fixtures/assets'),
        },
    });
    ({ server, adminClient, shopClient } = createTestEnvironment(config));

    await server.init({
        initialData,
        productsCsvPath: path.join(__dirname, 'fixtures/product-import.csv'),
        customerCount: 1,
        logging: true,
    });
    serverStarted = true;
    await adminClient.asSuperAdmin();
}, 30000);

afterAll(async () => {
    await server.destroy();
});

/**
 *  Test the banner plugin
 */

it('should start successfully', async () => {
    await expect(serverStarted).toBe(true);
});

describe('Banner Admin API', () => {
    it('should create a banner', async () => {
        const result = await createBanner();
        expect(result.id).toBeDefined();
        expect(result.name).toBe('Test Banner');
        expect(Array.isArray(result.sections)).toBe(true);
        expect(result.sections?.length).toBe(1);
    });

    it('should be able to delete a banner', async () => {
        const result = await createBanner({
            name: 'Test Banner to Delete',
        });
        expect(result.id).toBeDefined();
        expect(result.name).toBe('Test Banner to Delete');
        expect(result.sections?.length).toBe(1);
        const deleteResult = await adminClient.query<DeleteBannerMutation>(DELETE_BANNER, {
            input: {
                id: result.id,
            },
        });
        expect(deleteResult.deleteBanner).toBe(true);
    });

    it('should be able to update a banner name and enabled', async () => {
        const result = await createBanner({
            name: 'Test Banner to Update',
        });

        expect(result.name).toBe('Test Banner to Update');
        expect(result.enabled).toBe(true);
        const updateResult = await adminClient.query<UpdateBannerMutation>(UPDATE_BANNER, {
            input: {
                id: result.id,
                name: 'Updated Test Banner',
                enabled: false,
            },
        });
        expect(updateResult.updateBanner.name).toBe('Updated Test Banner');
        expect(updateResult.updateBanner.enabled).toBe(false);
    });

    it('should fetch a banner by ID', async () => {
        const result = await createBanner({
            name: 'Fetch Test Banner',
        });
        const fetchResult = await adminClient.query(GET_BANNER, {
            id: result.id,
        });
        expect(fetchResult.banner).toEqual(result);
    });

    it('should return a banner even if it is not enabled', async () => {
        const result = await createBanner({
            input: {
                name: 'disabled_banner',
                enabled: false,
            },
        });
        const fetchResult = await adminClient.query(GET_BANNER, {
            id: result.id,
        });
        expect(fetchResult.banner).toEqual(result);
    });

    describe('Banner sections', () => {
        it('should create a banner with multiple sections', async () => {
            const [asset] = await getAssets();
            const input: CreateBannerInput = {
                name: 'Multi-section Banner',
                enabled: true,
                sections: [
                    {
                        externalLink: 'https://section1.com',
                        position: 1,
                        assetId: asset.id,
                        translations: [
                            {
                                languageCode: LanguageCode.en,
                                title: 'Section 1 EN',
                                description: 'Desc 1 EN',
                                callToAction: 'CTA 1 EN',
                            },
                            {
                                languageCode: LanguageCode.uk,
                                title: 'Section 1 UK',
                                description: 'Desc 1 UK',
                                callToAction: 'CTA 1 UK',
                            },
                        ],
                    },
                    {
                        externalLink: 'https://section2.com',
                        position: 2,
                        assetId: asset.id,
                        translations: [
                            {
                                languageCode: LanguageCode.en,
                                title: 'Section 2 EN',
                                description: 'Desc 2 EN',
                                callToAction: 'CTA 2 EN',
                            },
                        ],
                    },
                ],
            };
            const result = await createBanner({ input });
            expect(result.sections).toHaveLength(2);
            expect(result.sections?.[0]?.translations).toHaveLength(2);
            expect(result.sections?.[1]?.translations).toHaveLength(1);
            expect(result.sections?.[0]?.translations?.[0]?.languageCode).toBe(LanguageCode.en);
            expect(result.sections?.[0]?.translations?.[1]?.languageCode).toBe(LanguageCode.uk);
            expect(result.sections?.[1]?.translations?.[0]?.languageCode).toBe(LanguageCode.en);
        });

        it('should add a new section', async () => {
            const result = await createBanner({
                name: 'Add Section Banner',
            });
            const newSection = {
                externalLink: 'https://new-section.com',
                position: 2,
                assetId: result.sections?.[0]?.asset?.id ?? '',
                translations: [
                    {
                        languageCode: LanguageCode.en,
                        title: 'New Section',
                        description: 'New Desc',
                        callToAction: 'New CTA',
                    },
                ],
            };

            const newSections = convertToBannerSectionInput(result.sections ?? [], [newSection]);
            const updateResult = await adminClient.query<UpdateBannerMutation>(UPDATE_BANNER, {
                input: {
                    id: result.id,
                    sections: newSections,
                },
            });
            expect(result.sections).toHaveLength(1);
            expect(updateResult.updateBanner.sections).toHaveLength(2);
            expect(updateResult.updateBanner.sections?.[1]?.externalLink).toBe('https://new-section.com');
        });

        it('should update a section', async () => {
            const [asset] = await getAssets();
            const sections = generateBannerSections(asset.id, 3);
            const result = await createBanner({
                input: {
                    name: 'Update Section Banner',
                    sections: sections,
                },
            });

            const [firstSection, ...restSections] = result.sections ?? [];
            const updatedSections = convertToBannerSectionInput(restSections, [
                {
                    id: firstSection.id,
                    externalLink: 'https://updated-link.com',
                    position: 0,
                    assetId: firstSection.asset?.id ?? '',
                    translations: [
                        {
                            languageCode: LanguageCode.en,
                            title: 'Updated Title',
                            description: 'Updated Description',
                            callToAction: 'Updated Call to Action',
                        },
                    ],
                },
            ]);

            const updateResult = await adminClient.query<UpdateBannerMutation>(UPDATE_BANNER, {
                input: {
                    id: result.id,
                    sections: updatedSections,
                },
            });

            expect(updateResult.updateBanner.sections).toHaveLength(sections.length);
            expect(updateResult.updateBanner.sections?.[0]?.externalLink).toBe('https://updated-link.com');
            expect(updateResult.updateBanner.sections?.[0]?.translations?.[0]?.title).toBe('Updated Title');
        });

        it('should remove a section', async () => {
            // Create with two sections
            const [asset] = await getAssets();
            const sections = generateBannerSections(asset.id, 2);
            const result = await createBanner({
                input: {
                    name: 'Remove Section Banner',
                    enabled: true,
                    sections: sections,
                },
            });
            expect(result.sections).toHaveLength(2);
            // Remove the first section
            const deleteResult = await adminClient.query<DeleteBannerSectionMutation>(DELETE_BANNER_SECTION, {
                input: {
                    id: result.sections?.[0]?.id ?? '',
                },
            });
            expect(deleteResult.deleteBannerSection).toBe(true);
            const fetchResult = await adminClient.query(GET_BANNER, {
                id: result.id,
            });
            expect(fetchResult.banner?.sections).toHaveLength(1);
            expect(fetchResult.banner?.sections?.[0]?.id).not.toBe(result.sections?.[0]?.id);
        });
    });
});

describe('Banner Shop API', () => {
    const name = 'banner_home';
    it('should return a banner by name', async () => {
        const result = await createBanner({
            name,
        });

        const fetchResult = await shopClient.query(getBannerByNameDocument, {
            name,
        });

        expect(fetchResult.bannerByName.id).toBe(result.id);
    });

    it('should return a banner by id', async () => {
        const name = 'banner_id';
        const result = await createBanner({
            name: name,
        });
        const fetchResult = await shopClient.query(GET_BANNER, {
            id: result.id,
        });
        expect(fetchResult.banner.id).toBe(result.id);
    });

    it('should throw and error if the banner is not found', async () => {
        const name = 'banner_not_found';
        try {
            await shopClient.query(getBannerByNameDocument, {
                name,
            });
        } catch (error) {
            expect(error).toBeDefined();
        }

        try {
            await shopClient.query(GET_BANNER, {
                id: '123',
            });
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    it('should return an error if the banner is not enabled', async () => {
        const name = 'banner_not_enabled';
        const result = await createBanner({
            input: {
                name,
                enabled: false,
            },
        });
        try {
            await shopClient.query(getBannerByNameDocument, {
                name,
            });
        } catch (error) {
            expect(error).toBeDefined();
        }

        try {
            await shopClient.query(GET_BANNER, {
                id: result.id,
            });
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});
