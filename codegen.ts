/* eslint-disable */

import { generateTypes } from './scripts/generate-types';
import path from 'path';
import { BannerPlugin } from './src';

require('dotenv').config({ path: path.join(__dirname, '../dev-server/.env') });

generateTypes(
    {
        plugins: [BannerPlugin],
    },
    {
        pluginDir: __dirname,
        common: true,
        ui: true,
    },
).then(() => process.exit(0));
