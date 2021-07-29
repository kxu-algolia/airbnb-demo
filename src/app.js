/* global algoliasearch instantsearch */

import injectScript from 'scriptjs';

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
        ]);
        search.start();
    }
);

