// Waits for the document to be rendered completely
document.addEventListener("DOMContentLoaded", function() {
    // Update version element from manifest
    let manifest = chrome.runtime.getManifest();
    let versionElement = document.getElementById("version");
    versionElement.innerText = manifest.version;

    // Clears all saved settings
    let optionsReset = document.getElementById("options-reset-all");
    optionsReset.addEventListener("click", function(event) {
        if (confirm("This clears all settings and cannot be undone.\r\n\r\nAre you sure?")) {
            chrome.storage.sync.clear(function() {
                console.log("Sync cleared.");
                chrome.storage.local.clear(function() {
                    console.log("Local cleared. Reloading...");
                    location.reload();
                });
            });
        }
    });

    let select = document.getElementById("selectGoogleSearchExclusions");

    // Add a new exclusion
    let addExclusion = document.getElementById("buttonGoogleSearchExclusionsAdd");
    addExclusion.addEventListener("click", function(event) {
        let input = document.getElementById("textGoogleSearchExclusions");

        if (input.value.length > 0) {
            let o = document.createElement("option");
            o.value = input.value;
            o.innerText = input.value;
            select.appendChild(o);
            input.value = "";
            SaveExclusions();
        } else {
            alert("Enter a domain to add it to the list of exclusions.");
        }
    });

    // Remove an exclusion
    let removeExclusion = document.getElementById("buttonGoogleSearchExclusionsRemove");
    removeExclusion.addEventListener("click", function(event) {
        if (select.selectedIndex > -1) {
            select.removeChild(select[select.selectedIndex]);
            SaveExclusions();
        } else {
            alert("Select an existing entry to remove.");
        }
    });

    // Save exclusions to the storage object
    function SaveExclusions() {
        let exclusions = [];
        for (i = 0; i < select.children.length; i++) {
            exclusions.push(select.children[i].value);
        }
        chrome.storage.sync.set({ "selectGoogleSearchExclusions": exclusions }, function() {
            console.log("Info: Saved exclusions");
        });
    }

    chrome.storage.sync.get(null, function(saved) {
        // Populate toggles
        let toggles = document.getElementsByClassName("parameter-toggle");
        for (element in toggles) {
            if (toggles[element] instanceof HTMLElement) {
                let enabled = document.createElement("option");
                enabled.value = 1;
                enabled.innerText = "Enabled";

                let disabled = document.createElement("option");
                disabled.value = 0;
                disabled.innerText = "Disabled";

                let id = toggles[element].getAttribute("id");

                if (saved[id] === 1) {
                    enabled.setAttribute("selected", "selected");
                } else {
                    disabled.setAttribute("selected", "selected");
                }

                toggles[element].appendChild(enabled);
                toggles[element].appendChild(disabled);

                toggles[element].addEventListener("change", function(event) {
                    chrome.storage.sync.set({ [id]: Number(event.target.value) }, function() {
                        console.log("Info: Saved toggle");
                    });
                });
            }
        }

        // Populate multiselects
        let multis = document.getElementsByClassName("parameter-multi");
        for (element in multis) {
            if (multis[element] instanceof HTMLElement) {
                let id = multis[element].getAttribute("id");
                if (typeof(saved[id]) != "undefined") {
                    if (saved[id].length > 0) {
                        for (i = 0; i < saved[id].length; i++) {
                            let o = document.createElement("option");
                            o.value = saved[id][i];
                            o.innerText = saved[id][i];
                            multis[element].appendChild(o);
                        }
                    }
                }
            }
        }
    });
});
