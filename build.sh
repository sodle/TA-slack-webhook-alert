#!/usr/bin/env bash
PACKAGE_NAME="TA-slack-webhook-alert"
PIP=$(command -v pip || command -v pip2 || command -v pip3)

echo "Removing existing builds..."
rm -rf "$PACKAGE_NAME"
rm -rf "$PACKAGE_NAME.tgz"

echo "Creating app directory..."
mkdir $PACKAGE_NAME
cp -r bin default README static README.txt appserver app.manifest metadata $PACKAGE_NAME

echo "Cleaning up Python binaries..."
find $PACKAGE_NAME -type f -name "*.pyc" -delete
find $PACKAGE_NAME -type f -name "*.pyo" -delete

echo "Fixing permissions..."
find $PACKAGE_NAME -type f -exec chmod 644 -- {} +

echo "Creating tarball..."
tar czf $PACKAGE_NAME.tgz $PACKAGE_NAME
