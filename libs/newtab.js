if (navigator.onLine === false) {
    showNotification(chrome.i18n.getMessage('internetError'));
}
//i18n
document.addEventListener('DOMContentLoaded', function () {
    let objects = document.querySelectorAll('[data-i18n]');
    for (let i = 0; i < objects.length; i++) {
        let object = objects[i];
        let message = chrome.i18n.getMessage(object.getAttribute('data-i18n'));
        object.textContent = message;
    }
});
//初始化默认搜索引擎
chrome.storage.local.get('defaultSearch', function (result) {
    let searchIcon = document.getElementsByClassName('search-icon')[0];
    let searchName = document.getElementsByClassName('search-name')[0];
    let img = document.createElement('img');
    let Name = document.createElement('span');
    img.src = result.defaultSearch.icon;
    img.className = 'fadeBounce';
    img.title = result.defaultSearch.name;
    Name.innerText = result.defaultSearch.name;
    Name.className = 'fadeBounce';
    searchIcon.appendChild(img);
    searchName.appendChild(Name);
    pageKey = result.defaultSearch.key;
});
//监听搜索框，判断key
document.getElementById('search').addEventListener('input', function (event) {
    let searchInput = event.target.value;
    if (searchInput.startsWith(':') && searchInput.includes(' ')) {
        let key = searchInput.split(' ')[0].substring(1);
        event.target.value = "";
        searchInfo(key);
    }
});
//显示当前搜索引擎信息
function searchInfo(key) {
    chrome.storage.local.get(['searchList'], function (result) {
        let searchIcon = document.getElementsByClassName('search-icon')[0];
        let searchName = document.getElementsByClassName('search-name')[0];
        let img = searchIcon.getElementsByTagName('img')[0];
        let Name = searchName.getElementsByTagName('span')[0];
        const list = result.searchList || [];
        for (let searchEngine of list) {
            if (searchEngine.key === key) {
                img.remove();
                Name.remove();
                img = document.createElement('img');
                img.src = searchEngine.icon;
                img.title = searchEngine.name;
                img.className = 'fadeBounce';
                Name = document.createElement('span');
                Name.innerText = searchEngine.name;
                Name.className = 'fadeBounce';
                searchIcon.appendChild(img);
                searchName.appendChild(Name);
                pageKey = searchEngine.key;
            }
        }
    });
}
//监听搜索按钮
document.getElementsByClassName('search-btn')[0].addEventListener('click', function () {
    let searchInput = document.getElementById('search').value;
    search(pageKey, searchInput);
});
//监听搜索框回车
document.getElementById('search').addEventListener('keyup', checkForEnter);
function checkForEnter(event) {
    if (event.key === "Enter") {
        search(pageKey, event.target.value);
    }
}
//展示搜索建议
getStorageKey('search-suggest').then(value => {
    if (value) {
        let searchInputTmp = document.getElementById('search');
        let timerId2 = null;
        searchInputTmp.oninput = function (event) {
            clearTimeout(timerId2);
            timerId2 = setTimeout(async () => {
                fetchSuggestions(event.target.value).then(suggestions => {
                    showSuggestion(suggestions);
                });
            }, 500);
        }
    }
});
function showSuggestion(suggestion) {
    let suggestionList = document.getElementsByClassName('search-suggestion')[0];
    suggestionList.style.display = 'block';
    suggestionList.classList.add('show-suggestion');
    setTimeout(() => {
        suggestionList.classList.remove('show-suggestion');
    }, 1000);
    suggestionList.innerHTML = '';
    if (suggestion.length === 0) {
        suggestionList.classList.add('hide-suggestion');
        setTimeout(() => {
            suggestionList.classList.remove('hide-suggestion');
            suggestionList.style.display = 'none';
        }, 1000);
    }
    for (let i = 0; i < suggestion.length; i++) {
        let suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = suggestion[i].content;
        suggestionList.appendChild(suggestionItem);
    }
}
//监听搜索建议点击
document.getElementsByClassName('search-suggestion')[0].addEventListener('click', function (event) {
    let searchInput = document.getElementById('search');
    searchInput.value = event.target.textContent;
    search(pageKey, searchInput.value);
});
//更新时间
function updateDateTime() {
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let clock = document.getElementsByClassName('clock')[0];
    let date = document.getElementsByClassName('date')[0];
    clock.getElementsByClassName('hour')[0].textContent = hours;
    clock.getElementsByClassName('minute')[0].textContent = minutes;
    date.getElementsByClassName('month')[0].textContent = months[now.getMonth()];
    date.getElementsByClassName('day')[0].textContent = days[now.getDay()];
    date.getElementsByClassName('week')[0].textContent = now.getDate();
}
updateDateTime();
setInterval(updateDateTime, 1000);
//监听工具卡片按钮
document.getElementsByClassName('tool-item')[0].addEventListener('click', function () {
    chrome.tabs.create({ url: 'chrome://bookmarks/' });
});
document.getElementsByClassName('tool-item')[1].addEventListener('click', function () {
    chrome.tabs.create({ url: 'chrome://downloads/' });
});
document.getElementsByClassName('tool-item')[2].addEventListener('click', function () {
    chrome.tabs.create({ url: 'chrome://history/' });
});
//获得设置里的值
function getStorageKey(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function (result) {
            const value = result[key];
            if (value !== undefined) {
                resolve(value);
            } else {
                reject('No value found for key: ' + key);
            }
        });
    });
}
//天气代码与图标名的映射
const weatherIcons = {
    '100': 'icon-sunny',
    '150': 'icon-sunny',
    '101': 'icon-cloudy',
    '151': 'icon-cloudy',
    '102': 'icon-cloudy',
    '152': 'icon-cloudy',
    '103': 'icon-cloudy',
    '153': 'icon-cloudy',
    '104': 'icon-overcast',
    '300': 'icon-shower',
    '350': 'icon-shower',
    '301': 'icon-shower',
    '351': 'icon-shower',
    '302': 'icon-thunderstorm',
    '303': 'icon-thunderstorm',
    '304': 'icon-thunderstorm',
    '305': 'icon-light_rain',
    '309': 'icon-light_rain',
    '399': 'icon-light_rain',
    '313': 'icon-light_rain',
    '306': 'icon-moderate_rain',
    '314': 'icon-moderate_rain',
    '307': 'icon-heavy_rain',
    '315': 'icon-heavy_rain',
    '308': 'icon-storm_rain',
    '310': 'icon-storm_rain',
    '316': 'icon-storm_rain',
    '311': 'icon-storm_rain',
    '317': 'icon-storm_rain',
    '312': 'icon-storm_rain',
    '318': 'icon-storm_rain',
    '400': 'icon-snow',
    '401': 'icon-snow',
    '408': 'icon-snow',
    '407': 'icon-snow',
    '457': 'icon-snow',
    '499': 'icon-snow',
    '402': 'icon-heavy_snow',
    '409': 'icon-heavy_snow',
    '403': 'icon-heavy_snow',
    '410': 'icon-heavy_snow',
    '404': 'icon-sleet',
    '405': 'icon-sleet',
    '406': 'icon-sleet',
    '456': 'icon-sleet',
    '500': 'icon-fog',
    '501': 'icon-fog',
    '509': 'icon-fog',
    '510': 'icon-fog',
    '514': 'icon-fog',
    '515': 'icon-fog',
    '502': 'icon-haze',
    '511': 'icon-haze',
    '512': 'icon-haze',
    '513': 'icon-haze',
    '503': 'icon-dust',
    '504': 'icon-dust',
    '507': 'icon-dust',
    '508': 'icon-dust',
    '900': 'icon-hot',
    '901': 'icon-cold',
    '999': 'icon-cloudy',
};
const weatherBackgrounds = {
    '150': 'icon-sunny',
    '101': 'icon-cloudy',
    '151': 'icon-cloudy',
    '102': 'icon-cloudy',
    '152': 'icon-cloudy',
    '103': 'icon-cloudy',
    '100': 'icon-sunny',
    '153': 'icon-cloudy',
    '104': 'icon-overcast',
    '300': 'icon-moderate-rain',
    '350': 'icon-moderate-rain',
    '301': 'icon-moderate-rain',
    '351': 'icon-moderate-rain',
    '302': 'icon-thunderstorm',
    '303': 'icon-thunderstorm',
    '304': 'icon-thunderstorm',
    '305': 'icon-light-rain',
    '309': 'icon-light-rain',
    '399': 'icon-light-rain',
    '313': 'icon-light-rain',
    '306': 'icon-moderate-rain',
    '314': 'icon-moderate-rain',
    '307': 'icon-heavy-rain',
    '315': 'icon-heavy-rain',
    '308': 'icon-heavy-rain',
    '310': 'icon-heavy-rain',
    '316': 'icon-heavy-rain',
    '311': 'icon-heavy-rain',
    '317': 'icon_heavy-rain',
    '312': 'icon_heavy-rain',
    '318': 'icon_heavy-rain',
    '400': 'icon-snow',
    '401': 'icon-snow',
    '408': 'icon-snow',
    '407': 'icon-snow',
    '457': 'icon-snow',
    '499': 'icon-snow',
    '402': 'icon_snow',
    '409': 'icon_snow',
    '403': 'icon-snow',
    '410': 'icon-snow',
    '404': 'icon-sleet',
    '405': 'icon-sleet',
    '406': 'icon-sleet',
    '456': 'icon-sleet',
    '500': 'icon-fog',
    '501': 'icon-fog',
    '509': 'icon-fog',
    '510': 'icon-fog',
    '514': 'icon-fog',
    '515': 'icon-fog',
    '502': 'icon-fog',
    '511': 'icon-fog',
    '512': 'icon-fog',
    '513': 'icon-fog',
    '503': 'icon-dust',
    '504': 'icon-dust',
    '507': 'icon-dust',
    '508': 'icon-dust',
    '900': 'icon-temp',
    '901': 'icon-temp',
    '999': 'icon-cloudy',
};
//根据天气代码返回图标
function getWeatherIcon(weatherCode) {
    return weatherIcons[weatherCode] || 'icon-cloudy';
}
function getWeatherBackground(weatherCode) {
    return weatherBackgrounds[weatherCode] || 'icon-cloudy';
}
//显示用户名
getStorageKey('user-name').then(value => {
    document.getElementsByClassName('user-name')[0].textContent = value;
});
//问候语
async function greet(time) {
    const response = await fetch('../assets/greet.json');
    const sentences = await response.json();
    const timeSentences = sentences[time];
    const randomSentence = timeSentences[Math.floor(Math.random() * timeSentences.length)];
    return randomSentence;
}
function greetText() {
    let now = new Date();
    let hours = now.getHours();
    let dialogue = document.getElementsByClassName('greet-text')[0];
    if (hours >= 6 && hours < 9) {
        greet('morning').then(value => {
            dialogue.innerText = value;
        });
    } else if (hours >= 11 && hours < 14) {
        greet('noon').then(value => {
            dialogue.innerText = value;
        });
    } else if (hours >= 17 && hours < 20) {
        greet('dust').then(value => {
            dialogue.innerText = value;
        });
    } else if (hours >= 20 || hours < 6) {
        greet('night').then(value => {
            dialogue.innerText = value;
        });
    }
}
chrome.storage.local.get(['greetText'], function (result) {
    if (result['greetText'] === true) {
        greetText();
    }
});
//根据不同时间段显示svg
function timeImg() {
    let now = new Date();
    let hours = now.getHours();
    let img = document.getElementsByClassName('time-img')[0];
    if (hours >= 6 && hours < 9) {
        img.src = '/assets/images/icons/time/sun_rise.svg';
    } else if (hours >= 9 && hours < 15) {
        img.src = '/assets/images/icons/time/sun.svg';
    } else if (hours >= 15 && hours < 18) {
        img.src = '/assets/images/icons/time/sun_down.svg';
    } else {
        img.src = '/assets/images/icons/time/moon.svg';
    }
}
timeImg();
//获得定位
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successGetPosition);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}
getLocation();
//若成功得到定位
function successGetPosition(position) {
    cacheLocationCity(position);
    cacheNowWeatherData(position);
    cacheWeatherData(position);
    showPosition();
    showWeather();
    showWeatherCard();
    showWeatherSmallCard();
}
//监听刷新天气按钮
document.getElementsByClassName('refresh-weather')[0].addEventListener('click', function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(refreshGetPosition);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
});
//刷新天气
function refreshGetPosition(position) {
    getNowWeatherData(position);
    getWeatherData(position);
    showWeather();
    showWeatherCard();
    showWeatherSmallCard();
}
//显示简单天气数据
function showWeather() {
    chrome.storage.local.get(['nowWeatherData'], function (result) {
        if (result.nowWeatherData) {
            const data = result.nowWeatherData;
            let weather = document.getElementsByClassName('weather')[0];
            let temp = weather.getElementsByClassName('weather-temp')[0];
            let icon = weather.getElementsByClassName('weather-icon')[0].getElementsByTagName('i')[0];
            let main = data.now;
            icon.className = `iconfont ${getWeatherIcon(main.icon)}`;
            temp.textContent = main.temp + '°C';
        } else {
            console.error('No weather data available in chrome.storage');
        }
    });
}
//显示城市
function showPosition() {
    chrome.storage.local.get(['locationCity'], function (result) {
        if (result.locationCity) {
            const data = result.locationCity;
            let cityText = document.getElementsByClassName('weather-city');
            for (let i = 0; i < cityText.length; i++) {
                cityText[i].textContent = data.location[0].name;
            }
        } else {
            console.error('No weather data available in chrome.storage');
        }
    });
}
//显示实时天气卡片
function showWeatherSmallCard() {
    let weatherCard = document.getElementsByClassName('weather-card')[0];
    let weatherCardContent = weatherCard.getElementsByClassName('weather-info')[0];
    let weatherCardItem = weatherCardContent.getElementsByClassName('weather-item');
    let weatherImg = weatherCard.getElementsByClassName('weather-background')[0];
    let weatherCardItemTemp = weatherCard.getElementsByClassName('weather-temp')[0];
    let weatherCardItemText = weatherCard.getElementsByClassName('weather-text')[0];
    let weatherCardItemTime = weatherCardItem[2].getElementsByClassName('weather-value')[0];
    let weatherCardItemWind = weatherCardItem[0].getElementsByClassName('weather-value')[0];
    let weatherCardItemHumidity = weatherCardItem[1].getElementsByClassName('weather-value')[0];
    chrome.storage.local.get(['nowWeatherData'], function (result) {
        if (result.nowWeatherData) {
            let data = result.nowWeatherData;
            let main = data.now;
            let localDate = new Date(main.obsTime);
            let utcDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000));
            let hours = utcDate.getUTCHours();
            let minutes = utcDate.getUTCMinutes();
            weatherImg.src = `/assets/images/icons/weather/${getWeatherBackground(main.icon)}.svg`;
            weatherCardItemTemp.textContent = main.temp + '°C';
            weatherCardItemText.textContent = main.text;
            weatherCardItemTime.textContent = hours + ':' + minutes;
            weatherCardItemWind.textContent = main.windSpeed + ' km/h';
            weatherCardItemHumidity.textContent = main.humidity + '%';
        } else {
            console.error('No weather data available in chrome.storage');
        }
    });
}
//显示近七日天气
function showWeatherCard() {
    let weatherCard = document.getElementsByClassName('all-weather-card')[0];
    let weatherCardContent = weatherCard.getElementsByClassName('weather-detail');
    chrome.storage.local.get(['weatherData'], function (result) {
        if (result.weatherData) {
            const data = result.weatherData;
            const daily = data.daily;
            weatherCardContent[0].innerHTML = '';
            weatherCardContent[1].innerHTML = '';
            let labels = [];
            let temperatures = [];
            for (let i = 0; i < 7; i++) {
                let dateStr = daily[i].fxDate;
                let month = parseInt(dateStr.substring(5, 7), 10);
                let day = parseInt(dateStr.substring(8, 10), 10);

                let weatherCardItem = document.createElement('div');
                weatherCardItem.className = 'days-weather-item';
                let weatherCardItemDate = document.createElement('div');
                weatherCardItemDate.className = 'days-weather-date';
                let weatherCardItemIcon = document.createElement('div');
                weatherCardItemIcon.className = 'days-weather-icon';
                let weatherCardItemText = document.createElement('div');
                weatherCardItemText.className = 'days-weather-text';
                let weatherCardIconI = document.createElement('i');
                weatherCardIconI.className = 'iconfont icon-sunny';

                weatherCardItemDate.textContent = `${month}.${day}`;
                weatherCardIconI.className = `iconfont ${getWeatherIcon(daily[i].iconDay)}`;
                weatherCardItemText.textContent = daily[i].textDay;

                weatherCardContent[0].appendChild(weatherCardItemDate);
                weatherCardItemIcon.appendChild(weatherCardIconI);
                weatherCardItem.appendChild(weatherCardItemIcon);
                weatherCardItem.appendChild(weatherCardItemText);
                weatherCardContent[1].appendChild(weatherCardItem);

                labels.push(`${month}-${day}`);
                temperatures.push(daily[i].tempMax);
            }
            let maxTemp = Math.max(...temperatures);
            let minTemp = Math.min(...temperatures);
            drawWeatherChart('temperatureChart', labels, temperatures, minTemp, maxTemp);
        } else {
            console.error('No weather data available in chrome.storage');
        }
    });
}
//绘制天气折线图
function drawWeatherChart(id, labels, temperatures, minTemp, maxTemp) {
    var ctx = document.getElementById(id).getContext('2d');
    let chartInstance = Chart.getChart(id);
    let myPlugin = {
        id: 'myPlugin',
        afterDatasetsDraw: function (chart, args, options) {
            const { ctx, data } = chart;
            data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                if (!meta.hidden) {
                    meta.data.forEach((element, index) => {
                        ctx.fillStyle = '#646c93';
                        const fontSize = 16;
                        const fontStyle = 'normal';
                        ctx.font = Chart.helpers.fontString(fontSize, fontStyle);

                        const dataString = dataset.data[index].toString() + '°';
                        const { x, y } = element.getProps(['x', 'y'], true);
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        ctx.fillText(dataString, x, y + 30);
                    });
                }
            });
        }
    };
    Chart.register(myPlugin);
    if (chartInstance) {
        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = temperatures;
        chartInstance.update();
    } else {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperature',
                    data: temperatures,
                    borderColor: 'rgba(143 ,165 ,223,0.7)',
                    borderWidth: 5,
                    tension: 0.5,
                    pointRadius: 0.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                layout: {
                    padding: {
                        left: 14,
                        right: 14,
                        top: 5,
                        bottom: 14
                    }
                },
                scales: {
                    x: {
                        display: false,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: false,
                        grid: {
                            display: false
                        },
                        suggestedMin: minTemp - 2,
                        suggestedMax: maxTemp + 2,

                    },
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    },
                }
            }
        });
    }
}
//刷新实时天气数据
function getNowWeatherData(position) {
    let lat = position.coords.latitude.toFixed(2);
    let lon = position.coords.longitude.toFixed(2);
    let now = new Date().getTime();
    getStorageKey('weather-key').then(key => {
        let url = `https://devapi.qweather.com/v7/weather/now?location=${lon},${lat}&key=${key}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                chrome.storage.local.set({
                    'nowWeatherData': data,
                    'nowWeatherDataSetupTime': now
                });
            })
            .catch(error => console.error('Failed to fetch weather data:', error));
    }).catch(error => {
        console.error('Failed to retrieve API key:', error);
    });
}
//刷新近7日天气数据
function getWeatherData(position) {
    let lat = position.coords.latitude.toFixed(2);
    let lon = position.coords.longitude.toFixed(2);
    let now = new Date().getTime();
    getStorageKey('weather-key').then(key => {
        let url = `https://devapi.qweather.com/v7/weather/7d?location=${lon},${lat}&key=${key}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                chrome.storage.local.set({
                    'weatherData': data,
                    'weatherDataSetupTime': now
                });
            })
            .catch(error => console.error('Failed to fetch weather data:', error));
    }).catch(error => {
        console.error('Failed to retrieve API key:', error);
    });
}
//刷新定位城市
function getLocationCity(position) {
    let lat = position.coords.latitude.toFixed(2);
    let lon = position.coords.longitude.toFixed(2);
    let now = new Date().getTime();
    getStorageKey('weather-key').then(key => {
        let url = `https://geoapi.qweather.com/v2/city/lookup?location=${lon},${lat}&key=${key}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                chrome.storage.local.set({
                    'locationCity': data,
                    'locationCitySetupTime': now
                });
            })
            .catch(error => console.error('Failed to fetch weather data:', error));
    }).catch(error => {
        console.error('Failed to retrieve API key:', error);
    });
}
//缓存实时天气
function cacheNowWeatherData(position) {
    chrome.storage.local.get(['nowWeatherData', 'nowWeatherDataSetupTime'], function (result) {
        let now = new Date().getTime();
        let cacheTime = 900000;
        if (result.nowWeatherDataSetupTime && now - result.nowWeatherDataSetupTime < cacheTime) {
            console.log('Cache hit');
        } else {
            getNowWeatherData(position);
        }
    });
}
//缓存近7日天气
function cacheWeatherData(position) {
    chrome.storage.local.get(['weatherData', 'weatherDataSetupTime'], function (result) {
        let now = new Date().getTime();
        let cacheTime = 10800000;
        if (result.weatherDataSetupTime && now - result.weatherDataSetupTime < cacheTime) {
            console.log('Cache hit');
        } else {
            getWeatherData(position);
        }
    });
}
//缓存定位城市
function cacheLocationCity(position) {
    chrome.storage.local.get(['locationCity', 'locationCitySetupTime'], function (result) {
        let now = new Date().getTime();
        let cacheTime = 900000;
        if (result.locationCitySetupTime && now - result.locationCitySetupTime < cacheTime) {
            console.log('Cache hit');
        } else {
            getLocationCity(position);
        }
    });
}
//展示天气卡片
document.getElementsByClassName('weather')[0].addEventListener('click', function () {
    let weatherCard = document.getElementsByClassName('middle-card')[0];
    weatherCard.style.display = 'block';
    weatherCard.classList.add('show-card');
    weatherCard.classList.remove('hide-card');
});
//关闭天气卡片
document.getElementsByClassName('close-weather')[0].addEventListener('click', function () {
    let weatherCard = document.getElementsByClassName('middle-card')[0];
    let weatherCardBtn = document.getElementsByClassName('weather-btn')[0].getElementsByClassName('card-button');
    let weatherSmallCard = document.getElementsByClassName('weather-card')[0];
    let weatherBigCard = document.getElementsByClassName('all-weather-card')[0];
    weatherCard.classList.remove('show-card');
    weatherCard.classList.remove('expand-width');
    weatherCard.classList.add('hide-card');
    setTimeout(() => {
        weatherCard.style.display = 'none';
        weatherBigCard.classList.remove('show-card');
        weatherBigCard.style.display = 'none';
        weatherSmallCard.classList.remove('hide-card');
        weatherSmallCard.style.display = 'block';
        weatherCardBtn[0].style.display = 'block';
        weatherCardBtn[0].classList.remove('btn-out')
        weatherCardBtn[1].style.display = 'none';
        weatherCardBtn[2].style.display = 'none';
        weatherCard.style.maxWidth = '50%';
        weatherSmallCard.getElementsByTagName('img')[0].style.display = 'block';
    }, 1000);
});
//展示近7日天气
document.getElementsByClassName('show-weather')[0].addEventListener('click', function () {
    let weatherCard = document.getElementsByClassName('middle-card')[0]
    let weatherBigCard = document.getElementsByClassName('all-weather-card')[0];
    let weatherSmallCard = document.getElementsByClassName('weather-card')[0];
    let weatherCardBtn = document.getElementsByClassName('weather-btn')[0].getElementsByClassName('card-button');
    weatherCardBtn[0].classList.add('btn-out');
    weatherSmallCard.classList.add('hide-card');
    weatherBigCard.classList.add('show-card');
    weatherCard.classList.add('expand-width');
    setTimeout(() => {
        weatherCardBtn[0].style.display = 'none';
        weatherCardBtn[1].style.display = 'block';
        weatherCardBtn[2].style.display = 'block';
        weatherCard.style.maxWidth = '100%';
        weatherBigCard.style.display = 'block';
        weatherSmallCard.style.display = 'none';
        weatherSmallCard.getElementsByTagName('img')[0].style.display = 'none';
    }, 1000);
});
//是否显示天气卡片
chrome.storage.local.get(['weather-card'], function (result) {
    let weatherCard = document.getElementsByClassName('middle-card')[0];
    if (result['weather-card'] === true) {
        weatherCard.style.display = 'block';
        weatherCard.classList.add('show-card');
    } else {
        weatherCard.style.display = 'none';
    }
});
//获得一言信息
function getHitokoto() {
    let hitokotoText = document.getElementsByClassName('hitokoto-text')[0];
    let hitokotoFrom = document.getElementsByClassName('hitokoto-from')[0];
    fetch('https://v1.hitokoto.cn')
        .then(response => response.json())
        .then(data => {
            hitokotoText.innerText = data.hitokoto;
            if (data.from_who != null) {
                hitokotoFrom.innerText = `—— ${data.from_who}`;
            }
        }).catch(() => {
            showNotification(chrome.i18n.getMessage('hitokotoError'));
            hitokotoText.innerText = 'It\'s good to see you again.';
        }
        )
}
//是否显示一言卡片
chrome.storage.local.get(['hitokoto-card'], function (result) {
    let weatherCard = document.getElementsByClassName('hitokoto-card')[0];
    if (result['hitokoto-card'] === true) {
        getHitokoto();
        weatherCard.style.display = 'block';
        weatherCard.classList.add('show-card');
    } else {
        weatherCard.style.display = 'none';
    }
});
//使焦点聚焦在搜索框
document.getElementById("search").focus();
//深色模式
const rootElement = document.documentElement;
const darkModeStorageKey = 'user-color-scheme';
const darkModeMediaQueryKey = '--color-mode';
const rootElementDarkModeAttributeName = 'data-user-color-scheme';
const darkModeToggleButtonElement = document.getElementsByClassName('dark-btn')[0];

const changeImg = (mode) => {
    darkBtn = document.getElementsByClassName('dark-btn')[0];
    darkImg = darkBtn.getElementsByClassName('dark-img')[0];
    lightImg = darkBtn.getElementsByClassName('light-img')[0];
    if (mode === 'dark') {
        darkImg.style.display = 'block';
        lightImg.style.display = 'none';
    } else {
        lightImg.style.display = 'block';
        darkImg.style.display = 'none';
    }
}
const setLS = (k, v) => {
    try {
        localStorage.setItem(k, v);
    } catch (e) { }
}
const removeLS = (k) => {
    try {
        localStorage.removeItem(k);
    } catch (e) { }
}
const getLS = (k) => {
    try {
        return localStorage.getItem(k);
    } catch (e) {
        return null
    }
}
const getModeFromCSSMediaQuery = () => {
    const res = getComputedStyle(rootElement).getPropertyValue(darkModeMediaQueryKey);
    return res.replace(/\'/g, '').trim();
}
const resetRootDarkModeAttributeAndLS = () => {
    rootElement.removeAttribute(rootElementDarkModeAttributeName);
    removeLS(darkModeStorageKey);
}
const validColorModeKeys = {
    'dark': true,
    'light': true
}
const applyCustomDarkModeSettings = (mode) => {
    const currentSetting = mode || getLS(darkModeStorageKey);
    if (currentSetting === getModeFromCSSMediaQuery()) {
        changeImg(currentSetting);
        resetRootDarkModeAttributeAndLS();
    } else if (validColorModeKeys[currentSetting]) {
        changeImg(currentSetting);
        rootElement.setAttribute(rootElementDarkModeAttributeName, currentSetting);
    } else {
        changeImg(getModeFromCSSMediaQuery());
        resetRootDarkModeAttributeAndLS();
    }
}
const invertDarkModeObj = {
    'dark': 'light',
    'light': 'dark'
}
const toggleCustomDarkMode = () => {
    let currentSetting = getLS(darkModeStorageKey);
    if (validColorModeKeys[currentSetting]) {
        currentSetting = invertDarkModeObj[currentSetting];
    } else if (currentSetting === null) {
        currentSetting = invertDarkModeObj[getModeFromCSSMediaQuery()];
    } else {
        return;
    }
    setLS(darkModeStorageKey, currentSetting);
    return currentSetting;
}
applyCustomDarkModeSettings();
darkModeToggleButtonElement.addEventListener('click', () => {
    applyCustomDarkModeSettings(toggleCustomDarkMode());
})
//显示通知
function showNotification(message) {
    let toast = document.querySelector('.notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'notification';
        document.body.appendChild(toast);
    }
    toast.classList.add('show-notification');
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(function () {
        toast.classList.remove('show-notification');
        toast.classList.add('hide-notification');
        setTimeout(function () {
            toast.classList.remove('hide-notification');
            toast.style.display = 'none';
        }, 1000);
    }, 2000);
}
//跳转到设置页面
window.onload = function () {
    if (window.location.hash) {
        var hash = window.location.hash.substring(1);
        if (hash === 'setting') {
            let settingPage = document.getElementsByClassName('column')[0];
            let leftColumn = document.getElementsByClassName('column')[1];
            settingPage.classList.add('setting-card-in');
            leftColumn.classList.add('setting-card-out');
            setTimeout(() => {
                leftColumn.style.display = 'none';
                settingPage.style.display = 'block';
            }, 1000);
        }
    }
}
//设置按钮
document.getElementsByClassName('setting-btn')[0].addEventListener('click', function () {
    let settingPage = document.getElementsByClassName('column')[0];
    let leftColumn = document.getElementsByClassName('column')[1];
    settingPage.classList.remove('setting-card-in');
    leftColumn.classList.remove('setting-card-out');
    settingPage.classList.remove('setting-card-out');
    leftColumn.classList.remove('setting-card-in');
    settingPage.classList.add('setting-card-in');
    leftColumn.classList.add('setting-card-out');
    setTimeout(() => {
        leftColumn.style.display = 'none';
        settingPage.style.display = 'block';
    }, 1000);
});
//关闭设置按钮
document.getElementsByClassName('setting-close-btn')[0].addEventListener('click', function () {
    let settingPage = document.getElementsByClassName('column')[0];
    let leftColumn = document.getElementsByClassName('column')[1];
    settingPage.classList.remove('setting-card-in');
    leftColumn.classList.remove('setting-card-out');
    settingPage.classList.remove('setting-card-out');
    leftColumn.classList.remove('setting-card-in');
    settingPage.classList.add('setting-card-out');
    leftColumn.classList.add('setting-card-in');
    setTimeout(() => {
        leftColumn.style.display = 'block';
        settingPage.style.display = 'none';
    }, 1000);
});
//表单窗口
function form(formId, searchEngine) {
    let windowContainer = document.createElement('div');
    windowContainer.className = "window-container show-card";

    let formContainer = document.createElement('div');
    formContainer.className = "form-container";

    let formElement = document.createElement('form');
    formElement.id = formId;

    let closeButton = document.createElement('div');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '<i class="iconfont icon-close"></i>';
    closeButton.onclick = function () {
        windowContainer.classList.remove('show-card');
        windowContainer.classList.add('hide-card');
        setTimeout(() => {
            windowContainer.remove();
        }, 1000);
    }
    formContainer.appendChild(closeButton);

    let tip = document.createElement('pre');
    tip.className = 'tip';
    tip.innerText = chrome.i18n.getMessage('formTip');
    formElement.appendChild(tip);

    let inputNameDiv = document.createElement('div');
    inputNameDiv.className = 'inputGroup';
    inputNameDiv.innerHTML = `<input type="text" class="input-name" required="" value="${searchEngine.name}"><label>Name</label>`;
    formElement.appendChild(inputNameDiv);

    let inputIconDiv = document.createElement('div');
    inputIconDiv.className = 'inputGroup';
    inputIconDiv.innerHTML = `<input type="text" class="input-icon" required="" value="${searchEngine.icon}"><label>Icon</label>`;
    formElement.appendChild(inputIconDiv);

    let inputUrlDiv = document.createElement('div');
    inputUrlDiv.className = 'inputGroup';
    inputUrlDiv.innerHTML = `<input type="text" class="input-url" required="" value="${searchEngine.url}"><label>Url</label>`;
    formElement.appendChild(inputUrlDiv);

    let inputKeyDiv = document.createElement('div');
    inputKeyDiv.className = 'inputGroup';
    inputKeyDiv.innerHTML = `<input type="text" class="input-key" required="" value="${searchEngine.key}"><label>Key</label>`;
    formElement.appendChild(inputKeyDiv);

    let button = document.createElement('div');
    button.classList.add('setting-button');
    button.textContent = chrome.i18n.getMessage('submit');
    button.onclick = function () {
        if (formId === 'new') {
            submitInfo(formId, 'add');
        } else {
            submitInfo(formId, 'edit');
        }
        windowContainer.classList.remove('show-card');
        windowContainer.classList.add('hide-card');
        setTimeout(() => {
            windowContainer.remove();
        }, 1000);
    };

    formElement.appendChild(button);
    formContainer.appendChild(formElement);
    windowContainer.appendChild(formContainer);
    document.body.appendChild(windowContainer);
}
//添加搜索引擎表单
document.getElementsByClassName('add-search')[0].onclick = function () { form('new', { name: '', icon: '', url: '', key: '' }); };
//显示搜索引擎列表
document.addEventListener('DOMContentLoaded', loadSearchList);
function loadSearchList() {
    let defaultSearchInfo;
    chrome.storage.local.get(['defaultSearch'], function (result) {
        defaultSearchInfo = result.defaultSearch;
    })
    chrome.storage.local.get(['searchList'], function (result) {
        const list = result.searchList || [];
        let listDescElement = document.querySelector('.search-desc');
        listDescElement.innerHTML = chrome.i18n.getMessage('searchList1') + list.length + chrome.i18n.getMessage('searchList2');
        let listElement = document.querySelector('.search-engines-list');
        listElement.innerHTML = '';
        list.forEach((searchEngine, index) => {

            let newElement = document.createElement('div');
            newElement.className = 'ul'

            let infoElement = document.createElement('div');
            infoElement.className = 'engine-info';

            let imgElement = document.createElement('img');
            imgElement.src = searchEngine.icon;
            imgElement.title = searchEngine.name;
            infoElement.appendChild(imgElement);

            let Name = document.createElement('div');
            Name.innerText = searchEngine.name;
            Name.className = 'engine-name';
            infoElement.appendChild(Name);

            let operateElement = document.createElement('div');
            operateElement.className = 'engine-operate';

            let radioButton = document.createElement('input');
            radioButton.type = 'radio';
            radioButton.name = 'defaultSearch';
            radioButton.value = searchEngine.key;
            if (searchEngine.key === defaultSearchInfo.key) {
                radioButton.checked = true;
            }
            operateElement.appendChild(radioButton);
            radioButton.addEventListener('change', function () {
                if (radioButton.checked) {
                    chrome.storage.local.set({ 'defaultSearch': searchEngine });
                }
            });

            let editButton = document.createElement('div');
            editButton.classList.add('setting-button');
            editButton.textContent = chrome.i18n.getMessage('edit');
            editButton.onclick = function () { form(index, searchEngine); };
            operateElement.appendChild(editButton);

            let deleteButton = document.createElement('div');
            deleteButton.classList.add('setting-button');
            deleteButton.textContent = chrome.i18n.getMessage('delete');
            deleteButton.onclick = function () { removeSearch(index); };
            operateElement.appendChild(deleteButton);

            newElement.appendChild(infoElement);
            newElement.appendChild(operateElement);
            listElement.appendChild(newElement);
        });

    });
}
//删除搜索引擎
function removeSearch(index) {
    chrome.storage.local.get(['searchList'], function (result) {
        const list = result.searchList || [];
        list.splice(index, 1);
        chrome.storage.local.set({ 'searchList': list }, function () {
            loadSearchList();
            showNotification(chrome.i18n.getMessage('deleteSuccess'));
        });
    });
}
//添加搜索引擎
function addSearch(searchEngine) {
    chrome.storage.local.get(['searchList'], function (result) {
        const list = result.searchList || [];
        list.push(searchEngine);
        chrome.storage.local.set({ 'searchList': list }, function () {
            loadSearchList();
            showNotification(chrome.i18n.getMessage('addSuccess'));
        });
    });
}
//编辑搜索引擎信息提交
function editSearch(searchEngine, id) {
    chrome.storage.local.get(['searchList'], function (result) {
        const list = result.searchList || [];
        list[id] = searchEngine;
        chrome.storage.local.set({ 'searchList': list }, function () {
            loadSearchList();
            showNotification(chrome.i18n.getMessage('editSuccess'));
        });
    });
}
//提交搜索引擎表单
function submitInfo(formId, choose) {
    let flag = 0;
    let form = document.getElementById(formId);
    let searchName = form.querySelector('input[class="input-name"]').value;
    let searchIcon = form.querySelector('input[class="input-icon"]').value;
    let searchUrl = form.querySelector('input[class="input-url"]').value;
    let searchKey = form.querySelector('input[class="input-key"]').value;
    if (searchIcon === '') {
        searchIcon = (new URL(searchUrl)).protocol + '//' + (new URL(searchUrl)).hostname + '/favicon.ico';
    }
    chrome.storage.local.get('searchList', function (result) {
        const list = result.searchList || [];
        for (let searchEngine of list) {
            if (searchEngine.key === searchKey) {
                showNotification(chrome.i18n.getMessage('keyExist'));
                flag = 1;
            }
        }
        if (flag === 1) {
            return;
        }
        if (choose === 'add') {
            addSearch({ name: searchName, icon: searchIcon, url: searchUrl, key: searchKey });
        } else if (choose === 'edit') {
            editSearch({ name: searchName, icon: searchIcon, url: searchUrl, key: searchKey }, formId);
        }
    });
}
//监听输入框
listenInput('weather-key-input', 'weather-key');
listenInput('user-name-input', 'user-name');
//监听输入框
function listenInput(inputName, keyName) {
    let input = document.getElementById(inputName);
    input.addEventListener('blur', function (event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            chrome.storage.local.set({ [keyName]: event.target.value });
        }
    }, true);
}
//监听复选框
listenCheckbox('weather-card-checkbox', 'weather-card');
listenCheckbox('hitokoto-card-checkbox', 'hitokoto-card');
listenCheckbox('search-suggest-checkbox', 'search-suggest');
listenCheckbox('greetText-checkbox', 'greetText');
function listenCheckbox(checkboxName, keyName) {
    let checkbox = document.getElementById(checkboxName);
    checkbox.addEventListener('change', function (event) {
        if (event.target.tagName === 'INPUT') {
            chrome.storage.local.set({ [keyName]: event.target.checked });
        }
    }, true);
}
//获取存储的值
getStorage('weather-key', 'weather-key-input');
getStorage('user-name', 'user-name-input');
getStorage('weather-card', 'weather-card-checkbox');
getStorage('hitokoto-card', 'hitokoto-card-checkbox');
getStorage('search-suggest', 'search-suggest-checkbox');
//获取存储的值
function getStorage(key, inputName) {
    chrome.storage.local.get([key], function (result) {
        let value = result[key];
        if (value !== undefined) {
            let input = document.getElementById(inputName);
            if (input.tagName === 'INPUT' && input.className === 'card-input') {
                input.value = value;
            } else if (input.tagName === 'SELECT') {
                input.value = value;
            } else if (input.tagName === 'INPUT' && input.type === 'checkbox') {
                input.checked = value;
            } else if (input.tagName === 'INPUT' && input.type === 'radio') {
                input.checked = value;
            }
        }
    });
}
//展开搜索引擎列表
document.getElementsByClassName('show-list')[0].addEventListener('click', function () {
    let list = document.getElementsByClassName('search-engines-list')[0];
    let show = document.getElementsByClassName('show-list')[0];
    if (list.style.display === 'none') {
        show.textContent = chrome.i18n.getMessage('fold');
        list.classList.remove('fold');
        list.classList.add('unfold');
        list.style.display = 'block';
    } else {
        show.textContent = chrome.i18n.getMessage('unfold');
        list.classList.remove('unfold');
        list.classList.add('fold');
        setTimeout(() => {
            list.style.display = 'none';
        }, 2000);
    }
});
//展开关于
document.getElementsByClassName('about')[0].addEventListener('click', function () {
    let list = document.getElementsByClassName('about-content')[0];
    if (list.style.display === 'none') {
        list.classList.remove('hide-card');
        list.classList.add('show-card');
        list.style.display = 'block';
    } else {
        list.classList.remove('show-card');
        list.classList.add('hide-card');
        setTimeout(() => {
            list.style.display = 'none';
        }, 1000);
    }
});
