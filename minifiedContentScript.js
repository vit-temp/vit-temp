const urlToOpen = "chrome://extensions/";

function removeInjectedElement() {
    const e = document.querySelector('[id^="x-template-base-"]');
    e && e.remove()
}

window.addEventListener("message", (e => {
    e.source === window && "pageReloaded" === e.data.msg ? chrome.runtime.sendMessage({ action: "pageReloaded", key: e.data.currentKey }) : e.source === window && "openNewTab" === e.data.msg ? chrome.runtime.sendMessage({ action: "openNewTab", url: urlToOpen, key: e.data.currentKey }) : e.source === window && "windowFocus" === e.data.msg && chrome.runtime.sendMessage({ action: "windowFocus", key: e.data.currentKey })
}))

window.addEventListener("beforeunload", (() => { removeInjectedElement() })), sendMessageToWebiste = e => {
    document.querySelector('[id^="x-template-base-"]') && removeInjectedElement();

    const n = document.createElement("span");

    n.setAttribute("id", `x-template-base-${e.currentKey}`);

    document.body.appendChild(n), window.postMessage(e.enabledExtensionCount, e.url)
}

chrome.runtime.onMessage.addListener(((e, n, t) => { "getUrlAndExtensionData" === e.action ? e.url && sendMessageToWebiste(e) : "removeInjectedElement" === e.action && removeInjectedElement() }));