#!/bin/bash
echo "Copying custom modules to data/modules..."
cp -a /staging-modules/. /usr/local/bin/ignition/user-lib/modules/
chown -R ignition:ignition /usr/local/bin/ignition/user-lib/modules/