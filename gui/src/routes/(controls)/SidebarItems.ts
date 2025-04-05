import {
    IconClock,
    IconFiles,
    IconKey,
    IconLayoutDashboard,
    IconSettings,
    IconShieldLock,
    type Icon,
} from '@tabler/icons-svelte';

interface Item {
    name: string;
    href: string;
    icon: Icon;
}

interface ItemList {
    title?: string;
    items: Array<Item>;
}

export const items = [
    {
        items: [
            {
                name: 'Dashboard',
                href: '/dashboard',
                icon: IconLayoutDashboard,
            },
            {
                name: 'Pastes',
                href: '/dashboard/pastes',
                icon: IconFiles,
            },
        ],
    },
    {
        title: 'Access',
        items: [
            {
                name: 'Authentication',
                href: '/settings/auth',
                icon: IconShieldLock,
            },
            {
                name: 'Sessions',
                href: '/settings/sessions',
                icon: IconClock,
            },
            {
                name: 'Tokens',
                href: '/settings/tokens',
                icon: IconKey,
            },
        ],
    },
    {
        items: [
            {
                name: 'Settings',
                href: '/settings',
                icon: IconSettings,
            },
        ],
    },
] satisfies Array<ItemList>;
