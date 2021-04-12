/* global locale_name */
require([
    "jquery",
    "splunkjs/mvc/simplexml/ready!",
], ($) => {
    const parser = new DOMParser();

    const localeName = locale_name();
    const tokenKey = $.cookie("token_key");

    function saveWebhook(name, password) {
        return fetch(`/${localeName}/splunkd/__raw/servicesNS/nobody/TA-slack-webhook-alert/storage/passwords/:${name}:`, {
            method: "POST",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-Splunk-Form-Key": tokenKey
            },
            body: new URLSearchParams({
                password
            })
        });
    }

    // Read a page's GET URL variables and return them as an associative array.
    function getUrlVars() {
        let vars = [], hash;
        const hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (let i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }

    const webhookId = decodeURIComponent(getUrlVars().id);
    const webhookName = webhookId.match(/^:(?<name>.+):/).groups.name;

    const $form = $("#config-form");
    const $name = $("#config-name");
    const $webhookUrl = $("#webhook-url");
    const $proxyUrl = $("#proxy-url");
    const $caBundlePath = $("#ca-bundle-path");

    $name.val(webhookName);

    fetch(`/${localeName}/splunkd/__raw/servicesNS/nobody/TA-slack-webhook-alert/storage/passwords/:${webhookName}:`, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "X-Splunk-Form-Key": tokenKey
        }
    }).then(response => response.text()).then(text => {
        const $t = $(text);
        $name.val($t.find("s\\:key[name=username]").text());

        const password = $t.find("s\\:key[name=clear_password]").text();

        if (password.startsWith("https://")) {
            $webhookUrl.val(password);
        } else {
            const jsonConfig = JSON.parse(password);
            $webhookUrl.val(jsonConfig.slackWebhookUrl);

            if (jsonConfig.httpsProxyUrl) {
                $proxyUrl.val(jsonConfig.httpsProxyUrl);
            }

            if (jsonConfig.caBundlePath) {
                $caBundlePath.val(jsonConfig.caBundlePath);
            }
        }

        $(".spook-loading-progress").addClass("spook-loading-done");
        $(".spook-loading-content").removeClass("spook-loading-content");
    });

    $form.on("submit", e => {
        e.preventDefault();

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

        saveWebhook(webhookName, JSON.stringify(webhookObject)).then(response => {
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
