[slack_alert_name]
* (Unique) name for your Slackbot alert.

action.api_key = <string>
* API Key for the Slack bot user API.
* (required)

action.slack_channel = <string>
* Slack channel that your alert will publish to. "#channelname" for a channel or "@username" to send to an indiviual user.
* (required)

action.slack_bot_name = <string>
* Display name for messages from your bot. Leave blank for "bot".
* (optional)

action.slack_preamble = <string>
* Text to insert before the Splunk event in messages. Slack formatting and "\n" for a newline are accepted.
* (optional)