import { newElement, geoLoc } from './util.mjs';

/*
  A component which searches for eateries by location and cuisine.
  The location must be set to the browser's location (from geoLoc()).

  This component has two attributes:

    ws-url:  the base URL (protocol, host, port) where the web
             services are located.
    cuisine: the cuisine to be searched for.

  This component does not do anything when first connected to the DOM.
  It must respond to changes in its attribute values:

    ws-url: when this attribute changes, the component simply remembers
    its value.

    cuisine: when changed, the component should make a web-service call
    to search for eateries for that cuisine with location set to the
    browser's location.  Then it should set it's content corresponding
    to the pseudo-HTML shown below (dynamic data is shown within ${...} and
    wsData is the data returned from the web-service call):

      <ul class="eatery-results">
<!-- repeat for each eatery in wsData.eateries -->
<li>
 <span class="eatery-name">${eatery.name}</span>
 <span>${eatery.dist} miles</span>
 <a href=${links:self.href}>
   <button>Select</button>
 </a>
</li>
      </ul>

    The handler for the Select button should be set up to set
    the eatery-url attribute for the eatery-details component.

    This should be followed by up-to two scrolling links:

      <div class="scroll">
<!-- only when ${wsData.links:prev} -->
<a rel="prev" href="${wsData.links:prev.href}">
 <button>&lt;</button>
</a>
<!-- only when ${wsData.links:next} -->
<a rel="next" href="${wsData.links:next.href}">
 <button>&gt;</button>
</a>
      </div>

    When the above scrolling links are clicked, the results should
    be scrolled back-and-forth.

*/
class EateryResults extends HTMLElement {


  static get observedAttributes() { return ['ws-url', 'cuisine',]; }

  async attributeChangedCallback(name, oldValue, newValue) {
    try {


     // let mUrl;
      const currLocation = await geoLoc();
      const baseurl = this.getAttribute('ws-url')
      const url = new URL(baseurl);
      const eateryUrl = newValue;
      const eatery = await get(eateryUrl);

      const  mUrl = oldValue ? ((name === "name") ?   oldValue:   `${url}?cuisine=${newValue}` ) :   `${url}?cuisine=${newValue}`;
      const response = await fetchData(mUrl);
      //alert(mUrl+"     "+JSON.stringify(response));
      const resLinks = response.links;

      const newUl = newElement('ul', { class: 'eatery-results' },);

      response.eateries.forEach(element => {
        //  alert("element  "+JSON.stringify(element));
        this.innerHTML = ""
        const spanName = newElement('span', { class: 'eatery-name' }, element.name);
        const spanDist = newElement('span', {}, element.dist + " " + "miles");
        const btnSelect = newElement('button', {}, 'Select');
        const eateryAtr = newElement('a', { class: 'select-eatery', href: getHref(resLinks, 'self') }, btnSelect);

      });
      const newDiv = newElement('div', { class: 'scroll' })
// getHref(response.links, 'prev') !== undefined
      
    catch (err) {
      return new AppErrors().add(err);
    }
  }

  //TODO auxiliary methods
}

//register custom-element as eatery-results
customElements.define('eatery-results', EateryResults);



/*
  A component which shows the details of an eatery.

  When created, it is set up with a buyFn *property* which should be
  called with an eatery-id and item-id to order a single unit of the
  item item-id belonging to eatery-id.

  The component has a single attribute: eatery-url which is the url
  for the web service which provides details for a particular eatery.

  This component does not do anything when first connected to the DOM.
  It must respond to changes in its eatery-url attribute.  It must
  call the web service corresponding to the eatery-url and set it's
  content corresponding to the pseudo-HTML shown below (dynamic data
  is shown within ${...} and wsData is the data returned from the
  web-service call):


      <h2 class="eatery-name">${wsData.name} Menu</h2>
      <ul class="eatery-categories">
<!-- repeat for each category in wsData.menuCategories -->
<button class="menu-category">${category}</button>
      </ul>
      <!-- will be populated with items for category when clicked above -->
      <div id="category-details"></div>

  The handler for the menu-category button should populate the
  category-details div for the button's category as follows:

      <h2>${category}</h2>
      <ul class="category-items">
<!-- repeat for each item in wsData.flatMenu[wsData.menu[category]] -->
<li>
 <span class="item-name">${item.name}</span>
 <span class="item-price">${item.price}</span>
 <span class="item-details">${item.details}</span>
 <button class="item-buy">Buy</button>
</li>
      </ul>

  The handler for the Buy button should be set up to call
  buyFn(eatery.id, item.id).

*/

class EateryDetails extends HTMLElement {

  static get observedAttributes() { return ['eatery-url',]; }

  async attributeChangedCallback(name, oldValue, newValue) {
    try {

      const response = await fetchData(this.getAttribute('eatery-url'));
      const menuCategories = response?.menuCategories;
      const name = `${response?.name} Menu`;
        const newBtn = newElement('button', { class: 'menu-category' }, category);
        newBtn.addEventListener('click', event => {
          event.preventDefault();
          // document.getElementById("category-details");

          });
          
        ulattribute.append(newBtn);

      });

      this.append(eateryHeader);
      this.append(ulattribute);
      const categoryDetails = newElement('div', { id: 'category-details' },);
      this.append(categoryDetails);
    }
    catch (err) {
      return new AppErrors().add(err);
    }
    //TODO
  }


  //TODO auxiliary methods

}

//register custom-element as eatery-details
customElements.define('eatery-details', EateryDetails);

async function get(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw `cannot fetch ${url}: ${response.statusText}`;
    }
    return await response.json();
  }
  catch (err) {
    console.error(err);
    return {};
  }
}


/** Given a list of links and a rel value, return the href for the
 *  link in links having the specified value.
 */
function getHref(links, rel) {
  return links.find(link => link.rel === rel)?.href;
}

//TODO auxiliary functions