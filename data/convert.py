import sys
import csv
import json
import random
import xml.etree.ElementTree as ET
csv.field_size_limit(sys.maxsize)

'''
Data Processing Script

Input:
- .csv file

Steps
- Read the CSV line by line
- Perform a transformation on a specific line
    - change attribute names
    - change data types
    - enrich with metadata
    - generate fake attributes
    - remove unused fields
- Add new line to buffer
- Iterate over the buffer and save to file (JSON)

Questions
- Do it the transformations in place? Or copies?
    - STATELESS
    - Transformations return the entire input, except for the specific change applied
    - This will allow chaining of records
'''


'''
Utility Functions
'''
def camelCase(st):
    output = ''.join(x for x in st.title() if x.isalnum())
    return output[0].lower() + output[1:]

def snake_case(s):
    return ''.join(['_'+c.lower() if c.isupper() else c for c in s]).lstrip('_')



def process_row(row):
    record = {}

    # Listing Info
    record["objectID"] = int(row["id"])
    record["accommodates"] = int(row["accommodates"])
    record["last_updated_at"] = row["last_scraped"]
    record["bedrooms"] = int(row["bedrooms"])
    record["bathrooms"] = float(row["bathrooms_text"].split()[0])
    record["amenities"] = eval(row["amenities"])

    text_fields = [
        "listing_url",
        "name",
        "description",
        "neighborhood_overview",
        "picture_url",
        "host_name",
        "property_type",
        "room_type",
    ]
    for text_field in text_fields:
        record[text_field] = row[text_field]

    # Enrichment
    tags = ["is_furnished", "has_pool", "is_pet_friendly", "has_pool"]
    for tag in tags:
        record[tag] = random.choice([True, False])

    # Pricing
    price_len = len(row["price"])
    record["price_per_day"] = int(row["price"][1:price_len-3])

    # Geo
    record["_geoloc"] = {
        "lat": float(row["latitude"]),
        "lng": float(row["longitude"])
    }
    # Location
    record["city"] = "Asheville"
    record["state"] = "North Carolina"
    neighborhoods = {
        28704: "Royal Pines",
        28715: "Woodside Hills",
        28732: "Fletcher",
        28801: "Downtown Asheville",
        28803: "Biltmore Forest",
        28804: "Woodfin",
        28805: "Mountainbrook",
        28806: "West Asheville",
    }
    zip_code = int(row["neighbourhood_cleansed"])
    record["zip_code"] = zip_code
    if neighborhoods[zip_code]:
        record["neighborhood"] = neighborhoods[zip_code]

    return record

def make_json(csvFilePath, jsonFilePath):
    data = []

    with open(csvFilePath, encoding='utf-8') as csvf:
        csvReader = csv.DictReader(csvf)

        for row in csvReader:
            try:
                record = process_row(row)
                data.append(record)
            except Exception:
                pass

    # Open a json writer, and use the json.dumps()
    with open(jsonFilePath, 'w', encoding='utf-8') as jsonf:
        jsonf.write(json.dumps(data, indent=4))

'''
Driver Code
'''
csvFilePath = r'asheville.csv'
jsonFilePath = r'asheville.json'

make_json(csvFilePath, jsonFilePath)
