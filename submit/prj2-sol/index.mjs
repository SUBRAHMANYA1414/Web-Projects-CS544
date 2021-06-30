#!/usr/bin/env node

import cli from './src/cli.mjs';
import ChowDao from './src/chow-dao.mjs';

cli().catch(err => console.error(err));
 //make("mongodb://localhost:27017");
 
 const mm = new ChowDao().make("mongodb://localhost:27017");
 
 mm.newOrder("item1");
