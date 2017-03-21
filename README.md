# [Download from Splunkbase](https://splunkbase.splunk.com/app/3277)

# Splunk Custom Alert Action to send events to Slack
This app provides an Alert Action that posts matching events to Slack using the Slack Bot User API.

## Requirements
Splunk 6.3 or later.

## Building the Splunk package
From the project directory, execute `build.py`. This generates a .tgz package ready to be installed into Splunk or uploaded to Splunkbase. Under the hood, it does the following:

* Creates a temporary working directory with only the files needed for the Splunk package.
* Installs the input's Python dependencies to the bin directory.
* Removes Python's .pyc and .pyo files to meet Splunkbase guidelines.
* Compresses the directory into the final .tgz archive.
* Deletes the temp directory.

## Setting up
- Install the Splunk app through the GUI or by extracting it to your apps directory and restarting Splunk.
- Configure an alert through the normal means (GUI or `savedsearches.conf`) and add a `slack_webhook_alert` action with the following parameters:
    - `slack_webhook`: Slack Incoming Webhook URL
    - `slack_message`: Text of the Slack message to send. Slack formatting and `\n` for a newline are accepted, as well as [Splunk token substitutions](https://docs.splunk.com/Documentation/Splunk/6.5.2/Alert/EmailNotificationTokens).

Note: If your saved search returns multiple events, this alert will only publish the first to Slack. To get around this, use the "Once Per Event" mode when configuring in SplunkWeb or `alert.digest_mode=0` in `savedsearches.conf`. 

## Acknowledgements
The following libraries are bundled with this script.

- [Requests](https://pypi.python.org/pypi/requests/)