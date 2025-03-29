#!/bin/bash

# Set Oracle environment
if [ -d /opt/oracle/instantclient_19_8 ]; then
    export ORACLE_HOME=/opt/oracle/instantclient_19_8
    export LD_LIBRARY_PATH=$ORACLE_HOME
elif [ -d /usr/lib/oracle/19.6/client64/lib ]; then
    export ORACLE_HOME=/usr/lib/oracle/19.6/client64
    # 19.* libraries will be already configured by ldconfig
    #export LD_LIBRARY_PATH=$ORACLE_HOME/lib
elif [ -d /usr/lib/oracle/12.2/client64/lib ]; then
    export ORACLE_HOME=/usr/lib/oracle/12.2/client64
    export LD_LIBRARY_PATH=$ORACLE_HOME/lib
else
    echo "Oracle not found..."
    exit 1
fi

# Configure the shared Node library on the undergrad server
export NODE_PATH=/cs/local/generic/lib/cs304/node_modules

# File path
ENV_SERVER_PATH="./.env"

# Check the database host name and port
sed -i "/^ORACLE_HOST=/c\ORACLE_HOST=dbhost.students.cs.ubc.ca" $ENV_SERVER_PATH
sed -i "/^ORACLE_PORT=/c\ORACLE_PORT=1522" $ENV_SERVER_PATH

# Define a range
START=50020
END=50030

# Function to check if a port is in use
check_port() {
    local port=$1
    if ! lsof -i :$port > /dev/null 2>&1; then
        return 0  # Port is free
    else
        return 1  # Port is in use
    fi
}

# Loop through the range and check if the port is in use
for PORT in $(seq $START $END); do
    if check_port $PORT; then
        # Update the port number in the .env file
        sed -i "/^PORT=/c\PORT=$PORT" $ENV_SERVER_PATH
        echo "Updated $ENV_SERVER_PATH with PORT=$PORT."
        
        # Replace the bash process with the Node process
        exec node server.js
        break
    fi
done
