import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { LinkSelector } from './link-selector';

vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn().mockReturnValue({ data: undefined, isLoading: false }),
}));

function TestWrapper(props: Partial<React.ComponentProps<typeof LinkSelector>>) {
    const { control } = useForm({ defaultValues: { sections: [{}] } });
    return (
        <LinkSelector
            control={control}
            sectionPath="sections.0"
            productId={null}
            collectionId={null}
            externalLink={null}
            onLinkChange={vi.fn()}
            {...props}
        />
    );
}

describe('LinkSelector', () => {
    it('renders link type buttons (Collection, Product, External Link)', () => {
        render(<TestWrapper />);
        expect(screen.getByRole('button', { name: 'Collection' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Product' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'External Link' })).toBeInTheDocument();
    });

    it('initializes with product type active when productId is provided', () => {
        render(<TestWrapper productId="123" />);
        const productBtn = screen.getByRole('button', { name: 'Product' });
        expect(productBtn.className).toContain('bg-background');
        const collectionBtn = screen.getByRole('button', { name: 'Collection' });
        expect(collectionBtn.className).not.toContain('bg-background');
    });

    it('initializes with collection type active when collectionId is provided', () => {
        render(<TestWrapper collectionId="456" />);
        const collectionBtn = screen.getByRole('button', { name: 'Collection' });
        expect(collectionBtn.className).toContain('bg-background');
        const productBtn = screen.getByRole('button', { name: 'Product' });
        expect(productBtn.className).not.toContain('bg-background');
    });

    it('initializes with no active type when no link is set', () => {
        render(<TestWrapper />);
        const collectionBtn = screen.getByRole('button', { name: 'Collection' });
        const productBtn = screen.getByRole('button', { name: 'Product' });
        const externalBtn = screen.getByRole('button', { name: 'External Link' });
        expect(collectionBtn.className).not.toContain('bg-background');
        expect(productBtn.className).not.toContain('bg-background');
        expect(externalBtn.className).not.toContain('bg-background');
    });
});
