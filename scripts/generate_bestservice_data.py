import json
import random
import urllib.parse

categories = ["Instruments", "Effects", "Software"]
years = range(2015, 2025)

data = {
    "Instruments": [],
    "Effects": [],
    "Software": []
}

# Prefixes and suffixes to generate names
instrument_prefixes = ["Symphonic", "Epic", "Cinematic", "Virtual", "Analog", "Digital", "Hybrid", "Organic", "Modular", "Classic"]
instrument_suffixes = ["Strings", "Brass", "Drums", "Keys", "Synth", "Choir", "Bass", "Guitars", "Orchestra", "World"]

effect_prefixes = ["Vintage", "Modern", "Dynamic", "Spatial", "Harmonic", "Transient", "Mastering", "Mixing", "Vocal", "Guitar"]
effect_suffixes = ["Reverb", "Delay", "Compressor", "EQ", "Limiter", "Saturation", "Modulator", "Filter", "Distortion", "Strip"]

software_prefixes = ["Pro", "Studio", "Live", "Creative", "Audio", "Music", "Beat", "Score", "Wave", "Sound"]
software_suffixes = ["DAW", "Suite", "Lab", "Station", "Creator", "Editor", "Engine", "Tool", "Platform", "Hub"]

def generate_item(category, index):
    year = random.choice(years)
    price = round(random.uniform(49.0, 999.0), 2)
    if random.random() < 0.1:
        price = 0.0 # Some free items

    if category == "Instruments":
        name = f"{random.choice(instrument_prefixes)} {random.choice(instrument_suffixes)} {random.randint(1, 9)}"
        desc = f"A {name.lower()} library for professional composers."
    elif category == "Effects":
        name = f"{random.choice(effect_prefixes)} {random.choice(effect_suffixes)} {random.randint(1, 9)}"
        desc = f"High-quality {name.lower()} plugin."
    else:
        name = f"{random.choice(software_prefixes)} {random.choice(software_suffixes)} {year - 2000}"
        desc = f"Standard software for {year} production."

    full_name = f"{name} v{random.randint(1,5)}.{random.randint(0,9)}"
    encoded_name = urllib.parse.quote(full_name)
    link = f"https://www.bestservice.com/en/search.html?search={encoded_name}"

    return {
        "Year": year,
        "Name": full_name,
        "Category": category,
        "Price": price,
        "Description": desc,
        "Link": link
    }

# Generate ~70 items per category to get ~210 total
for category in categories:
    for i in range(70):
        data[category].append(generate_item(category, i))

# Sort by year descending
for category in categories:
    data[category].sort(key=lambda x: x["Year"], reverse=True)

with open("data/bestservice_products.json", "w") as f:
    json.dump(data, f, indent=2)

print("Generated data/bestservice_products.json with ~210 items.")
