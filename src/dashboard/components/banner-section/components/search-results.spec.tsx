import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchResults } from './search-results';

describe('SearchResults', () => {
    it('shows loading state when isLoading is true', () => {
        render(<SearchResults isLoading items={[]} onSelect={vi.fn()} />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows empty state when items are empty and not loading', () => {
        render(<SearchResults isLoading={false} items={[]} onSelect={vi.fn()} />);
        expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('renders items and calls onSelect when an item is clicked', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        const items = [
            { id: '1', name: 'Product One', image: { id: '1', preview: 'https://example.com/1.jpg' } },
            { id: '2', name: 'Product Two' },
        ];
        render(<SearchResults isLoading={false} items={items} onSelect={onSelect} />);

        expect(screen.getByText('Product One')).toBeInTheDocument();
        expect(screen.getByText('Product Two')).toBeInTheDocument();

        await user.click(screen.getByText('Product One'));
        expect(onSelect).toHaveBeenCalledWith('1');

        await user.click(screen.getByText('Product Two'));
        expect(onSelect).toHaveBeenCalledWith('2');
    });

    it('renders item image when provided', () => {
        const items = [
            { id: '1', name: 'With Image', image: { id: '1', preview: 'https://example.com/a.jpg' } },
        ];
        const { container } = render(<SearchResults isLoading={false} items={items} onSelect={vi.fn()} />);
        const img = container.querySelector('img[src="https://example.com/a.jpg"]');
        expect(img).toBeInTheDocument();
    });
});
