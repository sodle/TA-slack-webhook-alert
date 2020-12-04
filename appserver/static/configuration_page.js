/* global locale_name */
require([
    "underscore",
    "jquery",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/tableview",
    "splunkjs/mvc/simplexml/ready!",
], (_, $, SearchManager, TableView) => {
    const localeName = locale_name();
    const tokenKey = $.cookie("token_key");

    function confirmDeleteSecret(secretId) {
        let [type, name] = secretId.split(":");

        switch (type) {
        case "slackbot": {
            type = "Slackbot Webhook";
            break;
        }
        case "slackbot_proxy": {
            type = "Slackbot Proxy Configuration";
            break;
        }
        }
        if (confirm(`Delete ${type} "${name}"?`)) {
            fetch(`/${localeName}/splunkd/__raw/servicesNS/nobody/TA-slack-webhook-alert/storage/passwords/${secretId}`, {
                method: "DELETE",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-Splunk-Form-Key": tokenKey
                }
            }).then(() => {
                location.reload();
            });
        }
    }

    let tableActionsCellRenderer = TableView.BaseCellRenderer.extend({
        initialize: configuration => {
            this.configuration = configuration;
        },
        canRender: cellData => cellData.field === "Actions",
        render: ($td, cellData) => {
            let editLink = document.createElement("a");
            editLink.textContent = "Edit";
            $td.append(editLink);

            $td.append(" | ");

            let deleteLink = document.createElement("a");
            deleteLink.textContent = "Delete";
            deleteLink.onclick = confirmDeleteSecret.bind(deleteLink, cellData.value);
            $td.append(deleteLink);
        }
    });

    new SearchManager({
        id: "webhooks",
        search:
            "| rest \"servicesNS/nobody/TA-slack-webhook-alert/storage/passwords\"" +
            "| search realm=slackbot" +
            "| rename username as \"Webhook Name\", title as Actions" +
            "| fields \"Webhook Name\", Actions",
        preview: true,
        cache: false
    });

    let webhooksTable = new TableView({
        id: "webhooks-table",
        managerid: "webhooks",
        drilldown: "none",
        el: $("#webhooks-table")
    });

    let webhookActionsCellRenderer = new tableActionsCellRenderer();
    webhooksTable.addCellRenderer(webhookActionsCellRenderer);
    webhooksTable.render();

    $("#add-proxy-button").click(() => {
        window.location = "create_proxy";
    });

    new SearchManager({
        id: "proxies",
        search:
            "| rest \"servicesNS/nobody/TA-slack-webhook-alert/storage/passwords\"" +
            "| search realm=slackbot_proxy" +
            "| rename username as \"Configuration Name\", title as Actions" +
            "| fields \"Configuration Name\", Actions",
        preview: true,
        cache: false
    });

    let proxiesTable = new TableView({
        id: "proxies-table",
        managerid: "proxies",
        drilldown: "none",
        el: $("#proxies-table")
    });

    let proxyActionsCellRenderer = new tableActionsCellRenderer();
    proxiesTable.addCellRenderer(proxyActionsCellRenderer);
    proxiesTable.render();
});
