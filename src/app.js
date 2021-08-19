/* global algoliasearch instantsearch */

import injectScript from 'scriptjs';
import { createDropdown } from './dropdown';

/**********************************************************
 * Modal
 *********************************************************/

var modal = document.getElementById("myModal");
var calendar = document.getElementById("calendar");

if (document.body.addEventListener){
    document.body.addEventListener('click',yourHandler,false);
} else{
    document.body.attachEvent('onclick',yourHandler);//for IE
}

function yourHandler(e){
    e = e || window.event;
    var target = e.target || e.srcElement;
    if (target.className.match(/myBtn/)) {
        modal.style.display = "block";
        calendar.style.display = "none";
    }
      if (e.target == modal) {
        modal.style.display = "none";
        calendar.style.display = "block";
      }
}

/**********************************************************
 * Calendar Picker
 *********************************************************/

const ONE_DAY_IN_MS = 3600 * 24 * 1000;

const makeRangeWidget = instantsearch.connectors.connectRange(
  (options, isFirstRendering) => {
    if (!isFirstRendering) {
      return;
    }

    const { refine } = options;

    new Calendar({
      element: $('#calendar'),
      same_day_range: true,
      callback: function() {
        const start = new Date(this.start_date).getTime();
        const end = new Date(this.end_date).getTime();
        const actualEnd = start === end ? end + ONE_DAY_IN_MS - 1 : end;

        refine([start, actualEnd]);
      },
      // Some good parameters based on our dataset:
      start_date: new Date('8/01/2021'),
      end_date: new Date('8/31/2021'),
      earliest_date: new Date('01/01/2021'),
      latest_date: new Date('01/01/2022'),
    });
  }
);

const dateRangeWidget = makeRangeWidget({
  attribute: 'start_at',
});

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
    <div style="font-size: 20px; margin-bottom: 1rem">No results. Check out our Featured Listings</div>
    <div class="ais-Hits">
        <ol class="ais-Hits-list">
            <li class="ais-Hits-item">
                <div class="item">
                    <a href="https://www.airbnb.com/rooms/42758714" target="_blank">
                        <img class="item-image" src="https://a0.muscache.com/pictures/3368f78f-c34a-434c-85a0-b729cbf52b9d.jpg">
                    </a>
                    <p class="item-header">Entire condominium in Downtown Asheville</p>
                    <h3>Downtown Asheville Modern Retreat</h3>
                    <p>$520 / night</p>
                </div>
            </li>
            <li class="ais-Hits-item">
                <div class="item">
                    <a href="https://www.airbnb.com/rooms/36727850" target="_blank">
                        <img class="item-image" src="https://a0.muscache.com/pictures/e08fecf3-cacb-4ce2-9814-4a8ae6d84308.jpg">
                    </a>
                    <p class="item-header">Entire guest suite in Biltmore Forest</p>
                    <h3>Biltmore Hideaway - Luxury Urban Tree Top Retreat</h3>
                    <p>$187 / night</p>
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
            indexName: 'listings_w_availability',
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
                templates: {
                  HTMLMarker: `
                    <span class="marker myBtn">
                      $\{{ price_per_day }}
                    </span>
                  `,
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
                        
                        // <p class="item-subtitle">${badge}</p>

                        return `
                            <div class="item">
                                <a href=${hit.listing_url} target="_blank">
                                    <img class="item-image" src="${hit.picture_url}">
                                </a>
                                <p class="item-header">${hit.property_type} in ${hit.neighborhood}</p>
                                <p class="item-name">${hit.name}</p>

                                <p class="item-subtitle">${hit.accommodates} guests * ${hit.bedrooms} bedrooms * ${hit.bathrooms} bathrooms</p>
                                <br>
                                <p class="item-reviews"><b>⭐ ${hit.review_score}</b> (${hit.review_count} reviews)</p>
                                <p class="item-reviews"><b>💲 ${hit.price_per_day}</b> / night</p>

                                <button style="margin-top:1rem;" class="myBtn">View</button>
                            </div>
                        `;
                    }
                },
            }),
            instantsearch.widgets.pagination({
                container: '#pagination'
            }),

            // Dropdown Facets
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


            // Calendar Picker
            dateRangeWidget,
        ]);
        search.start();
    }
);

