import sys
import csv
import json
import random
import xml.etree.ElementTree as ET
from datetime import date, timedelta
import time
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

def daterange(start_date, end_date):
    for n in range(int((end_date - start_date).days)):
        yield start_date + timedelta(n)

def mergeDicts(d1, d2):
    res = {**d1, **d2}
    return res

def process_rows(row):
    all_records = []
    listing_data = process_row(row)

    # 50% of the most popular listings (>4.8) will be unavailable in September
    is_unavailable_in_sep = False
    if listing_data["review_score"] > 4.8 and random.randrange(10) >= 5:
        #print(listing_data["listingID"], "unavailable in September")
        is_unavailable_in_sep = True

    # Date Availability: [8/4 - 9/8]
    start_date = date(2021, 8, 4)
    end_date = date(2021, 9, 9)
    for single_date in daterange(start_date, end_date):
        date_data = {}
        date_str = single_date.strftime("%Y-%m-%d")
        date_ts = single_date.strftime('%s')

        # set all available = False in september 
        is_available = True
        if is_unavailable_in_sep and date_ts > 1630382400:
            is_available = False

        date_data["date"] = date_str
        date_data["date_ts"] = int(date_ts)
        date_data["is_available"] = is_available

        record = mergeDicts(listing_data, date_data)
        all_records.append(record)

    return all_records

def process_row(row):
    record = {}

    # Listing Info
    record["listingID"] = int(row["id"])
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

    # Host
    record["host_name"] = row["host_name"]

    # Reviews
    record["review_score"] = float(row["review_scores_rating"])
    record["review_count"] = int(row["number_of_reviews"])

    return record

def make_json(csvFilePath, jsonFilePath):
    data = []

    with open(csvFilePath, encoding='utf-8') as csvf:
        csvReader = csv.DictReader(csvf)

        for row in csvReader:
            try:
                records = process_rows(row)
                data.extend(records)
            except Exception:
                pass


    # Open a json writer, and use the json.dumps()
    with open(jsonFilePath, 'w', encoding='utf-8') as jsonf:
        jsonf.write(json.dumps(data, indent=4))

'''
Driver Code
'''
csvFilePath = r'asheville.csv'
jsonFilePath = r'asheville_w_dates.json'

make_json(csvFilePath, jsonFilePath)
