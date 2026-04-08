import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BannerSectionsManager } from './banner-sections-manager';

function TestWrapper({ defaultSections = [] }: { defaultSections?: any[] }) {
    const form = useForm({ defaultValues: { sections: defaultSections } });
    // Newly added sections render expanded by default, which mounts LinkSelector
    // and its useQuery hook — so we need a QueryClient in the tree.
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return (
        <QueryClientProvider client={queryClient}>
            <FormProvider {...form}>
                <BannerSectionsManager form={form} languageCode="en" />
            </FormProvider>
        </QueryClientProvider>
    );
}

describe('BannerSectionsManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows empty state when there are no sections', () => {
        render(<TestWrapper defaultSections={[]} />);
        expect(screen.getByText(/No sections yet. Click "Add Section" to create one./)).toBeInTheDocument();
    });

    it('shows Add Section button', () => {
        render(<TestWrapper defaultSections={[]} />);
        expect(screen.getByRole('button', { name: /Add Section/ })).toBeInTheDocument();
    });

    it('adds a section when Add Section is clicked', async () => {
        const user = userEvent.setup();
        render(<TestWrapper defaultSections={[]} />);
        expect(screen.queryByText(/Untitled Section/)).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Add Section/ }));

        expect(screen.getByText(/Untitled Section/)).toBeInTheDocument();
    });

    it('renders existing sections', () => {
        render(
            <TestWrapper
                defaultSections={[
                    {
                        id: 's1',
                        position: 1,
                        assetId: null,
                        asset: null,
                        productId: null,
                        collectionId: null,
                        externalLink: null,
                        translations: [
                            { languageCode: 'en', title: 'First', description: '', callToAction: '' },
                        ],
                    },
                ]}
            />,
        );
        expect(screen.getByText('First')).toBeInTheDocument();
    });
});
