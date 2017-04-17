#!/bin/bash
# okay
# set mock data
DB=dev

# drop all Hyoshi data
mongo $DB --quiet --eval "db.dropDatabase()"

# imports
cat ./mockData/imports/deckCards.json | jq '.cards[]' > import.json
mongoimport --db $DB --collection deckcards --file ./import.json

cat ./mockData/imports/userCards.json | jq '.cards[]' > import.json
mongoimport --db $DB --collection usercards --file ./import.json

cat ./mockData/imports/decks.json | jq '.decks[]' > import.json
mongoimport --db $DB --collection decks --file ./import.json

cat ./mockData/imports/users.json | jq '.users[]' > import.json
mongoimport --db $DB --collection users --file ./import.json

rm import.json

# mongoimport --db $DB --collection instruments --drop --file ./mockData/instruments.json

# # assign each user an instrument
# TOTAL=${#users[@]}
# for ((i=0; i<$TOTAL; i++))
# do
#     ID=$(mongo $DB --quiet --eval "db.users.find({\"name\": \"${users[$i]}\"}, { _id: 1}).forEach(printjson)");
#     INSTRUMENT=$(mongo $DB --quiet --eval "db.instruments.find({\"subCategory\": \"${instruments[$i]}\"}, { _id: 1}).forEach(printjson)");
#     echo $ID
#     echo $INSTRUMENT
#     mongo $DB --quiet --eval "db.users.update($ID , {\$addToSet: {\"instruments\": $INSTRUMENT }})"
# done

# echo "Mongo DB $DB Bootstrap Complete"

