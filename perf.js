const GUID = "350839C9-8073-4D03-BF11-60CECB51C78D"

// eslint-disable-next-line no-undef
let counter = new Counter();

counter.init(GUID, String(Math.random()).substr(2, 12), window.location.pathname.toString().split('/').join(''));
counter.setAdditionalParams({
    env: 'production',
    platform: getBrowser(),
    device: getDevise()
});



function getDevise() {
    const devices = new RegExp('Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini', "i");
    if (devices.test(navigator.userAgent)) { return "Mobile" }
    else { return "PC" }
}
//console.log("device", getDevise())

let start;
let end;
document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        end = Date.now()
    }
    else { start = Date.now() }
    if (start && end) { }
  //  if (start && end) { console.log('pageLoadDOM', end - start) }
    if (start && end) { counter.send("pageLoadDOM", end - start) }
}

window.addEventListener('load', function () {
 //   console.log('firstPixel', performance.getEntriesByType('paint')[0].startTime);
    counter.send("firstPixel", performance.getEntriesByType('paint')[0].startTime)
    counter.send("loadingPage", end - start + performance.getEntriesByType('paint')[0].startTime)
 //   console.log("loadingPage", (end - start) + performance.getEntriesByType('paint')[0].startTime)
})



function getBrowser() {
    if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) !== -1) { return 'Opera'; }
    else if (navigator.userAgent.indexOf("Chrome") !== -1) { return 'Chrome'; }
    else if (navigator.userAgent.indexOf("Safari") !== -1) { return 'Safari'; }
    else if (navigator.userAgent.indexOf("Firefox") !== -1) { return 'Firefox'; }
    else if ((navigator.userAgent.indexOf("MSIE") !== -1) || (!!document.documentMode === true)) { return 'IE'; }
    else { return 'unknown'; }
}

//console.log("platform", getBrowser())

counter.send('connect', performance.timing.connectEnd - performance.timing.connectStart);
counter.send('ttfb', performance.timing.responseEnd - performance.timing.requestStart);


let timeStart = Date.now();


setTimeout(function () {
    // document.querySelector('.square').classList.add('black');

    counter.send('load', Date.now() - timeStart);
}, Math.random() * 1000 + 500);


