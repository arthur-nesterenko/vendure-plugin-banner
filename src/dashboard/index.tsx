import { defineDashboardExtension } from '@vendure/dashboard';
import { bannerList } from './components/banner-list';
import { bannerDetail } from './components/banner-detail';

defineDashboardExtension({
    routes: [bannerList, bannerDetail],
});
