(function() 
{
    let resourceCache = {};
    let readyCallbacks = [];
    let progressBar = document.getElementById("loadProgress");
    let countOfLoaded = 0;
    let countToLoad;

    // Load an image url or an array of image urls
    function load(urlOrArr) 
    {
        if(urlOrArr instanceof Array) 
        {
            countToLoad = urlOrArr.length;
            urlOrArr.forEach(function(url) 
            {
                _load(url);
            });
        }
        else 
        {
            countToLoad
            _load(urlOrArr);
        }
    }

    function _load(url) 
    {
        if(resourceCache[url]) 
        {
            return resourceCache[url];
        }
        else 
        {
            let img = new Image();
            img.onload = function() 
            {
                countOfLoaded++;
                sleep(100);
                progressBar.setAttribute("value", countOfLoaded / countToLoad);
                sleep(100);
                resourceCache[url] = img;
                
                if(isReady()) 
                {
                    readyCallbacks.forEach(function(func) { func(); });
                }
            };
            resourceCache[url] = false;
            img.src = url;
        }
    }

    function get(url) 
    {
        return resourceCache[url];
    }

    function isReady() 
    {
        let ready = true;
        for(let k in resourceCache) 
        {
            if(resourceCache.hasOwnProperty(k) && !resourceCache[k]) 
            {
                ready = false;
            }
        }
        return ready;
    }

    function onReady(func) 
    {
        readyCallbacks.push(func);
    }

    function sleep(ms) 
    {
        ms += new Date().getTime();
        while (new Date() < ms){}
    }

    window.resources = { 
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };
})();