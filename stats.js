
function quantile(arr, q) {
    const sorted = arr.sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;

    if (sorted[base + 1] !== undefined) {
        return Math.floor(sorted[base] + rest * (sorted[base + 1] - sorted[base]));
    } else {
        return Math.floor(sorted[base]);
    }
};
function prepareData(result) {
    return result.data.map(item => {
        item.date = item.timestamp.split('T')[0];

        return item;
    });
}

function calcMetricByDate(data, page, name, date) {
    let sampleData = data
        .filter(item => item.page == page && item.name == name && item.date == date)
        .map(item => item.value);

    // console.log(`${date} ${name}: ` +
    //     `p25=${quantile(sampleData, 0.25)} p50=${quantile(sampleData, 0.5)} ` +
    //     `p75=${quantile(sampleData, 0.75)} p90=${quantile(sampleData, 0.95)} ` +
    //     `hits=${sampleData.length}`);
}

// получить одинаковые массивы данных
const getArray = (arr, count) => {
    let sum = 0
    arr.forEach((item, index) => {
        if (index < count) {
            sum += item.value }})
    return sum
}


// сравнить мобильный и PC
function compareMetric(data, pageName) {
    let mobile = data.filter(item => item.page == pageName && item.additional.device == "Mobile" && item.name == "loadingPage")
    let pc = data.filter(item => item.page == pageName && item.additional.device == "PC" && item.name == "loadingPage")
    
    const count = Math.min(mobile.length, pc.length)
    let sumPc = getArray(pc, count)
    let sumMobile =getArray(mobile, count)

    mobile.forEach((item) => sumMobile += item.value)
    pc.forEach((item) => sumPc += item.value)
    console.log(`средняя скорость загруки страницы ${pageName} на мобильном составляет: ${sumMobile / mobile.length}.ms  на PC: ${sumPc / pc.length}.ms`)
    if (sumPc / pc.length > sumMobile / mobile.length) {
        console.log(` в среднем страница ${pageName} на мобильном грузится быстрее на ${sumPc / pc.length - sumMobile / mobile.length}.ms чем на PC`)
    } else {
        console.log(` в среднем страница ${pageName} на PC грузится быстрее на ${sumMobile / mobile.length - sumPc / pc.length}.ms чем на мобильном`)
    }
}
// сравнить Chrome и Firefox
function compareBrowserMetric(data, page, device, param) {

    let chrome = data.filter(item => item.additional.device == device && item.additional.platform == "Chrome" && item.page == page && item.name == param)
    let firefox = data.filter(item => item.additional.device == device && item.additional.platform == "Firefox" && item.page == page && item.name == param)
    if (chrome.length == 0) {
        return console.log(`нет записей с :${device} параметром:${param}  для страницы:${page} из браузера Chrome`)
    }
    if (firefox.length == 0) {
        return console.log(`нет записей с :${device} параметром:${param}  для страницы:${page} из браузера Firefox`)
    } else {
            const count = Math.min(chrome.length, firefox.length)
            let chromeArray = getArray(chrome, count)
            let firefoxArray =getArray(firefox, count)
            console.log(`средняя продолжительность загрузки одних и тех же страниц в браузере Chrome составляет:${chromeArray/count}.ms; В Firefox:${firefoxArray/count}.ms; `)
            if(chromeArray > firefoxArray){
                console.log(`в среднем браузер Firefox загружает(отрисовывает) страницу ${page} быстрее Chrome на ${chromeArray/count - firefoxArray/count }.ms; `)
            }else{
                console.log(`в среднем браузер Chrome загружает(отрисовывает) страницу ${page} быстрее Firefox на ${firefoxArray/count - chromeArray/count}.ms; `)
            }
    }
}


// расчот процентов 
const getMyСount = (dataArray, device, platform, metricName, date, page) => {
    let arrayValues = [];
    dataArray.forEach(item => arrayValues.push(item.value))
    arrayValues.sort((a, b) => a - b)
    const portion = Math.floor(arrayValues.length / 4)
    const p = ["p25=", "p50=", "p75=", "p90="];
    let counter = 0
    let str = ` page:${page}; date:${date}; device:${device};  platform:${platform}; metricName:${metricName}; `;
    let store = 0;
    for (let i = 0; i < arrayValues.length; i++) {
        counter++
        if (counter === portion) {
            const prop = store / portion
            str += p[0] + prop + '.ms; '
            store = 0
            counter = 0
            p.shift()
        } else {
        }
    }
    console.log(str)
}

// выборка данных
const myCalcData = (data, page, metricName, device, platform, date) => {
    let resData = data.filter(item => item.page == page
        && item.name == metricName
        && item.additional.device == device
        && item.additional.platform == platform
        && date == 'all' ? 'all' : item.date == date)
    getMyСount(resData, device, platform, metricName, date, page)
}


fetch(`https://shri.yandex/hw/stat/data?counterId=350839C9-8073-4D03-BF11-60CECB51C78D`)
    .then(res => res.json())
    .then(result => {
        let data = prepareData(result);


        calcMetricByDate(data, 'send test', 'connect', '2021-07-03');
        calcMetricByDate(data, 'send test', 'ttfb', '2021-07-03');
        calcMetricByDate(data, 'send test', 'load', '2021-07-03');



        // проверить можно на любой из 4х страниц (start, setting, details, build) 
        // не работает на Firefox проверка мобильного. Отображает как Pc

        //страница старт на  PC Chrome за все время
        myCalcData(data, 'start', 'firstPixel', 'PC', 'Chrome', 'all')
        myCalcData(data, 'start', 'pageLoadDOM', 'PC', 'Chrome', 'all')
        myCalcData(data, 'start', 'loadingPage', 'PC', 'Chrome', 'all')

        //страница старт на  Mobile Chrome за все время
        myCalcData(data, 'start', 'firstPixel', 'Mobile', 'Chrome', 'all')
        myCalcData(data, 'start', 'pageLoadDOM', 'Mobile', 'Chrome', 'all')
        myCalcData(data, 'start', 'loadingPage', 'Mobile', 'Chrome', 'all')

        //страница старт на  PC Firefox 2021-07-11
        myCalcData(data, 'start', 'firstPixel', 'PC', 'Firefox', '2021-07-11')
        myCalcData(data, 'start', 'pageLoadDOM', 'PC', 'Firefox', '2021-07-11')
        myCalcData(data, 'start', 'loadingPage', 'PC', 'Firefox', '2021-07-11')

        //страница старт на  PC Chrome 2021-07-11
        myCalcData(data, 'start', 'firstPixel', 'PC', 'Chrome', '2021-07-11')
        myCalcData(data, 'start', 'pageLoadDOM', 'PC', 'Chrome', '2021-07-11')
        myCalcData(data, 'start', 'loadingPage', 'PC', 'Chrome', '2021-07-11')

        //страница старт на  Mobile Chrome 2021-07-11
        myCalcData(data, 'start', 'firstPixel', 'Mobile', 'Chrome', '2021-07-11')
        myCalcData(data, 'start', 'pageLoadDOM', 'Mobile', 'Chrome', '2021-07-11')
        myCalcData(data, 'start', 'loadingPage', 'Mobile', 'Chrome', '2021-07-11')



        // сравнение средней скорости загрузки страницы Start  Mobile vs Pc
        compareMetric(data, 'start')
        // сравнение средней скорости загрузки страницы Setting  Mobile vs Pc
        compareMetric(data, 'setting')
        // сравнение средней скорости загрузки страницы Details  Mobile vs Pc
        compareMetric(data, 'details')
        // сравнение средней скорости загрузки страницы Build  Mobile vs Pc
        compareMetric(data, 'build')


        compareBrowserMetric(data, 'start', 'PC', 'loadingPage')
        compareBrowserMetric(data, 'setting', 'PC', 'loadingPage')
        compareBrowserMetric(data, 'details', 'PC', 'loadingPage')
        compareBrowserMetric(data, 'build', 'PC', 'loadingPage')
    });