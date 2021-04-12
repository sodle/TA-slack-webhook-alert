/* global locale_name */
require([
    "jquery",
    "splunkjs/mvc/simplexml/ready!",
], ($) => {
    const parser = new DOMParser();

    const localeName = locale_name();
    const tokenKey = $.cookie("token_key");

    function saveWebhook(name, password) {
        return fetch(`/${localeName}/splunkd/__raw/servicesNS/nobody/TA-slack-webhook-alert/storage/passwords`, {
            method: "POST",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-Splunk-Form-Key": tokenKey
            },
            body: new URLSearchParams({
                name,
                password
            })
        });
    }

    const $form = $("#config-form");
    const $name = $("#config-name");
    const $webhookUrl = $("#webhook-url");
    const $proxyUrl = $("#proxy-url");
    const $caBundlePath = $("#ca-bundle-path");

    $form.on("submit", e => {
        e.preventDefault();

        const name = $name.val().trim();
        const webhookUrl = $webhookUrl.val().trim();
        const proxyUrl = $proxyUrl.val().trim();
        const caBundlePath = $caBundlePath.val().trim();

        if (!webhookUrl.startsWith("https://hooks.slack.com/")) {
            alert(`"${webhookUrl}" does not appear to be a valid Slack webhook.`);
            return;
        }

        const webhookObject = {
            slackWebhookUrl: webhookUrl
        }

        if (proxyUrl.length > 0) {
            webhookObject.httpsProxyUrl = proxyUrl;
        }

        if (caBundlePath.length > 0) {
            webhookObject.caBundlePath = caBundlePath;
        }

        saveWebhook(name, JSON.stringify(webhookObject)).then(response => {
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
