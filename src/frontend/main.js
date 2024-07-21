/*global chrome*/
/*global browser*/

import {changeOverflow} from "../libs/functions";

let BrowserAPI = chrome || browser;

async function getAllPopup() {
    let elements = document.querySelectorAll('*');
    let popupElements = [];

    let settings = await BrowserAPI.storage.local.get(['settings']);
    settings = settings && settings.settings ? settings.settings : {
        position: ['fixed'],
        minHeight: 200,
        autoRemove: false
    };

    for (let element of elements) {
        let style = window.getComputedStyle(element);

        if (settings && settings.position && settings.position.indexOf(style.position) !== -1) {
            if (settings.autoRemove && style.display !== 'none' && element.offsetHeight >= settings.minHeight) {
                element.remove();
            } else {
                popupElements.push(element);
            }
        }
    }

    changeOverflow();

    return popupElements;
}

window.addEventListener("load", async () => {
    let popup = await getAllPopup();

    await BrowserAPI.runtime.sendMessage({
        action: 'updatePopupCount',
        popupCount: popup.length
    });

    var observer = new MutationObserver(async function (mutations) {
        let filteredMutations = mutations.filter(item => {
            return (item.type === 'attributes' && item.attributeName === 'style') || (item.type === 'childList' && item.addedNodes.length > 0)
        });

        if (filteredMutations.length) {

            let elements = [];

            for (let mutation of filteredMutations) {
                if (mutation.type === 'attributes' && mutation.target) {
                    elements.push(mutation.target);
                } else if (mutation.type === 'childList' && mutation.addedNodes && mutation.addedNodes.length > 0) {
                    elements = [...elements, ...mutation.addedNodes]
                }
            }

            if (elements.length > 0) {
                let popup = await getAllPopup();

                await BrowserAPI.runtime.sendMessage({
                    action: 'updatePopupCount',
                    popupCount: popup.length
                });
            }
        }
    });

    observer.observe(document.querySelector('body'), {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['style', 'class']
    });
});