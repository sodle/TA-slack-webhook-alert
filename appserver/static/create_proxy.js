/* global locale_name */
require([
    "jquery",
    "splunkjs/mvc/simplexml/ready!",
], ($) => {
    const parser = new DOMParser();

    const localeName = locale_name();
    const tokenKey = $.cookie("token_key");

    function saveProxy(name, url) {
        return fetch(`/${localeName}/splunkd/__raw/servicesNS/nobody/TA-slack-webhook-alert/storage/passwords`, {
            method: "POST",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-Splunk-Form-Key": tokenKey
            },
            body: new URLSearchParams({
                name,
                realm: "slackbot_proxy",
                password: url
            })
        });
    }

    const $form = $("#config-form");
    const $name = $("#config-name");
    const $url = $("#proxy-url");

    $form.on("submit", e => {
        e.preventDefault();

        saveProxy($name.val(), $url.val()).then(response => {
            response.text().then(text => {
                const responseXml = parser.parseFromString(text, "text/xml");

                if (response.ok) {
                    console.log(`Created ${responseXml.getElementsByTagName("title")[0].textContent}`);
                    window.location = ".";
                } else {
                    alert(`Error: ${responseXml.getElementsByTagName("msg")[0].textContent}`);
                }
            });
        });
    });
});
