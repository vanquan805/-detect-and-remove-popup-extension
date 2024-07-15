/*global chrome*/
/*global browser*/
import {timeout, waitUntilPageLoaded} from "./libs/libs";

let sf424fsfs = chrome || browser;
let sdfs5r324sdf = sf424fsfs.runtime;
let sfsw42rdfes45 = sdfs5r324sdf.onMessage;
let sdfsfsdf = sf424fsfs.storage;
let sdf8yw8er = sf424fsfs.tabs;
let sdf7sdfh = sf424fsfs.scripting;


sfsw42rdfes45.addListener(async function (request, sender, reply) {
    switch (request.action) {
        case 'remove':
            var tabs = await sdf8yw8er.query({active: true});
            var currentTab = tabs && tabs.length ? tabs[0] : null;

            var settings = await sf424fsfs.storage.local.get(['settings']);
            settings = settings && settings.settings ? settings.settings : {position: ['fixed'], minHeight: 200, autoRemove: false};

            if (currentTab) {
                await sdf7sdfh.executeScript({
                    target: {tabId: currentTab.id},
                    func: (settings) => {
                        let elements = document.querySelectorAll('*');
                        elements.forEach((element) => {
                            let style = window.getComputedStyle(element);
                            if (settings && settings.position && settings.position.indexOf(style.position) !== -1 && element.offsetHeight >= settings.minHeight) {
                                element.remove();
                            }
                        });
                    },
                    args: [settings]
                });

                let popups = await sdfsfsdf.local.get(['popups']);
                popups = popups && popups.popups ? popups.popups : {};
                popups[currentTab.id] = 0;
                await sdfsfsdf.local.set({popups});
                await sf424fsfs.action.setBadgeText({text: '0'});
            }

            break;
        case 'updatePopupCount':
            var tabs = await sdf8yw8er.query({active: true});
            var currentTab = tabs && tabs.length ? tabs[0] : null;

            if (currentTab) {
                let popups = await sdfsfsdf.local.get(['popups']);
                popups = popups && popups.popups ? popups.popups : {};
                popups[currentTab.id] = request.popupCount;
                await sdfsfsdf.local.set({popups});

                let text = request.popupCount < 99 && request.popupCount > 10 ? `${Math.floor(request.popupCount / 10)}0+` : (request.popupCount <= 10 ? `${request.popupCount}` : '99+');
                await sf424fsfs.action.setBadgeText({text: text});
            }
            break;
        case 'update':
            var tabs = await sdf8yw8er.query({active: true});
            var currentTab = tabs && tabs.length ? tabs[0] : null;

            var settings = await sf424fsfs.storage.local.get(['settings']);
            settings = settings && settings.settings ? settings.settings : {position: ['fixed'], minHeight: 200, autoRemove: false};

            if (currentTab) {

                let countPopup = (settings) => {
                    let elements = document.querySelectorAll('*');
                    let popupElements = [];
                    for (let i = 0; i < elements.length; i++) {
                        let element = elements[i];
                        let style = window.getComputedStyle(element);
                        if (settings && settings.position && settings.position.indexOf(style.position) !== -1 && element.offsetHeight >= settings.minHeight) {
                            if (!settings.autoRemove) {
                                popupElements.push(element);
                            }else{
                                element.remove();
                            }
                        }
                    }

                    return popupElements.length;
                };

                let result = await sdf7sdfh.executeScript({
                    target: {tabId: currentTab.id},
                    func: countPopup,
                    args: [settings]
                });

                if (result && result[0] && typeof result[0].result !== "undefined") {
                    let popupCount = result[0].result;
                    let popups = await sdfsfsdf.local.get(['popups']);
                    popups = popups && popups.popups ? popups.popups : {};
                    popups[currentTab.id] = popupCount;
                    await sdfsfsdf.local.set({popups});
                    let text = popupCount < 99 && popupCount > 10 ? `${Math.floor(popupCount / 10)}0+` : (popupCount <= 10 ? `${popupCount}` : '99+');
                    await sf424fsfs.action.setBadgeText({text: text});
                }
            }
            break;
    }
});

sdf8yw8er.onRemoved.addListener(async function (tabid, removed) {
    let popups = await sdfsfsdf.local.get(['popups']);
    popups = popups && popups.popups ? popups.popups : {};
    popups[tabid] = 0;
    await sdfsfsdf.local.set({popups});
});

sdf8yw8er.onActivated.addListener(async function (activeInfo) {
    let {tabId} = activeInfo;
    let popups = await sdfsfsdf.local.get(['popups']);
    popups = popups && popups.popups ? popups.popups : {};

    if (typeof popups[tabId] !== "undefined") {
        let text = popups[tabId] < 99 && popups[tabId] > 10 ? `${Math.floor(popups[tabId] / 10)}0+` : (popups[tabId] <= 10 ? `${popups[tabId]}` : '99+');
        await sf424fsfs.action.setBadgeText({text: text});
    }else{
        await sf424fsfs.action.setBadgeText({text: ''});
    }
});