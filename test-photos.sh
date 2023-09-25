#!/bin/bash

curl -XPOST http://localhost:3031/photos -H'Content-Type:application/json' --data '{"action":"copy-files"}'

