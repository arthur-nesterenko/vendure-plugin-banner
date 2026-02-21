import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach, vi } from 'vitest';

afterEach(() => cleanup());

vi.mock('@lingui/react/macro', () => ({
    Trans: ({ children }: { children?: React.ReactNode }) => children,
    useLingui: () => ({ i18n: {}, t: (s: string) => s }),
}));

// Stub only what cannot run in Vitest (API, virtual modules). UI from @vendure/dashboard
// requires Vite-injected virtual modules, so we provide minimal test doubles instead of mocks.
vi.mock('@vendure/dashboard', () => ({
    api: { mutate: vi.fn().mockResolvedValue({}) },
    Button: ({ children, onClick, ...props }: any) =>
        React.createElement('button', { type: 'button', onClick, ...props }, children),
    Badge: ({ children, ...props }: any) => React.createElement('span', props, children),
    VendureImage: ({ asset, className }: any) =>
        asset?.preview
            ? React.createElement('img', {
                  src: asset.preview,
                  alt: '',
                  className,
                  'data-testid': 'vendure-image',
              })
            : null,
    FormFieldWrapper: ({ name, label, render }: any) =>
        React.createElement(
            'div',
            { 'data-testid': `field-${name}` },
            label,
            render?.({ field: { value: '', onChange: vi.fn(), onBlur: vi.fn(), ref: () => {} } }),
        ),
    Input: React.forwardRef((props: any, ref: any) => React.createElement('input', { ...props, ref })),
    Textarea: React.forwardRef((props: any, ref: any) => React.createElement('textarea', { ...props, ref })),
    Switch: ({ checked, onCheckedChange }: any) =>
        React.createElement(
            'button',
            { type: 'button', onClick: () => onCheckedChange?.(!checked) },
            checked ? 'on' : 'off',
        ),
    ListPage: () => null,
    DetailPageButton: () => null,
    PageActionBarRight: ({ children }: any) => React.createElement('div', null, children),
    AssetPickerDialog: () => null,
    cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@/gql', () => ({
    graphql: () => ({}),
}));

vi.mock('sonner', () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));
