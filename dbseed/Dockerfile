FROM mongo

COPY forms.collection.json /init.json
CMD mongoimport --host db --db form-collector --collection forms --type json --file /init.json --jsonArray
