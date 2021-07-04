import { AppError, } from './util.mjs';
import params from './params.mjs';

import mongo from 'mongodb';

//use in mongo.connect() to avoid warning
const MONGO_CONNECT_OPTIONS = { useUnifiedTopology: true };

const EATERIES_COLLECTION = 'eateries';
const ORDERS_COLLECTION = 'orders';
//TODO

// properties which are used only within mongo documents and should be
// removed from returned objects.
const INTERNALS = ['_id', '_cuisine', '_location'];

/** Exported factory method. */
export default async function make(dbUrl) {
  return await ChowDao.make(dbUrl);
}

/**
 * In addition to the docs for each method, each method is subject to
 * the following additional requirements:
 *
 *   + All string matching is case-insensitive.  Hence specifying
 *     cuisine "american" or "American" for locate() should return
 *     a list of all eateries having American cuisine.
 *
 *   + The implementation of each of the required methods should not
 *     require searching.  Instead, the database should set up
 *     suitable data structure which allow returning the requested
 *     information without searching.
 *  
 *   + Errors are returned by returning an object with property
 *     _errors which must be a list of objects, each having 
 *     message and code properties.
 *
 *   + Any otherwise uncategorized database error should be returned
 *     with code 'DB'.
 */
class ChowDao {

  constructor(params) { Object.assign(this, params); }

  //factory method which performs connection set up async calls
  //and all other necessary initialization, sets up properties
  //to be stored in the ChowDao instance and finally returns
  //the instance created using the properties.
  //Returns object containsing an errors property if a db errors.
  static async make(dbUrl) {
    const params = {};
    try {
      params._client = await mongo.connect(dbUrl, MONGO_CONNECT_OPTIONS);
      const db = params._client.db();
      params._eateries = db.collection(EATERIES_COLLECTION);
      params._orders = db.collection(ORDERS_COLLECTION);
      params._id = 1;
      params._db = db;
      params._genId = new IdGen(params._id);
    }
    catch (err) {
      const msg = `cannot connect to URL "${dbUrl}": ${err}`;
      return { errors: [new AppError(msg, { code: 'DB' })] };
    }
    return new ChowDao(params);
  }

  /** Release all resources held by this instance.
   *  Specifically, close any database connections.
   */
  async close() {
    await this._client.close();
  }

  /** Return a new order object { id, eateryId } having an id
   *  field set to an ID different from that of any existing order.
   *  The order-id should be hard to guess.
   *  Returns an object with errors property if db errors encountered.
   */
  async newOrder(eateryId) {

    const insertId = await this._nextOrderId();

    const insert = {
      _id: insertId,
      id:insertId,
      eateryId: eateryId,
      items: {
        itemId: '1232',
      }
    };

    try {
      if (eateryId == 0) {
        throw "ERROR"
      }
      const insertedValue = await this._orders.insertOne(insert);
      if (insertedValue.insertedCount == 1) {
        return {
          eateryId: eateryId,
          id: insertId
        };
      } else {
        throw "ERROR"
      }
    }
    catch (err) {
      const msg = `cannot create new order: ${err}`;
      return { errors: [new AppError(msg, { code: 'DB' })] };
    }
  }

  // Returns a unique, difficult to guess order-id.
  async _nextOrderId() {
    //TODO
    const nxtId = await this._genId.nextId();
    this._id++;
    return nxtId;
  }

  /** Return object { id, eateryId, items? } containing details for
   *  order identified by orderId.  The returned items should be an object
   *  mapping an item-id to the positive quantity for that item.  
   *
   *  If there is no order having orderId, then return a NOT_FOUND error.
   */
  async getOrder(orderId) {
    try {
      //TODO
      const orderList = await this._orders.findOne({ id: orderId },{_id:0})
      
      if (orderList != null) {
        return orderList;
      }
      else {
        throw "orderId " + orderId + " NOT_FOUND";
      }
    }
    catch (err) {
      const msg = `cannot read order ${orderId}: ${err}`;
      return { errors: [new AppError(msg, { code: 'NOT_FOUND' })] };
    }
  }

  /** Remove order identified by orderId from db.  Returns {} if ok,
   *  NOT_FOUND error if there is no order having id orderId.
   */
  async removeOrder(orderId) {
    try {
      //TODO

      const res = await this._orders.deleteOne({ id: orderId });

      if (res.deletedCount == 1)
        return { deletedCount: res.deletedCount };
      else
        throw "orderId - " + orderId + " - NOT_FOUND";
    }
    catch (err) {
      const msg = `cannot read order ${orderId}: ${err}`;
      return { errors: [new AppError(msg, { code: 'NOT_FOUND' })] };
    }
  }

  /** Change quantity for itemId in order orderId by nChanges.  If
   *  itemId does not occur in the order, then set the quantity for
   *  itemId to nChanges.  If the item specified by itemId occurs in
   *  the order and nChanges >= 0, then increment the quantity by
   *  nChanges; if nChanges < 0, then decrement the quantity by
   *  |nChanges|.  Return updated order.  
   *
   *  Return error NOT_FOUND if there is no order for orderId, BAD_REQ
   *  if nChanges would result in a negative quantity for itemId.
   */
  async editOrder(orderId, itemId, nChanges) {
    try {
      //TODO
      const orderDetails = await this.getOrder(orderId);
      console.log("orderDetails " + orderId);
      console.log(JSON.stringify(orderDetails))
      if (!orderDetails.hasOwnProperty('errors')) {
        const itemList = Object.keys(orderDetails.items);

        for (let i = 0; i < itemList.length; i++) {
          const listItemId = orderDetails.items[itemList[i]];
          console.log("listItemId  " + listItemId);
          if (listItemId == itemId) {
            let qnty = orderDetails.items.quantity || 0;
            orderDetails.items.quantity = nChanges > 0 ? qnty + nChanges : qnty - nChanges;
            console.log(orderDetails.items.quantity);
          } else {
            if (nChanges < 0) {
              console.log("nChanges   " + nChanges);
              throw "BAD_REQ"
            }
            orderDetails.items.quantity = nChanges;
          }
        }
        console.log("check    " + orderDetails)
        const update = { "$set": { items: orderDetails.items } }
        const updatedRecord = await this._orders.updateOne({ _id: orderId }, update);
        console.log("updated record   " + JSON.stringify(updatedRecord))
        if (updatedRecord.modifiedCount !== 0) {

          const updatedRecordValue = await this.getOrder(orderId);
          if (updatedRecord != null) {
            return updatedRecordValue;
          } else {
            throw "NOT_FOUND"
          }
        } else {
          throw "NOT_FOUND"
        }
      } else {
        console.log('not found records');
        throw "NOT_FOUND"
      }
    }
    catch (err) {   
      const msg = `cannot read order ${orderId}: ${err}`;
      return { errors: [new AppError(msg, { code: err })] };
    }
  }

  /** Return eatery having specified id eid.  Return errors if eid is
   *  invalid with error object having code property 'NOT_FOUND'.
   */
  async getEatery(eid) {
    try {
      const eatery = await
        this._eateries.findOne({ _id: eid.replaceAll('.', '_') });
      if (eatery === null) {
        const msg = `cannot find eatery "${eid}"`;
        return { errors: [new AppError(msg, { code: 'NOT_FOUND' })] };
      }
      const ret = { ...eatery };
      INTERNALS.forEach(i => delete ret[i]);
      return ret;
    }
    catch (err) {
      const msg = `cannot find eatery "${eid}": ${err}`;
      return { errors: [new AppError(msg, { code: 'DB' })] };
    }
  }

  /** Replace all existing eateries in underlying database with eateries. */
  async loadEateries(eateries) {
    try {
      await this._eateries.deleteMany({});
      await this._eateries.createIndex({ _cuisine: 'hashed' });
      await this._eateries.createIndex({ _location: '2dsphere' });
      for (const eatery of eateries) {
        const insert = {
          ...eatery,
          _id: eatery.id.replaceAll('.', '_'),
          _cuisine: eatery.cuisine.toLowerCase(),
          _location: {
            type: 'Point',
            coordinates: [eatery.loc.lng, eatery.loc.lat],
          },
        };
        const ret = await this._eateries.insertOne(insert);
        //const ret1 = await this._orders.insertOne(insert);
        if (ret.insertedCount !== 1) {
          throw `inserted ${ret.insertedCount} eateries for ${eatery.id}`;
        }
      }
    }
    catch (err) {
      const msg = `cannot load eateries: ${err}`;
      return { errors: [new AppError(msg, { code: 'DB' })] };
    }
  }

  /** return list giving info for eateries having the
   *  specified cuisine.
   *  The info returned for each eatery must contain the
   *  following fields: 
   *     id: the eatery ID.
   *     name: the eatery name.
   *     loc: { lat, lng } object giving location of eatery,
   *     dist: the distance of the eatery from loc
   *  The returned list must be sorted by dist from 
   *  loc { lat, lng }.  Return [] if there are no eateries for the 
   *  specified cuisine.
   */
  async locateEateries(cuisine, loc = params.bingLoc, index = 0,
    count = params.defaultCount) {
    try {
      const params = [{
        $geoNear: {
          near: { type: 'Point', coordinates: [loc.lng, loc.lat] },
          spherical: true,
          query: { _cuisine: cuisine.toLowerCase(), },
          distanceField: 'dist',
          distanceMultiplier: 1 / 1600,
        },
      }];
      const cursor = await
        this._eateries.aggregate(params).skip(index).limit(count);
      const arr = await cursor.toArray();
      return arr.map(a => ({
        id: a.id,
        name: a.name,
        loc: a.loc,
        dist: a.dist,
        cusine: a.cuisine,
      }));
    }
    catch (err) {
      const msg = `
	cannot locate "${cuisine} eateries at (${loc.lat}, ${loc.lng}): ${err}
      `.trim();
      return { errors: [new AppError(msg, { code: 'DB' })] };
    }
  }

}

/** Generate id strings.  Construct by passing an integer base which
 *  will be used to generate the base part of an id as "baseInc_rand"
 *  where baseInc is an increment of base and rand is a random number.
 *  baseInc will make the id unique and rand will make the id
 *  difficult to guess.
 *
 *  Exposes a base property giving the current value of base.
 */
const ID_RAND_LEN = 2;  //increase for production code
class IdGen {
  constructor(base) { this._base = base; }

  nextId() {
    return (this._base++ + Math.random())
      .toFixed(ID_RAND_LEN)
      .replace('.', '_');
  }

  get base() { return this._base; }

}

