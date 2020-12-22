/*
I've setup these options to be as simple as possible. You may find it beneficial to modify this script to suit your needs better. Feel free to submit pull requests!
Instead of coding an entire user settings page that is user friendly, I figured wrapping everything in a simple boolean switch was simpler.
Remember to reload the extention in Chrome after making any changes!

Note: the blank new tab page is defined in manifest.json (there are no comments allowed in JSON files). If you'd rather not have a blank new tab page, simply remove the "chrome_url_overrides" block.
*/

/* Google */
chrome.webRequest.onBeforeRequest.addListener(function(request) {
    if (request.type == "main_frame") {
        let originalRequest = new URL(request.url);
        if (originalRequest.searchParams.has("q")) {
            let query = originalRequest.searchParams.get("q");
            /*
            Google Search Bounce

            When you use a Google web application of any kind (Gmail, Hangouts, etc) clicking on ANY link causes you to bounce through Google search.
            This is done so Google can track your browsing habits and boost their Search usage numbers.
            Not only is this an invasion of privacy it's significantly slower and causes internal links to fail completely as they aren't reachable from Google Search.
            */
            if (true) {
                if (originalRequest.pathname == "/url") {
                    console.log("Info: Preventing Google Search bounce.");
                    return { redirectUrl: query };
                }
            }

            /*
            Exclude Domains from Search Results

            Google used to have an option to stop seeing results from particular sources. You had the option to downvote results and your personal search results would exclude sources you found bad.
            They removed this option for reasons unknown, however you still have the ability to exclude domains in each search request.
            It's a very tedious task to remmber to add -site:domain.com to every single search you ever make, and gets crazy if you want to exclude a few. This automatically appends exclusions to your Google searches.
            Note: try to keep this array as small as possible.
            */
            if (true) {
                let exclude = [
                    "pintrest.com",
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
    }
}, {
    urls: [
        "http://*.google.com/*",
        "https://*.google.com/*"
    ]
}, [ "blocking"] );

/* Reddit */
chrome.webRequest.onBeforeRequest.addListener(function(request) {
    if (request.type == "main_frame") {
        let originalRequest = new URL(request.url);
        console.log(originalRequest);

        /*
        Redirect to Old.

        Reddit decided to refresh their web interface and it's not only terrible, but it includes a bunch of tracking features that most people probably don't want.
        This redirects your requests to their old site by modifying the request URL automatically.
        */
        if (true) {
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
}, [ "blocking"] );
