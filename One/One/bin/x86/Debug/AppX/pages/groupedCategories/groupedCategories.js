(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;


    ui.Pages.define("/pages/groupedCategories/groupedCategories.html", {

        ready: function (element, options) {
            var selectedItems = [];

            var listView = element.querySelector("#categorylistView").winControl;
            listView.itemTemplate = document.getElementById('categoryItemTemplate');
            listView.itemDataSource = Data.categories.dataSource;
            listView.groupHeaderTemplate = document.getElementById('categoryHeaderTemplate');
            listView.groupDataSource = Data.categories.groups.dataSource;
            listView.selectionMode = WinJS.UI.SelectionMode.multi;
            //debugger;
            initAppbar();
            
            function itemInvokedHandler(eventObject) {
                eventObject.detail.itemPromise.done(function (invokedItem) {
                    var hell = 'hell';
                    debugger;
                });

            }

            function itemMultipleSelectionHandler(eventObject) {
                var appBar = document.getElementById('createAppBar').winControl;
                if (listView.selection.count() > 0) {
                    appBar.sticky = true;
                    appBar.show();
                }
                else {
                    appBar.sticky = false;
                    appBar.hide();
                }
            }

            listView.addEventListener('iteminvoked', itemInvokedHandler, false);
            listView.addEventListener('selectionchanged', itemMultipleSelectionHandler);
            readDBContent();
        }
    });

    function initAppbar() {
        var appBar = document.getElementById('createAppBar').winControl;

        document.getElementById('cmdClear').addEventListener('click', doClickClear, false);
        document.getElementById('cmdAccept').addEventListener('click', doClickAccept, false);
        document.getElementById('cmdSelectAll').addEventListener('click', doClickSelectAll, false);
    }

    function doClickClear() {
        var listView = document.getElementById("categorylistView").winControl;
        listView.selection.clear();
    }

    function doClickAccept() {
        var listView = document.getElementById("categorylistView").winControl;
        listView.selection.getItems().done(function (items) {
            var selectedItems = [];
            
            items.forEach(function (item) {
                selectedItems.push({ key: item.data.key, feedurl: item.data.feedurl, title: item.data.title, category:item.data.category, img:item.data.img });
            });
            var db = null;
            if (window.indexedDB) {
                doDBOperation(selectedItems);
                //debugger;
            }
            
            
            //debugger;
        });
        
    }

    function doDBOperation(items) {
        var request = window.indexedDB.open('AppDB', 1);
        var urlDB = null;

        request.onerror = function (event) { debugger; };
        request.onsuccess = function (event) {
            // Log whether the app tried to create the database when it already existed.
            urlDB=event.target.result;
            if (items.length > 0 && urlDB!=null) {
                var transaction = urlDB.transaction('UserSelectedSources', 'readwrite');
                transaction.oncomplete = function (idb) {
                    Data.updateItems();
                    //debugger;
                    WinJS.Navigation.navigate('/pages/groupedItems/groupedItems.html');
                };

                var store = transaction.objectStore('UserSelectedSources');
                store.clear().onsuccess = function (event) {
                    items.forEach(function (item) {
                        store.get(item.key).onsuccess = function (idb) {
                            if (idb.target.result == null) {
                                store.add(item);
                                //debugger;
                            }
                            //debugger;
                        };
                        store.get(item.key).onerror = function (idb) {
                            debugger;
                        };
                        //if (store.get(item.key) == null) {
                        //    debugger;
                        //    //store.add(item);
                        //}
                    });
                }
                
            }
        };
        request.onupgradeneeded = function (event) {
            var db = event.target.result;
            var userurlStore = db.createObjectStore('UserSelectedSources', { keyPath: 'key' });

            userurlStore.createIndex('title', 'title', { unique: false });
        };
        

    }

    function readDBContent() {
        var request = window.indexedDB.open('AppDB', 1);
        var urlDB = null;

        request.onerror = function (event) { debugger; };
        request.onsuccess = function (event) {
            // Log whether the app tried to create the database when it already existed.
            urlDB = event.target.result;
            var listView = document.getElementById("categorylistView").winControl;
            var items = [];
            if (urlDB != null) {
                var transaction = urlDB.transaction('UserSelectedSources');
                transaction.oncomplete = function (idb) {
                    listView.selection.set(items);                    
                };

                var store = transaction.objectStore('UserSelectedSources');
                store.openCursor().onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        //debugger;
                        items.push(cursor.value.key-1);
                        cursor.continue();
                    }
                    
                };

            }
        };
        request.onupgradeneeded = function (event) {
            var db = event.target.result;
            var userurlStore = db.createObjectStore('UserSelectedSources', { keyPath: 'key' });

            userurlStore.createIndex('title', 'title', { unique: false });
        };
    }

    function doClickSelectAll() {
        var listView = document.getElementById("categorylistView").winControl;
        listView.selection.selectAll();
    }
})();
