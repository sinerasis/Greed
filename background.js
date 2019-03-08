chrome.webRequest.onBeforeRequest.addListener(function(request) {
    if (request.type == "main_frame") {
        let originalRequest = new URL(request.url);
        if (originalRequest.searchParams.has("q")) {
            let query = originalRequest.searchParams.get("q");
            
            // Routing URLs through Google Search is not only an invasion of privacy, it causes non-public URLs to fail.
            if (originalRequest.pathname == "/url") {
                console.log("Info: Preventing Google Search bounce.");
                return { redirectUrl: query };
            }

            // Google removed the option to hide sources you deem poor, this gives you that option back.
            let exclude = [
                "buzzfeed.com",
                "facebook.com",
                "foxnews.com",
                "pintrest.com",
                "twitter.com",
                "w3schools.com"
            ];

            if (exclude.length > 0) {
                exclude.forEach(function(domain) {
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
}, {
    urls: [
        "http://*.google.com/*",
        "https://*.google.com/*"
    ]
}, [ "blocking"] );
