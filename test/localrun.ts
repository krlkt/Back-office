import globalSetup from './support/globalsetup';
import globalTeardown from './support/globalteardown';
import { execSync } from 'child_process';
import { mockUserService } from './support/mocks/mockserver';

async function run(): Promise<void> {
  await globalSetup();
  await mockUserService();
  process.on('exit', globalTeardown);
  execSync('npm run dev', { stdio: 'inherit' });
}

run();
