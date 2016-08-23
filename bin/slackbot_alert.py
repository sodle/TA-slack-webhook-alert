import slack
import slack.chat
import slack.auth
import sys
import json


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--execute':
        event = json.load(sys.stdin)

        slack.api_token = event['configuration']['api_key']
        slack_channel = event['configuration']['slack_channel']
        slack_bot_name = event['configuration'].get('slack_bot_name', None)
        slack_preamble = event['configuration'].get('slack_preamble', None)

        splunk_event = event['result']['_raw']

        slack_message = '```{0}```'.format(splunk_event)
        if slack_preamble:
            slack_message = '{0}\n{1}'.format(slack_preamble, slack_message)

        slack.chat.post_message(slack_channel, slack_message, username=slack_bot_name)
