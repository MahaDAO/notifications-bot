import nconf from "nconf";
// import Web3 from 'web3'
nconf.argv()
   .env()
   .file({ file: './config.json' });

import {farming} from './src/bots/arthloans/farming'
// import curvePolygon from './src/events/exchange/curvePolygon'

farming()

// curvePolygon()
