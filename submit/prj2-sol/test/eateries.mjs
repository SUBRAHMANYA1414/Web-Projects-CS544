import { setupDao, tearDownDao } from './util.mjs'
import params from '../src/params.mjs';

import fs from 'fs';

import chai from 'chai';
const { assert } = chai;

const COURSE_DIR = `${process.env.HOME}/cs544`;
//const DATA_PATH = "/Users/subrahmanya/Documents/GitHub/Web-Projects-CS544/submit/prj2-sol/chow-down1.json";
const DATA_PATH = `${COURSE_DIR}/data/chow-down1.json`;
const DATA = readJson(DATA_PATH);

describe('eateries DAO', function() {

  let dao;

  beforeEach(async () => {
    dao = await setupDao();
    console.log(dao);
    await dao.loadEateries(DATA);
  });

  afterEach(async () => {
    await tearDownDao(dao);
  });

  it ('must find Chinese cuisine', async function () {
    const results = await dao.locateEateries('Chinese');
    console.log("result "+JSON.stringify(results))
    assert.equal(results.length, 5);
  });

 it ('must find all Chinese cuisine', async function () {
    const results = await dao.locateEateries('Chinese', params.bingLoc,
					     0, 100 );
    assert.equal(results.length, 19);
  });

 it ('must find cuisine sorted by dist', async function () {
    const results = await dao.locateEateries('indian');
    assert.isAbove(results?.length, 0);
    assert(results.every((r, i, res) => i === 0 || r.dist >= res[i - 1].dist));
  });

  it ('must find cuisine irrespective of case', async function () {
    const results = await dao.locateEateries('aMeRIcaN');
    assert.isAbove(results?.length, 0);
  });

  it ('must return empty list for non-existent cuisine', async function () {
    const results = await dao.locateEateries('italian');
    assert.equal(results.length, 0);
  });

  it ('must get overlapped eateries list correctly', async function () {
    const results0 = await dao.locateEateries('mexican');
    assert.isAbove(results0?.length, 0);
    const results1 = await dao.locateEateries('mexican', params.bingLoc, 2);
    assert.equal(results0[2].id, results1[0].id);
  });

  it ('must find eatery by id', async function () {
    const results = await dao.locateEateries('Chinese');
    const id = results[0].id;
    const eatery = await dao.getEatery(id);
    assert.equal(eatery.id, id);
    assert(JSON.stringify(eatery.menu));
  });

 it ('must verify eatery has requested cuisine', async function () {
    const CUISINE = 'chinese';
    const results = await dao.locateEateries(CUISINE);
    for (const r of results) {
      const id = r.id;
      const eatery = await dao.getEatery(id);
      assert.equal(eatery.cuisine.toLowerCase(), CUISINE);
    }
  });

  it ('must return NOT_FOUND error with bad eatery id', async function () {
    const id = '0';
    const eatery = await dao.getEatery(id);
    assert.isAbove(eatery.errors?.length, 0);
    assert.equal(eatery.errors[0].code, 'NOT_FOUND');
  });

/*
  it ('must insert new Order', async function () {

  const insertOrder = 
      {
        "eateryId": "123",
        "items": {
          "itemId": 2,
        }
      }
    const insertRes = await dao.newOrder("123") 
    assert.equal(insertOrder.eateryId, insertRes.eateryId);
  });

  it ('can not create new Order', async function () {
    const insertOrder = 0;
    const insertRes = await dao.newOrder(insertOrder);
    assert.equal(insertRes.errors[0].code, "DB");
  });

  it ('must get Orderinformation based on OrderNumber', async function () {
    const id = "123";
    const insertRes = await dao.newOrder("123") 
    const getRes = await dao.getOrder(insertRes.id) 
    console.log(insertRes.id +"  arjun "+getRes._id);
    assert.equal(insertRes.id, getRes._id);
  });

  it ('must return NOT-FOUND error if given OrderNumber not Present', async function () {
    const id = "0_56";
    const getRes = await dao.getOrder(id);
    assert.equal(getRes.errors[0].code, "NOT_FOUND");
  });
  

  it ('must removeOrder based on OrderNumber', async function () {
    
    const insertRes = await dao.newOrder("123") 
    const getRes = await dao.removeOrder(insertRes.id) 
    assert.equal(1, getRes.deletedCount);
  });

  it ('must return NOT-FOUND error if given OrderNumber not Present to removeOrder ', async function () {
    const id = "0_56";
    const getRes = await dao.removeOrder(id);
    assert.equal(getRes.errors[0].code, "NOT_FOUND");
  });

  it ('must editOrder based on OrderNumber', async function () {
    const itemId = "1232";
    const nChanges = 5;
    const insertRes = await dao.newOrder("123") 
    const getRes = await dao.editOrder(insertRes.id, itemId, nChanges) 
    assert.equal(insertRes.id, getRes._id);
  });

  it ('must editOrder based on OrderNumber with - nChangeValues', async function () {
   
    const itemId = "12321";
    const nChanges = -5;
     const insertRes = await dao.newOrder("123")
    const getRes = await dao.editOrder(insertRes.id, itemId, nChanges) 
    assert.equal( "BAD_REQ",getRes.errors[0].code);
  });

  it ('must editOrder based on OrderNumber with - nChangeValues', async function () {
    const itemId = "12321";
    const nChanges = 5;
     const insertRes = await dao.newOrder("123")
    const getRes = await dao.editOrder("121", itemId, nChanges) 
    assert.equal( "NOT_FOUND",getRes.errors[0].code);
  });
*/
});	

function readJson(path) {
  const text = fs.readFileSync(path, 'utf8');
  return JSON.parse(text);
}
