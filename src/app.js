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
        });

        search.addWidgets([
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
                        return `
                            <div class="item">
                                <a href=${hit.listing_url} target="_blank">
                                    <img class="item-image" src="${hit.picture_url}">
                                </a>
                                <p>${hit.name}</p>
                            </div>
                        `;
                    }
                },
            }),
        ]);
        search.start();
    }
);

