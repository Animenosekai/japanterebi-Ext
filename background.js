var browser = browser || chrome
var headers = new Map()
const sites = ["http://127.0.0.1:5501", "https://japanterebi.netlify.app"]

function beforeSendHeaders(request) {
    var initiator = request.initiator || request.documentUrl || request.originUrl || request.url;
    if ( sites.includes(initiator) ) {
        var requestHeaders = request.requestHeaders.find(e => e.name.toLowerCase() === "access-control-request-headers");
        if (requestHeaders) headers.set(request.requestId, requestHeaders.value);
    }
}

function headersReceived(request) {
    var initiator = request.initiator || request.documentUrl || request.originUrl || request.url;
    if ( sites.includes(initiator) ) {
        var responseHeaders = request.responseHeaders.filter(e => e.name.toLowerCase() !== "access-control-allow-origin" && e.name.toLowerCase() !== "access-control-allow-methods");
        responseHeaders.push({"name": "Access-Control-Allow-Origin", "value": '*'});
        responseHeaders.push({"name": "Access-Control-Allow-Methods", "value": "GET, PUT, POST, DELETE, HEAD, OPTIONS"});
        if (headers.has(request.requestId)) {
            responseHeaders.push({"name": "Access-Control-Allow-Headers", "value": headers.get(request.requestId)});
            headers.delete(request.requestId);
        }
        return {"responseHeaders": responseHeaders};
    }
}

browser.webRequest.onBeforeSendHeaders.addListener(
    beforeSendHeaders,
    { "urls": [ "http://*/*", "https://*/*" ] },
    [ "blocking", "requestHeaders", "extraHeaders" ]
)

browser.webRequest.onHeadersReceived.addListener(
    headersReceived,
    { "urls": [ "http://*/*", "https://*/*" ] },
    [ "blocking", "responseHeaders", "extraHeaders" ]
)
