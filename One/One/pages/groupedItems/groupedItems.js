(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;

    ui.Pages.define("/pages/groupedItems/groupedItems.html", {
        // Navigates to the groupHeaderPage. Called from the groupHeaders,
        // keyboard shortcut and iteminvoked.
        navigateToGroup: function (key) {
            nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: key });
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            
            var listView = element.querySelector(".groupeditemslist").winControl;
            listView.itemDataSource = Data.items.dataSource;
            listView.groupDataSource = Data.groups.dataSource;
            listView.groupHeaderTemplate = element.querySelector(".headertemplate");
            listView.itemTemplate = element.querySelector(".itemtemplate");
            listView.oniteminvoked = this._itemInvoked.bind(this);
            initAppBar();
            // Set up a keyboard shortcut (ctrl + alt + g) to navigate to the
            // current group when not in snapped mode.
            listView.addEventListener("keydown", function (e) {
                if (appView.value !== appViewState.snapped && e.ctrlKey && e.keyCode === WinJS.Utilities.Key.g && e.altKey) {
                    var data = listView.itemDataSource.list.getAt(listView.currentItem.index);
                    this.navigateToGroup(data.group.key);
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }.bind(this), true);
            
            GetUserSelectedFeedCount();
            this._initializeLayout(listView, appView.value);
            listView.element.focus();
        },

        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            var listView = element.querySelector(".groupeditemslist").winControl;
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var handler = function (e) {
                        listView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    }
                    listView.addEventListener("contentanimating", handler, false);
                    this._initializeLayout(listView, viewState);
                }
            }
        },

        // This function updates the ListView with new layouts
        _initializeLayout: function (listView, viewState) {
            /// <param name="listView" value="WinJS.UI.ListView.prototype" />
            if (viewState === appViewState.snapped) {
                listView.itemDataSource = Data.groups.dataSource;
                listView.groupDataSource = null;
                listView.layout = new ui.ListLayout();
            } else {
                listView.itemDataSource = Data.items.dataSource;
                listView.groupDataSource = Data.groups.dataSource;
                listView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });
            }
        },

        _itemInvoked: function (args) {
            if (appView.value === appViewState.snapped) {
                // If the page is snapped, the user invoked a group.
                var group = Data.groups.getAt(args.detail.itemIndex);
                this.navigateToGroup(group.key);
            } else {
                // If the page is not snapped, the user invoked an item.
                var item = Data.items.getAt(args.detail.itemIndex);
                nav.navigate("/pages/itemDetail/itemDetail.html", { item: Data.getItemReference(item) });
            }
        }
    });
    //initialises appbar control
    function initAppBar() {
        var appBar = document.getElementById('pageAppBar').winControl;

        document.getElementById('cmdSelectSources').addEventListener('click', doClickSelectSources);
    }

    function doClickSelectSources() {
        WinJS.Navigation.navigate('/pages/groupedCategories/groupedCategories.html');
    }

    //code to check if user has not selected any feed, to display a msg on home screen
    function GetUserSelectedFeedCount() {
        var request = window.indexedDB.open('AppDB', 1);
        var urlDB = null;
        request.onerror = function (event) { debugger; };
        request.onsuccess = function (event) {
            // Log whether the app tried to create the database when it already existed.
            urlDB = event.target.result;

            if (urlDB != null) {
                var transaction = urlDB.transaction('UserSelectedSources');
                transaction.oncomplete = function (idb) {
                    
                    if (selectedSources.result == 0) {
                        $('.noContent').show();
                    }
                };

                var selectedSources = transaction.objectStore('UserSelectedSources').count();
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
