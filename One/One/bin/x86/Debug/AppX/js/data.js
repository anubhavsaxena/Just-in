(function () {
    "use strict";
    //siteFeedList is the url list that user selects to read
    var siteFeedList = [];
    //window.indexedDB.deleteDatabase('AppDB');
    //debugger;
    doDBOperation();
    //
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
        //debugger;
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
    // TODO: Replace the data with your real data.
    // You can add data from asynchronous sources whenever it becomes available.
    //generateSampleData().forEach(function (item) {
    //    list.push(item);
    //});
    //debugger;
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
        //debugger;
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
        siteFeedList.forEach(function (siteFeed) {
            var jsonURL = 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=json&q=' + encodeURIComponent(siteFeed.feedurl);
            WinJS.xhr({ url: jsonURL }).done(function (data) {
                var urlResponse = JSON.parse(data.response);
                var feed = urlResponse.responseData.feed;

                var entries = [];
                sampleGroups.push({ key: 'group' + sampleGroupIndex, title: siteFeed.title, subtitle: feed.link, backgroundImage:siteFeed.img, description: feed.description });
                //debugger;
                feed.entries.forEach(function (entry) {
                    var imageUrl = siteFeed.img;
                    var contentHTML = window.toStaticHTML('<div>' + entry.content + '</div>');
                    //debugger;
                    imageUrl = $(contentHTML).find('img:first').attr('src');
                    debugger;
                    if (imageUrl == null) {
                        imageUrl = siteFeed.img;
                    }
                    //debugger;
                    //if (entry.mediaGroups != null) {
                    //    imageUrl = entry.mediaGroups[0].contents[0].thumbnails[0].url;
                    //}
                    //else {
                    //    imageUrl = lightGray;
                    //}
                    entries.push({ group: sampleGroups[sampleGroupIndex], title: entry.title, subtitle: entry.publishedDate, description: entry.contentSnippet, content: contentHTML, backgroundImage: imageUrl });
                    sampleItems.push({ group: sampleGroups[sampleGroupIndex], title: entry.title, subtitle: entry.publishedDate, description: entry.contentSnippet, content: contentHTML, backgroundImage: imageUrl });
                });
                sampleGroupIndex++;
                entries.forEach(function (entry) {
                    list.push(entry);
                });
            });

        });
        return sampleItems;
    }

    function doDBOperation() {
        siteFeedList = [];
        var request = window.indexedDB.open('AppDB', 1);
        var urlDB = null;
        var items = [];
        //debugger;
        request.onerror = function (event) { debugger; };
        request.onsuccess = function (event) {
            // Log whether the app tried to create the database when it already existed.
            urlDB = event.target.result;

            if (urlDB != null) {
                var transaction = urlDB.transaction('UserSelectedSources');
                transaction.oncomplete = function (idb) {
                    //debugger;
                    generateSampleData();
                };

                var store = transaction.objectStore('UserSelectedSources');
                store.openCursor().onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        //debugger;
                        siteFeedList.push({ title:cursor.value.title, feedurl: cursor.value.feedurl, img:cursor.value.img });
                        cursor.continue();
                    }
                };
                //if (store.get(item.key) == null) {
                //    debugger;
                //    //store.add(item);
                //}


            }
        };
        request.onupgradeneeded = function (event) {
            //debugger;
            var db = event.target.result;
            var userurlStore = db.createObjectStore('UserSelectedSources', { keyPath: 'key' });

            userurlStore.createIndex('title', 'title', { unique: false });
        };
    }
})();
