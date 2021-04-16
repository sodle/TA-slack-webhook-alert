import sys
import os
import json

lib_dir = os.path.join(os.path.join(os.environ.get('SPLUNK_HOME')), 'etc', 'apps', 'TA-slack-webhook-alert', 'lib')
if lib_dir not in sys.path:
    sys.path.append(lib_dir)

from bs4 import BeautifulSoup
import requests

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] != "--execute":
        print("FATAL Unsupported execution mode (expected --execute flag)", file=sys.stderr)
        sys.exit(1)
    else:
        configuration = json.loads(sys.stdin.read())

        secret_url = '{}/servicesNS/nobody/TA-slack-webhook-alert/storage/passwords/:{}:'.format(
            configuration.get('server_uri'),
            configuration.get('configuration').get('slack_webhook_name')
        )
        secret_response = requests.get(secret_url, headers={
            'Authorization': 'Splunk {}'.format(configuration.get('session_key'))
        }, verify=False)
        secret_soup = BeautifulSoup(secret_response.content, features='lxml')
        secret = secret_soup.find('s:key', {'name': 'clear_password'}).text

        slack_channel = configuration.get('configuration').get('channel_name')
        bot_username = configuration.get('configuration').get('username')
        emoji_avatar = configuration.get('configuration').get('emoji_avatar')
        slack_message = configuration.get('configuration').get('message')

        if secret.startswith('https://'):
            webhook_url = secret
            https_proxy_url = None
            ca_bundle_path = None
        else:
            secret_parsed = json.loads(secret)
            webhook_url = secret_parsed.get('slackWebhookUrl')
            https_proxy_url = secret_parsed.get('httpsProxyUrl')
            ca_bundle_path = secret_parsed.get('caBundlePath')

        if not webhook_url.startswith("https://"):
            sys.stderr.write("FATAL Only HTTPS webhooks are supported.\n")
            sys.stderr.flush()
            raise RuntimeError()

        if ca_bundle_path is None and sys.platform.startswith("linux"):
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
                if os.path.isfile(common_cert_path):
                    ca_bundle_path = common_cert_path

        session = requests.session()
        if ca_bundle_path is not None:
            session.verify = ca_bundle_path

        if https_proxy_url is not None:
            proxies = {
                'https': https_proxy_url
            }
        else:
            proxies = {}

        slack_request = {
            'text': slack_message,
            'link_names': 1,
        }

        if bot_username is not None:
            slack_request['username'] = bot_username

        if slack_channel is not None:
            slack_request['channel'] = slack_channel

        if emoji_avatar is not None:
            slack_request['icon_emoji'] = emoji_avatar

        slack_response = session.post(webhook_url, json=slack_request, proxies=proxies)

        if slack_response.status_code >= 400:
            sys.stderr.write(
                "FATAL Slack returned error code {} - {}\n".format(slack_response.status_code, slack_response.text))
            sys.stderr.flush()
            raise RuntimeError()
