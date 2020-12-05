/* global locale_name */
require([
    "jquery",
    "splunkjs/mvc/simplexml/ready!",
], ($) => {
    const parser = new DOMParser();

    const localeName = locale_name();
    const tokenKey = $.cookie("token_key");

    function saveProxy(name, url) {
        return fetch(`/${localeName}/splunkd/__raw/servicesNS/nobody/TA-slack-webhook-alert/storage/passwords/slackbot_proxy:${name}:`, {
            method: "POST",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-Splunk-Form-Key": tokenKey
            },
            body: new URLSearchParams({
                password: url
            })
        });
    }

    const $form = $("#config-form");
    const $name = $("#config-name");
    const $url = $("#proxy-url");

    const queryString = window.location.search.startsWith("?") ? window.location.search.substring(1) : window.location.search;
    const queryPairs = queryString.split("&");
    for (const pair of queryPairs) {
        const [name, value] = pair.split("=");
        if (decodeURIComponent(name) === "config_id") {
            fetch(`/${localeName}/splunkd/__raw/servicesNS/nobody/TA-slack-webhook-alert/storage/passwords/${decodeURIComponent(value)}`).then(response => {
                response.text().then(text => {
                    const $t = $(text);
                    $name.val($t.find("s\\:key[name=username]").text());
                    $url.val($t.find("s\\:key[name=clear_password]").text());

                    $(".spook-loading-progress").addClass("spook-loading-done");
                    $(".spook-loading-content").removeClass("spook-loading-content");
                });
            });
        }
    }

    $form.on("submit", e => {
        e.preventDefault();

        saveProxy($name.val(), $url.val()).then(response => {
            response.text().then(text => {
                const responseXml = parser.parseFromString(text, "text/xml");

                if (response.ok) {
                    console.log(`Updated ${responseXml.getElementsByTagName("title")[0].textContent}`);
                    window.location = ".";
                } else {
                    alert(`Error: ${responseXml.getElementsByTagName("msg")[0].textContent}`);
                }
            });
        });
    });
}
);
