import { AppError } from './util.mjs';

/**
 * In addition to the docs for each method, each method is subject to
 * the following additional requirements:
 *
 *   + All string matching is case-insensitive.  Hence specifying
 *     cuisine "american" or "American" for locate() should return
 *     a list of all eateries having American cuisine.
 *
 *   + The implementation of each of the required methods should not
 *     require searching.  Instead, the returned object instance
 *     should set up suitable data structure which allow returning the
 *     requested information without searching.
 *  
 *   + Errors are returned by returning an object with property
 *     _errors which must be a list of objects, each having a 
 *     message property.
 */
class ChowDown {

  /** Create a new ChowDown object for specified eateries */
  constructor(eateries) {
    //TODO
    this.eateriesList = eateries;
  }

  /** return list giving info for eateries having the
   *  specified cuisine.  The info for each eatery must contain the
   *  following fields: 
   *     id: the eatery ID.
   *     name: the eatery name.
   *     dist: the distance of the eatery.
   *  The returned list must be sorted by distance.  Return [] if
   *  there are no eateries for the specified cuisine.
   */
  locate(cuisine) {
    //TODO

    const cusionList = this.eateriesList.filter(function (el) {
        return el.cuisine.toLowerCase() == cuisine.toLowerCase() ;    
    });

    const eateries = [];
    cusionList.map(item =>{
        eateries.push({id:item.id, name:item.name, dist:item.dist})
    });
	const sortedList = eateries.sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));
    return sortedList;
  }

  /** return list of menu categories for eatery having ID eid.  Return
   *  errors if eid is invalid with error object having code property
   *  'NOT_FOUND'.
   */
  categories(eid) {
    const cusionList = this.eateriesList.filter(function (el) {
        return el.id == eid ;    
    });
    if(cusionList.length > 0){
      return (Object.keys(cusionList[0].menu));
    }else{
      const msg = `bad eatery id ${eid}`;
      return { _errors: [ new AppError(msg, { code: 'NOT_FOUND', }), ] };
    }
  }

  /** return list of menu-items for eatery eid in the specified
   *  category.  Return errors if eid or category are invalid
   *  with error object having code property 'NOT_FOUND'.
   */ 
  menu(eid, category) {
   const cusionList = this.eateryList.filter(function (el) {
      return el.id == eid ;    
    });
    if(cusionList.length > 0){
      const menu = cusionList[0].menu;
      const menuItems = menu[category];
      if(menuItems){
        return menuItems;
      }else{
        const msg = `bad category ${category}`;
        return { _errors: [ new AppError(msg, { code: 'NOT_FOUND', }), ] };
      }
    }else{
        const msg = `bad eatery id ${eid}`;
        return { _errors: [ new AppError(msg, { code: 'NOT_FOUND', }), ] };
    }
  }
  
}

export default function make(eateries) {
  return new ChowDown(eateries);
}