/* global algoliasearch instantsearch */

import injectScript from 'scriptjs';
import { createDropdown } from './dropdown';

/**********************************************************
 * Facet Dropdowns
 *********************************************************/

const MOBILE_WIDTH = 375;

const bedroomsDropdown = createDropdown(
    instantsearch.widgets.refinementList, {
        closeOnChange: () => window.innerWidth >= MOBILE_WIDTH,
        cssClasses: { root: 'my-NumericDropdown'},

    }
);
const bathroomsDropdown = createDropdown(
    instantsearch.widgets.refinementList, {
        closeOnChange: () => window.innerWidth >= MOBILE_WIDTH,
        cssClasses: { root: 'my-NumericDropdown'},
    }
);
const roomTypeDropdown = createDropdown(
    instantsearch.widgets.refinementList, {
        closeOnChange: () => window.innerWidth >= MOBILE_WIDTH,
        cssClasses: { root: 'my-RoomTypeDropdown' },
        buttonText: 'Room Type',
    }
);
const brandDropdown = createDropdown(instantsearch.widgets.refinementList, {
    // closeOnChange: true,
    closeOnChange: () => window.innerWidth >= MOBILE_WIDTH,
    cssClasses: { root: 'my-BrandDropdown'},
});


const noResultsFeaturedCarousel = `
    <div>No results. Check out our Featured Listings</div>
    <div class="ais-Hits">
        <ol class="ais-Hits-list">
            <li class="ais-Hits-item">
                <div class="item">
                    <a href="https://www.airbnb.com/rooms/992821" target="_blank">
                        <img class="item-image" src="https://a0.muscache.com/pictures/be420050-6c9c-4b3e-9f5d-aea30148d816.jpg">
                    </a>
                    <p class="item-header">Entire house in Woodside Hills</p>
                    <h3>Serene West Asheville Home with a Mountain View</h3>
                    <p>$174 / night</p>
                </div>
            </li>
            <li class="ais-Hits-item">
                <div class="item">
                    <a href="https://www.airbnb.com/rooms/992821" target="_blank">
                        <img class="item-image" src="https://a0.muscache.com/pictures/be420050-6c9c-4b3e-9f5d-aea30148d816.jpg">
                    </a>
                    <p class="item-header">Entire house in Woodside Hills</p>
                    <h3>Serene West Asheville Home with a Mountain View</h3>
                    <p>$174 / night</p>
                </div>
            </li>
            <li class="ais-Hits-item">
                <div class="item">
                    <a href="https://www.airbnb.com/rooms/992821" target="_blank">
                        <img class="item-image" src="https://a0.muscache.com/pictures/be420050-6c9c-4b3e-9f5d-aea30148d816.jpg">
                    </a>
                    <p class="item-header">Entire house in Woodside Hills</p>
                    <h3>Serene West Asheville Home with a Mountain View</h3>
                    <p>$174 / night</p>
                </div>
            </li>
        </ol>
    </div>`;

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
                    empty: noResultsFeaturedCarousel,
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

            bedroomsDropdown({
                container: '#numBeds',
                attribute: 'bedrooms',
                sortBy: ["name: asc"],
            }),
            bathroomsDropdown({
                container: '#numBaths',
                attribute: 'bathrooms',
                sortBy: ["name: asc"],
            }),
            brandDropdown({
                container: '#neighborhood',
                attribute: 'neighborhood',
                searchable: true,
            }),
            roomTypeDropdown({
                container: '#roomType',
                attribute: 'room_type',
                lable: 'Room Type',
            }),
        ]);
        search.start();
    }
);

