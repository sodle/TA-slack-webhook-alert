# encoding = utf-8
import sys
from os import path, environ

sys.path.insert(0, path.join(path.dirname(__file__), "..", "lib"))

import requests


def process_event(helper, *args, **kwargs):
    """
    # IMPORTANT
    # Do not remove the anchor macro:start and macro:end lines.
    # These lines are used to generate sample code. If they are
    # removed, the sample code will not be updated when configurations
    # are updated.

    [sample_code_macro:start]

    # The following example gets account information
    user_account = helper.get_user_credential("<account_name>")

    # The following example gets the alert action parameters and prints them to the log
    slack_webhook_name = helper.get_param("slack_webhook_name")
    helper.log_info("slack_webhook_name={}".format(slack_webhook_name))

    channel_name = helper.get_param("channel_name")
    helper.log_info("channel_name={}".format(channel_name))

    username = helper.get_param("username")
    helper.log_info("username={}".format(username))

    emoji_avatar = helper.get_param("emoji_avatar")
    helper.log_info("emoji_avatar={}".format(emoji_avatar))

    message = helper.get_param("message")
    helper.log_info("message={}".format(message))


    # The following example adds two sample events ("hello", "world")
    # and writes them to Splunk
    # NOTE: Call helper.writeevents() only once after all events
    # have been added
    helper.addevent("hello", sourcetype="sample_sourcetype")
    helper.addevent("world", sourcetype="sample_sourcetype")
    helper.writeevents(index="summary", host="localhost", source="localhost")

    # The following example gets the events that trigger the alert
    events = helper.get_events()
    for event in events:
        helper.log_info("event={}".format(event))

    # helper.settings is a dict that includes environment configuration
    # Example usage: helper.settings["server_uri"]
    helper.log_info("server_uri={}".format(helper.settings["server_uri"]))
    [sample_code_macro:end]
    """

    helper.log_info("Alert action slack_webhook_alert started.")

    slack_webhook_name = helper.get_param('slack_webhook_name')
    channel_name = helper.get_param('channel_name')
    username = helper.get_param('username')
    emoji_avatar = helper.get_param('emoji_avatar')
    message = helper.get_param('message')

    slack_credential = helper.get_user_credential(slack_webhook_name)
    if slack_credential is None or slack_credential.get('password') is None:
        helper.log_error('Slack webhook {} not found!'.format(slack_webhook_name))
        return -1
    slack_webhook = slack_credential.get('password')

    slack_message = {
        'text': message,
        'link_names': 1
    }

    if channel_name is not None:
        slack_message['channel'] = channel_name

    if username is not None:
        slack_message['username'] = username

    if emoji_avatar is not None:
        slack_message['icon_emoji'] = emoji_avatar

    proxies = {}

    cert_chain_path = None

    if slack_webhook.startswith('https://'):
        # Legacy mode: secret is a plain URL
        slack_webhook_url = slack_webhook
    else:
        # New mode: secret is a json string with webhook url and optional proxy url and cert chain path
        import json
        slack_webhook_obj = json.loads(slack_webhook)
        slack_webhook_url = slack_webhook_obj.get('slackWebhookUrl')
        proxies['https'] = slack_webhook_obj.get('httpsProxyUrl')
        cert_chain_path = slack_webhook_obj.get('caBundlePath')

    if not slack_webhook_url.startswith('https://'):
        helper.log_error('Only HTTPS webhooks are supported!')
        return -1

    if cert_chain_path is None and sys.platform.startswith("linux"):
        # If a cert chain isn't specified, search common Linux OS locations for the cert chain
        # List of paths copied from: https://github.com/matusf/ca-bundle/blob/master/ca_bundle.py
        for common_cert_path in [
            '/etc/ssl/certs/ca-certificates.crt',  # Debian/Ubuntu/Gentoo etc.
            '/etc/pki/tls/certs/ca-bundle.crt',  # Fedora/RHEL 6
            '/etc/ssl/ca-bundle.pem',  # OpenSUSE
            '/etc/pki/tls/cacert.pem',  # OpenELEC
            '/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem',  # CentOS/RHEL 7
            '/etc/ssl/cert.pem',  # Alpine Linux
        ]:
            if path.isfile(common_cert_path):
                cert_chain_path = common_cert_path

    session = requests.session()
    if cert_chain_path is not None:
        session.verify = cert_chain_path

    slack_response = session.post(slack_webhook_url, json=slack_message, proxies=proxies)

    if slack_response.status_code >= 400:
        helper.log_error('Slack request failed: {}'.format(slack_response.text))
        return slack_response.status_code

    return 0
