#!/bin/bash

LOG=/puffu/front.log

PID=$(ps -ef | grep next | grep server | awk '{print $2}')

if [ -z "$PID" ];

then

    echo "Progress is not running"

else

    kill -9 $PID

    echo "Progess stopped."
fi

echo "NextJs Front Start"
nohup npm run start >> $LOG 2>&1 &