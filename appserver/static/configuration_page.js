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
        const name = secretId.match(/^:(?<name>.+):/).groups.name

        if (confirm(`Delete configuration "${name}"?`)) {
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
            editLink.onclick = () => {
                window.location = `edit_webhook?id=${cellData.value}`;
            };
            $td.append(editLink);

            $td.append(" | ");

            let deleteLink = document.createElement("a");
            deleteLink.textContent = "Delete";
            deleteLink.onclick = confirmDeleteSecret.bind(deleteLink, cellData.value);
            $td.append(deleteLink);
        }
    });

    $("#add-webhook-button").click(() => {
        window.location = "create_webhook";
    });

    new SearchManager({
        id: "webhooks",
        search:
            "| rest \"servicesNS/nobody/TA-slack-webhook-alert/storage/passwords\"" +
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
});
