import nconf from "nconf";
// import Web3 from 'web3'
nconf.argv()
   .env()
   .file({ file: './config.json' });
// import borrowingOperations from './src/bots/arthloans/borrowingOperations';
// import leverage from './src/bots/arthloans/leverage'
// import troveManager from './src/bots/arthloans/troveManage'
// import mahax from './src/bots/gov/mahax'
// import quickswap from './src/bots/quickswap'
// import curvePolygon from './src/events/exchange/curvePolygon'
import farming from './src/bots/arthloans/farming'

// borrowingOperations()
// leverage()
// troveManager()
// mahax()
// quickswap()
// curvePolygon()
farming()

