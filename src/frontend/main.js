/*global chrome*/
/*global browser*/
let sf424fsfs = chrome || browser;

async function getAllPopup() {
    let elements = document.querySelectorAll('*');
    let popupElements = [];
    let settings = await sf424fsfs.storage.local.get(['settings']);
    settings = settings && settings.settings ? settings.settings : {position: ['fixed'], minHeight: 200, autoRemove: false};

    for (let element of elements) {
        let style = window.getComputedStyle(element);
        if (settings && settings.position && settings.position.indexOf(style.position) !== -1 && element.offsetHeight >= settings.minHeight) {
            if (!settings.autoRemove) {
                popupElements.push(element);
            }else{
                element.remove();
            }
        }
    }

    return popupElements;
}

window.addEventListener("load", async () => {
    let popup = await getAllPopup();
    await sf424fsfs.runtime.sendMessage({
        action: 'updatePopupCount',
        popupCount: popup.length
    });

    let data = await sf424fsfs.storage.local.get(['popups']);
    console.log('data', data);
});


document.addEventListener("scroll", async (event) => {
    let popup = await getAllPopup();
    await sf424fsfs.runtime.sendMessage({
        action: 'updatePopupCount',
        popupCount: popup.length
    });
});

