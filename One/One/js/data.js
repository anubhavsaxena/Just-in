(function () {
    "use strict";
    //siteFeedList is the url list that user selects to read
    var siteFeedList = [];
    //window.indexedDB.deleteDatabase('AppDB');
    //debugger;
    doDBOperation();
    //masterList is the base data that the app stores 

    var masterList = new WinJS.Binding.List();
    var masterGroupedList;
    //fill masterList will json file content
    $.getJSON('/Data/MasterData.json', function (data) {
        var index = 1;
        data.master.category.forEach(function (cat) {
            //masterData.push({ key: index, title: cat.title });//, options: cat.options
            cat.options.option.forEach(function (opt) {
                masterList.push({ key: index, title: opt.title, feedurl: opt.feedurl, img: opt.img, category: cat.title })
                index++;
            });

        });

    });

    var masterGroupedList = masterList.createGrouped(
        function categoryKeySelector(item) { return item.category; },
        function categoryDataSelector(item) { return { categorytitle: item.category }; }
        );
    var list = new WinJS.Binding.List();
    var groupedItems = list.createGrouped(
        function groupKeySelector(item) { return item.group.key; },
        function groupDataSelector(item) { return item.group; }
    );

    WinJS.Namespace.define("Data", {
        categories: masterGroupedList,
        items: groupedItems,
        groups: groupedItems.groups,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference,
        updateItems: updateItems
    });

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.group.key, item.title];
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return list.createFiltered(function (item) { return item.group.key === group.key; });
    }

    // Get the unique group corresponding to the provided group key.
    function resolveGroupReference(key) {
        for (var i = 0; i < groupedItems.groups.length; i++) {
            if (groupedItems.groups.getAt(i).key === key) {
                return groupedItems.groups.getAt(i);
            }
        }
    }

    // Get a unique item from the provided string array, which should contain a
    // group key and an item title.
    function resolveItemReference(reference) {
        for (var i = 0; i < groupedItems.length; i++) {
            var item = groupedItems.getAt(i);
            if (item.group.key === reference[0] && item.title === reference[1]) {
                return item;
            }
        }
    }

    function updateItems() {
        list = new WinJS.Binding.List();
        doDBOperation();
        groupedItems = list.createGrouped(
        function groupKeySelector(item) { return item.group.key; },
        function groupDataSelector(item) { return item.group; }
    );
        Data.items = groupedItems;
        Data.groups = groupedItems.groups;
    }
    // Returns an array of sample data that can be added to the application's
    // data list. 
    function generateSampleData() {
        var feedURL = 'http://feeds.feedburner.com/TechCrunch/startups';

        var sampleGroupIndex = 0;

        var data = document.location.protocol + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(feedURL);

        // These three strings encode placeholder images. You will want to set the
        // backgroundImage property in your real data to be URLs to images.
        var darkGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY3B0cPoPAANMAcOba1BlAAAAAElFTkSuQmCC";
        var lightGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY7h4+cp/AAhpA3h+ANDKAAAAAElFTkSuQmCC";
        var mediumGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY5g8dcZ/AAY/AsAlWFQ+AAAAAElFTkSuQmCC";

        // Each of these sample groups must have a unique key to be displayed
        // separately.
        var sampleGroups = [];
        var sampleItems = [];
        var entries = [];
        var oldentries = [];
        ReadCacheData(siteFeedList).then(function (e) {
            e.forEach(function (article) {
                oldentries.push(article.title);
                list.push({ group: article.group, title: article.title, subtitle: article.subtitle, description: article.description, content: article.content, backgroundImage: article.backgroundImage });
            });
        });
        

        siteFeedList.forEach(function (siteFeed) {
            var promise = new WinJS.Promise(function (complete, error) {
                var jsonURL = 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=json&q=' + encodeURIComponent(siteFeed.feedurl);
                WinJS.xhr({ url: jsonURL }).done(function (data) {
                    var urlResponse = JSON.parse(data.response);
                    var feed = urlResponse.responseData.feed;

                    entries = [];
                    sampleGroups.push({ key: 'group' + sampleGroupIndex, title: siteFeed.title, subtitle: feed.link, backgroundImage: siteFeed.img, description: feed.description });

                    feed.entries.forEach(function (entry) {
                        var imageUrl = siteFeed.img;
                        var contentHTML = window.toStaticHTML('<div>' + entry.content + '</div>');
                        contentHTML = contentHTML.replace(/<h1\b[^>]*>/g, '<h3>');
                        contentHTML = contentHTML.replace(/<\/h1\b[^>]*>/g, '</h3>');
                        contentHTML = contentHTML.replace(entry.title, '');

                        imageUrl = $(contentHTML).find('img:first').attr('src');

                        if (imageUrl == null) {
                            imageUrl = siteFeed.img;
                        }

                        entries.push({ group: sampleGroups[sampleGroupIndex], title: entry.title, subtitle: entry.publishedDate, description: entry.contentSnippet, content: contentHTML, backgroundImage: imageUrl });
                        sampleItems.push({ group: sampleGroups[sampleGroupIndex], title: entry.title, subtitle: entry.publishedDate, description: entry.contentSnippet, content: contentHTML, backgroundImage: imageUrl });
                    });
                    sampleGroupIndex++;
                    var newlist = new WinJS.Binding.List();
                    entries.forEach(function (entry) {
                        if ($.inArray(entry.title, oldentries) < 0) {
                            //debugger;
                            newlist.push(entry);
                        }
                        
                    });
                    list = list.concat(newlist.slice(0));
                    complete();
                });

            });
            promise.then(function () { CacheData(entries); });
        });

        return sampleItems;
    }

    function ReadCacheData(entries) {
        return new WinJS.Promise(function (complete, error) {
            var request = window.indexedDB.open('AppDB', 1);
            var urlDB = null;

            request.onerror = function (event) { debugger; };
            request.onsuccess = function (event) {
                // Log whether the app tried to create the database when it already existed.
                urlDB = event.target.result;
                var items = entries;

                var transaction = urlDB.transaction('FeedCache');
                transaction.onerror = function (e) { debugger; }
                var store = transaction.objectStore('FeedCache');
                var i = 0;
                var oldarticles = [];
                store.openCursor().onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        //debugger;
                        entries.forEach(function (entry) {
                            if (cursor.value.grouptitle == entry.title)
                                oldarticles.push(cursor.value);
                        });
                        cursor.continue();
                    }
                    else {
                        //debugger;
                        complete(oldarticles);
                    }
                };
                //addnext();
                //function addnext() {
                //    if (i < items.length) {
                //        var request = store.index('grouptitle').get(items[i].title);
                //            request.onsuccess = function (event) {
                //            if (event.target.result != null) {
                //                var olditems = event.target.result;
                //                olditems.forEach(function (olditem) {
                //                    oldentries.push(olditem);
                //                });
                //            }
                //            i++;
                //            addnext();
                //        };
                //    }
                //    else {
                //        complete(oldentries);
                //    }
                //}

            };
            request.onupgradeneeded = function (event) {

                var db = event.target.result;
                var userurlStore = db.createObjectStore('UserSelectedSources', { keyPath: 'key' });
                userurlStore.createIndex('title', 'title', { unique: false });
                var feedCache = db.createObjectStore('FeedCache', { keyPath: 'title' });
                feedCache.createIndex('title', 'title', { unique: false });
                feedCache.createIndex('grouptitle', 'grouptitle', { unique: false });
            };
        });
    }

    function CacheData(entries) {
        var request = window.indexedDB.open('AppDB', 1);
        var urlDB = null;

        request.onerror = function (event) { debugger; };
        request.onsuccess = function (event) {
            // Log whether the app tried to create the database when it already existed.
            urlDB = event.target.result;
            var items = entries;
            //debugger;
            var transaction = urlDB.transaction('FeedCache', 'readwrite');
            transaction.onerror = function (e) { debugger; }
            var store = transaction.objectStore('FeedCache');
            var i = 0;
            addnext();

            function addnext() {
                if (i < items.length) {
                    store.index('title').get(items[i].title).onsuccess = function (event) {
                        if (event.target.result == null) {
                            store.count().onsuccess = function (e) {
                                var hell = e.target.result;
                                var item = { grouptitle: items[i].group.title, group: items[i].group, title: items[i].title, subtitle: items[i].subtitle, description: items[i].description, content: items[i].content, backgroundImage: items[i].backgroundImage };
                                var request = store.add(item);
                                request.onsuccess = function () {
                                    i++;
                                    //debugger;
                                    addnext();
                                };
                            };

                        }
                    };

                }
            }
        };
        request.onupgradeneeded = function (event) {

            var db = event.target.result;
            var userurlStore = db.createObjectStore('UserSelectedSources', { keyPath: 'key' });
            userurlStore.createIndex('title', 'title', { unique: false });
            var feedCache = db.createObjectStore('FeedCache', { keyPath: 'title' });
            feedCache.createIndex('title', 'title', { unique: false });
            feedCache.createIndex('grouptitle', 'grouptitle', { unique: false });
        };
    }

    //does read operations on the db to get user selected feeds
    function doDBOperation() {
        siteFeedList = [];
        var request = window.indexedDB.open('AppDB', 1);
        var urlDB = null;
        var items = [];

        request.onerror = function (event) { debugger; };
        request.onsuccess = function (event) {
            // Log whether the app tried to create the database when it already existed.
            urlDB = event.target.result;

            if (urlDB != null) {
                var transaction = urlDB.transaction('UserSelectedSources');
                transaction.oncomplete = function (idb) {
                    generateSampleData();
                };

                var store = transaction.objectStore('UserSelectedSources');
                store.openCursor().onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {

                        siteFeedList.push({ title: cursor.value.title, feedurl: cursor.value.feedurl, img: cursor.value.img });
                        cursor.continue();
                    }
                };

            }
        };
        request.onupgradeneeded = function (event) {

            var db = event.target.result;
            var userurlStore = db.createObjectStore('UserSelectedSources', { keyPath: 'key' });
            userurlStore.createIndex('title', 'title', { unique: false });
            var feedCache = db.createObjectStore('FeedCache', { keyPath: 'title' });
            feedCache.createIndex('title', 'title');
            feedCache.createIndex('grouptitle', 'grouptitle', { unique: false });
        };
    }
})();
