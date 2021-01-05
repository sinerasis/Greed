/* We need to get saved settings from the storage object first. */
chrome.storage.sync.get(null, function(saved) {
    // this is a little validation that our values are saved correctly
    if (typeof(saved.toggleGoogleSearchBounce) != "undefined" && saved.toggleGoogleSearchBounce === 1) {
        saved.toggleGoogleSearchBounce = 1;
    } else {
        saved.toggleGoogleSearchBounce = 0;
    }

    if (typeof(saved.toggleGoogleSearchExclusions) != "undefined" && saved.toggleGoogleSearchExclusions === 1) {
        saved.toggleGoogleSearchExclusions = 1;
    } else {
        saved.toggleGoogleSearchExclusions = 0;
    }

    if (typeof(saved.toggleRedditOldRedirect) != "undefined" && saved.toggleRedditOldRedirect === 1) {
        saved.toggleRedditOldRedirect = 1;
    } else {
        saved.toggleRedditOldRedirect = 0;
    }

    if (typeof(saved.selectGoogleSearchExclusions) == "undefined") {
        saved.selectGoogleSearchExclusions = [];
    }

    console.log(saved);

    /* Google modifications */
    chrome.webRequest.onBeforeRequest.addListener(function(request) {
        if (request.type == "main_frame") {
            let originalRequest = new URL(request.url);
            if (originalRequest.searchParams.has("q")) {
                let query = originalRequest.searchParams.get("q");
                
                /* Google Search Bounce */
                if (saved.toggleGoogleSearchBounce === 1) {
                    if (originalRequest.pathname == "/url") {
                        console.log("Info: Preventing Google Search bounce.");
                        return { redirectUrl: query };
                    }
                }

                /* Exclude Domains from Search Results */
                if (saved.toggleGoogleSearchExclusions === 1) {
                    if (saved.selectGoogleSearchExclusions.length > 0) {
                        saved.selectGoogleSearchExclusions.forEach(function(domain) {
                            if (query.search(" -site:" + domain) == -1) {
                                query += " -site:" + domain;
                            }
                        });
                        if (query != originalRequest.searchParams.get("q")) {
                            originalRequest.searchParams.delete("q");
                            originalRequest.searchParams.append("q", query);
                            console.log("Info: Appending exclusions to search query.");
                            return { redirectUrl: originalRequest.href };
                        }
                    }
                }
            }
        }
    }, {
        urls: [
            "http://*.google.com/*",
            "https://*.google.com/*"
        ]
    }, [ "blocking" ] );

    /* Reddit modifications */
    chrome.webRequest.onBeforeRequest.addListener(function(request) {
        if (request.type == "main_frame") {
            let originalRequest = new URL(request.url);
            /* Redirect to old.reddit.com */
            if (saved.toggleRedditOldRedirect !== 0) {
                if (!originalRequest.host.includes("old")) {
                    console.log("Info: Redirecting to old.reddit.com.");
                    return { redirectUrl: "https://old.reddit.com" + originalRequest.pathname };
                }
            }
        }
    }, {
        urls: [
            "http://reddit.com/*",
            "https://reddit.com/*",
            "http://www.reddit.com/*",
            "https://www.reddit.com/*"
        ]
    }, [ "blocking" ] );
});