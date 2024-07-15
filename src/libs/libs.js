/*global chrome*/
import convert from 'xml-js';

export async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function waitUntilPageLoaded(tab) {
    let tabInfo = null;
    let count = 0;

    do {
        await timeout(1000);
        tabInfo = await chrome.tabs.get(tab.id);
        console.log('tabInfo.status', tabInfo.status);
        count++;
    } while (tabInfo && tabInfo.status !== "complete" && count < 20);

    if (tabInfo.status !== "complete") {
        await chrome.tabs.reload(tab.id);
        return await waitUntilPageLoaded(tab);
    }

    await timeout(5000);
}