/*global chrome*/
/*global browser*/

import {changeOverflow} from "./libs/functions";

let BrowserAPI = chrome || browser;
let RuntimeAPI = BrowserAPI.runtime;
let StorageAPI = BrowserAPI.storage;
let TabsAPI = BrowserAPI.tabs;
let ScriptingAPI = BrowserAPI.scripting;

let workingTabId = null;

RuntimeAPI.onMessage.addListener(async function (request, sender, reply) {
    switch (request.action) {
        case 'remove':
            var settings = await BrowserAPI.storage.local.get(['settings']);
            settings = settings && settings.settings ? settings.settings : {position: ['fixed'], minHeight: 200, autoRemove: false};

            if (workingTabId) {
                await ScriptingAPI.executeScript({
                    target: {tabId: workingTabId},
                    func: (settings) => {
                        let elements = document.querySelectorAll('*');
                        elements.forEach((element) => {
                            let style = window.getComputedStyle(element);
                            if (settings && settings.position && settings.position.indexOf(style.position) !== -1) {
                                element.remove();
                            }
                        });
                    },
                    args: [settings]
                });

                let popups = await StorageAPI.local.get(['popups']);
                popups = popups && popups.popups ? popups.popups : {};
                popups[workingTabId] = 0;
                await StorageAPI.local.set({popups});
                await BrowserAPI.action.setBadgeText({text: '0'});

                await ScriptingAPI.executeScript({
                    target: {tabId: workingTabId},
                    func: changeOverflow,
                    args: null
                });
            }

            break;
        case 'removeShowingPopup':
            var settings = await BrowserAPI.storage.local.get(['settings']);
            settings = settings && settings.settings ? settings.settings : {position: ['fixed'], minHeight: 200, autoRemove: false};

            if (workingTabId) {

                let removeShowingPopup = (settings) => {
                    let elements = document.querySelectorAll('*');
                    let popupElements = [];
                    for (let i = 0; i < elements.length; i++) {
                        let element = elements[i];
                        let style = window.getComputedStyle(element);

                        if (settings && settings.position && settings.position.indexOf(style.position) !== -1) {
                            if (style.display !== 'none' && element.offsetHeight >= settings.minHeight) {
                                element.remove();
                            } else {
                                popupElements.push(element);
                            }
                        }
                    }

                    return popupElements.length;
                };

                let result = await ScriptingAPI.executeScript({
                    target: {tabId: workingTabId},
                    func: removeShowingPopup,
                    args: [settings]
                });

                if (result && result[0] && typeof result[0].result !== "undefined") {
                    let popupCount = result[0].result;
                    let popups = await StorageAPI.local.get(['popups']);
                    popups = popups && popups.popups ? popups.popups : {};
                    popups[workingTabId] = popupCount;
                    await StorageAPI.local.set({popups});
                    let text = popupCount < 99 && popupCount > 10 ? `${Math.floor(popupCount / 10)}0+` : (popupCount <= 10 ? `${popupCount}` : '99+');
                    await BrowserAPI.action.setBadgeText({text: text});

                    await ScriptingAPI.executeScript({
                        target: {tabId: workingTabId},
                        func: changeOverflow,
                        args: null
                    });
                }
            }
            break;
        case 'updatePopupCount':
            if (workingTabId) {
                let popups = await StorageAPI.local.get(['popups']);
                popups = popups && popups.popups ? popups.popups : {};
                popups[workingTabId] = request.popupCount;
                await StorageAPI.local.set({popups});

                let text = request.popupCount < 99 && request.popupCount > 10 ? `${Math.floor(request.popupCount / 10)}0+` : (request.popupCount <= 10 ? `${request.popupCount}` : '99+');
                await BrowserAPI.action.setBadgeText({text: text});
            }
            break;
        case 'update':
            var settings = await BrowserAPI.storage.local.get(['settings']);
            settings = settings && settings.settings ? settings.settings : {position: ['fixed'], minHeight: 200, autoRemove: false};

            if (workingTabId) {

                let countPopup = (settings) => {
                    let elements = document.querySelectorAll('*');
                    let popupElements = [];
                    for (let i = 0; i < elements.length; i++) {
                        let element = elements[i];
                        let style = window.getComputedStyle(element);

                        if (settings && settings.position && settings.position.indexOf(style.position) !== -1) {
                            if (settings.autoRemove && style.display !== 'none' && element.offsetHeight >= settings.minHeight) {
                                element.remove();
                            } else {
                                popupElements.push(element);
                            }
                        }
                    }

                    return popupElements.length;
                };

                let result = await ScriptingAPI.executeScript({
                    target: {tabId: workingTabId},
                    func: countPopup,
                    args: [settings]
                });

                if (result && result[0] && typeof result[0].result !== "undefined") {
                    let popupCount = result[0].result;
                    let popups = await StorageAPI.local.get(['popups']);
                    popups = popups && popups.popups ? popups.popups : {};
                    popups[workingTabId] = popupCount;
                    await StorageAPI.local.set({popups});
                    let text = popupCount < 99 && popupCount > 10 ? `${Math.floor(popupCount / 10)}0+` : (popupCount <= 10 ? `${popupCount}` : '99+');
                    await BrowserAPI.action.setBadgeText({text: text});

                    await ScriptingAPI.executeScript({
                        target: {tabId: workingTabId},
                        func: changeOverflow,
                        args: null
                    });
                }
            }
            break;
    }
});

TabsAPI.onRemoved.addListener(async function (tabid, removed) {
    let popups = await StorageAPI.local.get(['popups']);
    popups = popups && popups.popups ? popups.popups : {};
    popups[tabid] = 0;
    await StorageAPI.local.set({popups});
});

TabsAPI.onActivated.addListener(async function (activeInfo) {
    let {tabId} = activeInfo;
    workingTabId = tabId;

    let popups = await StorageAPI.local.get(['popups']);
    popups = popups && popups.popups ? popups.popups : {};

    if (typeof popups[tabId] !== "undefined") {
        let text = popups[tabId] < 99 && popups[tabId] > 10 ? `${Math.floor(popups[tabId] / 10)}0+` : (popups[tabId] <= 10 ? `${popups[tabId]}` : '99+');
        await BrowserAPI.action.setBadgeText({text: text});
    }else{
        await BrowserAPI.action.setBadgeText({text: ''});
    }
});