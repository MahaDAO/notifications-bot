import nconf from "nconf";
nconf.argv()
   .env()
   .file({ file: './config.json' });

import {farming} from './src/bots/arthloans/farming'


farming()
