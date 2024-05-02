//获得搜索建议
async function fetchSuggestions(query) {
  let suggestResult = [];
  try {
    const response = await fetch("https://suggestion.baidu.com/su?p=3&ie=UTF-8&cb=&wd=" + encodeURIComponent(query));
    const data = await response.text();
    let dataString = data.slice(0, -2).slice(1);
    dataString = dataString.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"\$2":').replace(/'/g, '"');
    let result = JSON.parse(dataString);
    for (let i = 0; i < result.s.length; i++) {
      suggestResult.push({ content: result.s[i], description: result.s[i] });
    }
  } catch (error) {
    console.log('error');
  }
  return suggestResult;
}
//搜索建议
let timerId1 = null;
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  clearTimeout(timerId1);
  timerId1 = setTimeout(async () => {
    const regex = /:(\w+)\s+(.+)/;
    const match = text.match(regex);
    let query;
    if (match) {
      query = match[2];
    } else {
      query = text;
    }
    const suggestions = await fetchSuggestions(query);
    suggest(suggestions);
  }, 500);
});
chrome.omnibox.onInputEntered.addListener((text) => {
  handleInput(text);
});
//正则匹配key和内容，并传给搜索函数
function handleInput(input) {
  const regex = /:(\w+)\s+(.+)/;
  const match = input.match(regex);
  let key, content;
  if (match) {
    key = match[1];
    content = match[2];
    chrome.storage.local.get('searchList', function (result) {
      const list = result.searchList || [];
      let flag = 0;
      for (let searchEngine of list) {
        if (searchEngine.key === key) {
          search(key, content);
          flag = 1;
        }
      }
      if (flag === 0) {
        chrome.storage.local.get('defaultSearch', function (result) {
          key = result.defaultSearch.key;
          search(key, content);
        });
      }
    });
  }
  else {
    chrome.storage.local.get('defaultSearch', function (result) {
      key = result.defaultSearch.key;
      content = input;
      search(key, content);
    });
  }
}
//搜索函数
function search(key, content) {
  chrome.storage.local.get('searchList', function (result) {
    const list = result.searchList || [];
    for (let searchEngine of list) {
      if (searchEngine.key === key) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          let tab = tabs[0];
          chrome.tabs.update(tab.id, { url: searchEngine.url + encodeURIComponent(content) });
        });
      }
    }
  });
}
//初始化默认搜索引擎
chrome.runtime.onInstalled.addListener(function () {
  let searchEngines = [
    { "name": "Bing", "key": "bi", "url": "https://www.bing.com/search?q=", "icon": "./assets/images/favicon/bing.ico" },
    { "name": "Baidu", "key": "bd", "url": "https://www.baidu.com/s?wd=", "icon": "./assets/images/favicon/baidu.ico" },
    { "name": "Google", "key": "gg", "url": "https://www.google.com/search?q=", "icon": "./assets/images/favicon/google.ico" },
    { "name": "Github ", "key": "git", "url": "https://github.com/search?q=", "icon": "./assets/images/favicon/github.ico" },
  ];
  chrome.storage.local.set({ 'searchList': searchEngines, 'defaultSearch': searchEngines[0] }, function () {
    console.log('default list add success');
  });
});