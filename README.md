# [Download from Splunkbase](https://splunkbase.splunk.com/app/3277) (Coming Soon)

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
This app uses your system Python install instead of Splunk's built in one, allowing PIP packages to be used. Setup is as follows:

- Install the Splunk app through the GUI or by extracting it to your apps directory and restarting Splunk.
- Configure an alert through the normal means (GUI or `savedsearches.conf`) and add a Slackbot action with the following parameters:
    - `api_key`: The Slack API key you obtained from your Slack organization.
    - `slack_channel`: The Slack channel or user (`#channel` or `@user`) to post to.
    - `slack_bot_name`: Display name for the bot.
    - `slack_preamble`: Text to post before the events (accepts Slack formatting, @ tags, and \n)

Note: If your saved search returns multiple events, this alert will only publish the first to Slack. To get around this, use the "Once Per Event" mode when configuring in SplunkWeb or `alert.digest_mode=0` in `savedsearches.conf`. 

## Acknowledgements
The following libraries are bundled with this script.

- [PySlack](https://pypi.python.org/pypi/pyslack/)
