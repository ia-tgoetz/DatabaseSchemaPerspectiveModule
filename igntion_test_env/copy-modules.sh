#!/bin/bash
echo "Copying custom modules to user-lib/modules..."
cp -a /staging-modules/. /usr/local/bin/ignition/external-modules/
chown -R ignition:ignition /usr/local/bin/ignition/external-modules/