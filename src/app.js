/* global algoliasearch instantsearch */

import injectScript from 'scriptjs';

import { createDropdown } from './dropdown';

/**********************************************************
 * Facet Dropdowns
 *********************************************************/

const MOBILE_WIDTH = 375;

const refinementListDropdown = createDropdown(
  instantsearch.widgets.refinementList,
  {
    // closeOnChange: true,
    closeOnChange: () => window.innerWidth >= MOBILE_WIDTH,
  }
);

const brandDropdown = createDropdown(instantsearch.widgets.refinementList, {
  // closeOnChange: true,
  closeOnChange: () => window.innerWidth >= MOBILE_WIDTH,
  cssClasses: { root: 'my-BrandDropdown' },
});


/*
const brandDropdown = createDropdown(instantsearch.widgets.refinementList, {
  // closeOnChange: true,
  closeOnChange: () => window.innerWidth >= MOBILE_WIDTH,
  cssClasses: { root: 'my-BrandDropdown' },
});

const priceDropdown = createDropdown(instantsearch.widgets.rangeSlider, {
  buttonText({ start }) {
    const s = start && Number.isFinite(start[0]) ? start[0] : '';
    const e = start && Number.isFinite(start[1]) ? start[1] : '';
    return s || e ? `Price (${s}~${e})` : 'Price Slider';
  },
  buttonClassName({ start }) {
    const isRefined =
      Number.isFinite(start && start[0]) || Number.isFinite(start && start[1]);
    return isRefined && 'ais-Dropdown-button--refined';
  },
});

const priceMenuDropdown = createDropdown(instantsearch.widgets.numericMenu, {
  buttonText({ items }) {
    const refinedItem = (items || []).find(
      (item) => item.label !== 'All' && item.isRefined
    );
    return refinedItem ? `Price (${refinedItem.label})` : 'Price Menu';
  },
  buttonClassName({ items }) {
    const isRefined = (items || []).find(
      (item) => item.label !== 'All' && item.isRefined
    );
    return isRefined && 'ais-Dropdown-button--refined';
  },
});

const categoryDropdown = createDropdown(
  instantsearch.widgets.hierarchicalMenu,
  {
    buttonText: 'Category',
  }
);
*/



injectScript(
    'https://maps.googleapis.com/maps/api/js?v=quarterly&key=AIzaSyB7cCA9xZH3viDwm5Lbhf9eA5LRfmltrjc',
    () => {
        const searchClient = algoliasearch(
            'A49QZ9JN22',
            '1dbb0afe7e8a46415d05c57aca77e885'
        );
        const search = instantsearch({
            indexName: 'listings',
            searchClient,
            hitsPerPage: 8,
        });

        search.addWidgets([
            instantsearch.widgets.configure({
                hitsPerPage: 8,
            }),
            instantsearch.widgets.searchBox({
                container: '#searchbox',
            }),
            instantsearch.widgets.geoSearch({
                container: '#maps',
                googleReference: window.google,
                mapOptions: {
                    mapTypeId: window.google.maps.MapTypeId.ROADMAP,
                },
            }),
            instantsearch.widgets.hits({
                container: '#hits',
                templates: {
                    item(hit) {
                        var badge = '';
                        if (hit.is_furnished) badge += "Furnished · ";
                        if (hit.has_pool) badge += "Pool · ";
                        if (hit.is_pet_friendly) badge += "Pet friendly · ";
                        if (badge) badge = badge.substring(0, badge.length - 3);

                        return `
                            <div class="item">
                                <a href=${hit.listing_url} target="_blank">
                                    <img class="item-image" src="${hit.picture_url}">
                                </a>
                                <p class="item-header">${hit.property_type} in ${hit.neighborhood}</p>
                                <h3>${hit.name}</h3>
                                <p>$ ${hit.price_per_day} / night</p>
                                <p>${badge}</p>
                            </div>
                        `;
                    }
                },
            }),
            instantsearch.widgets.pagination({
                container: '#pagination'
            }),

              refinementListDropdown({
                container: '#numBeds',
                attribute: 'bedrooms',
                sortBy: ["name: asc"],
              }),

              refinementListDropdown({
                container: '#numBaths',
                attribute: 'bathrooms',
                sortBy: ["name: asc"],
              }),

              brandDropdown({
                container: '#neighborhood',
                attribute: 'neighborhood',
                searchable: true,
              }),

              /*
              brandDropdown({
                container: '#brand',
                attribute: 'brand',
                searchable: true,
              }),
              refinementListDropdown({
                container: '#type',
                attribute: 'type',
                searchable: true,
              }),
              priceDropdown({
                container: '#price',
                attribute: 'price',
              }),
              priceMenuDropdown({
                container: '#price2',
                attribute: 'price',
                items: [
                  { label: 'All' },
                  { end: 4, label: 'less than 4' },
                  { start: 4, end: 4, label: '4' },
                  { start: 5, end: 10, label: 'between 5 and 10' },
                  { start: 10, label: 'more than 10' },
                ],
              }),
              categoryDropdown({
                container: '#category',
                attributes: [
                  'hierarchicalCategories.lvl0',
                  'hierarchicalCategories.lvl1',
                  'hierarchicalCategories.lvl2',
                ],
              }),
              */
        ]);
        search.start();
    }
);

