import nconf from "nconf";
// import Web3 from 'web3'
nconf.argv()
   .env()
   .file({ file: './config.json' });
import borrowingOperations from './src/bots/arthloans/borrowingOperations';
import leverage from './src/bots/arthloans/leverage'
import farming from './src/bots/arthloans/farming'
import mahax from './src/bots/gov/mahax'
import quickswap from './src/bots/quickswap'
import curvePolygon from './src/events/exchange/curvePolygon'
import troveManager from './src/bots/arthloans/troveManage'

// At a time 13 connections can be open

borrowingOperations() // 11 instances
leverage() // 2 instances

farming() // 10 instances
mahax() // 1 instance
quickswap() // 1 instance
curvePolygon() // 1 instance

troveManager() // 8 instances
