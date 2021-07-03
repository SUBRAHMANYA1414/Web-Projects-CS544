import { setupDao, tearDownDao } from './util.mjs'
import params from '../src/params.mjs';
import chai from 'chai';
const { assert } = chai;
const dao = await setupDao();

describe('eateries DAO', function() {

  it ('must insert new Order', async function () {
    const insertRes = await dao.newOrder("123") 
    assert.equal("123", insertRes.eateryId);
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

});	
