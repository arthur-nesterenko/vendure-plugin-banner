import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CoverImage } from './cover-image';

describe('CoverImage', () => {
    it('renders empty state with select button when no asset is selected', () => {
        render(<CoverImage selectedAsset={null} onAssetSelected={vi.fn()} onAssetRemoved={vi.fn()} />);
        expect(screen.getByText('Select cover image')).toBeInTheDocument();
    });

    it('renders asset preview when asset is selected', () => {
        const asset = { id: '1', preview: 'https://example.com/image.jpg', name: 'hero.jpg' };
        render(
            <CoverImage selectedAsset={asset as any} onAssetSelected={vi.fn()} onAssetRemoved={vi.fn()} />,
        );
        expect(screen.getByTestId('vendure-image')).toBeInTheDocument();
        expect(screen.getByText('hero.jpg')).toBeInTheDocument();
    });

    it('calls onAssetRemoved when remove button is clicked', async () => {
        const user = userEvent.setup();
        const onAssetRemoved = vi.fn();
        const asset = { id: '1', preview: 'https://example.com/image.jpg', name: 'hero.jpg' };
        render(
            <CoverImage
                selectedAsset={asset as any}
                onAssetSelected={vi.fn()}
                onAssetRemoved={onAssetRemoved}
            />,
        );
        // The remove button contains only an XIcon — find via its sibling Change button
        const buttons = screen.getAllByRole('button');
        // The remove button is the one that does NOT contain "Change" text
        const removeButton = buttons.find(btn => !btn.textContent?.includes('Change'));
        expect(removeButton).toBeDefined();
        await user.click(removeButton!);
        expect(onAssetRemoved).toHaveBeenCalled();
    });

    it('shows error state when error prop is provided', () => {
        render(
            <CoverImage
                selectedAsset={null}
                error={{ message: 'Cover image is required' }}
                onAssetSelected={vi.fn()}
                onAssetRemoved={vi.fn()}
            />,
        );
        expect(screen.getByText('Cover image is required')).toBeInTheDocument();
    });
});
