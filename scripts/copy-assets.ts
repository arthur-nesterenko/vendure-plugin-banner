import { copySync } from 'fs-extra';
import path from 'node:path';

const src = path.join(__dirname, '../src/dashboard');
const dest = path.join(__dirname, '../dist/dashboard');
copySync(src, dest);
