module.exports = function (type, payload, app_id) {
  // type === action, payload.action === action_name

  let getPlugins = function() {
    var plugins = [];
    for (var plugin in window.navigator.mimeTypes) {
      if (window.navigator.mimeTypes[plugin].type) {
        plugins.push(window.navigator.mimeTypes[plugin].type);
      }
    }
    return plugins;
  };

  let event = {
    event_type: type, // event_name, aka app event name
    event_name: payload.name || null, // analytics name
    event_category: payload.category || null,
    device_created_tstamp: Date.now(),  // device_created_tstamp
    app_id: app_id,
    platform: 'web', // platform
    cookies: document.cookie,
    page_url: payload.url || null, // page_url
    page_title: document.title, // page_title
    page_referrer: payload.refr || null, // page_referrer
    plugins: getPlugins,
    color_depth: window.screen.colorDepth,
    screen_height: window.screen.height,
    screen_width: window.screen.width,
    // screen: window.screen, // br_colordepth, device_screenheight, device_screenwidth
    viewport_height: window.innerHeight,
    viewport_width: window.innerWidth,
    // viewport: {  // br_viewheight, br_viewwidth
    //   height: window.innerHeight,
    //   width: window.innerWidth
    // },
    doc_height: Math.max(document.documentElement.clientHeight, document.documentElement.offsetHeight, document.documentElement.scrollHeight),
    doc_width: Math.max(document.documentElement.clientWidth, document.documentElement.offsetWidth, document.documentElement.scrollWidth),
    // document: {
    //   height: Math.max(document.documentElement.clientHeight, document.documentElement.offsetHeight, document.documentElement.scrollHeight), // doc_height
    //   width: Math.max(document.documentElement.clientWidth, document.documentElement.offsetWidth, document.documentElement.scrollWidth) // doc_width
    // },
    cookies_enabled: window.navigator.cookieEnabled, // br_cookies
    language: window.navigator.language, // br_lang
    character_set: document.characterSet, // doc_charset
    crm_id: null,  // crm_id; insert your CRM ID here
    contexts: payload.contexts || null
  };

  var xhr = new XMLHttpRequest(),
    method = "POST",
    url = "http://localhost:8080/";
    // url = "http://192.168.99.100:31775/";

  xhr.open(method, url, true);

  xhr.onreadystatechange = function () {
    if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      if (xhr.responseText && JSON.parse(xhr.responseText)) {
        console.log(xhr.responseText);
        var jsonresponse = JSON.parse(xhr.responseText);
        for (var cookie in jsonresponse) {
          if (cookie === 'user_cookie') {
            // console.log('user_cookie', jsonresponse[cookie]);
            document.cookie = "cs_id=" + jsonresponse[cookie];  // set or update user cookie, including session counter
          }
          if (cookie === 'user_session') {
            // console.log('session_cookie', jsonresponse[cookie]);
            document.cookie = "cs_ses=" + jsonresponse[cookie];  // set or update session cookie
          }
        }
      }
    }
  };

  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(event));
}