import pdfplumber, re, json
from collections import defaultdict

PDF = "nutrition-data/CAN_Nutrition_EN_4-16-26.pdf"
# 13 numeric columns; we keep the first 11 (serving + 10 macros), drop Calcium/Iron %DV.
COLS = ["weight_g", "calories_kcal", "fat_g", "saturated_fat_g", "trans_fat_g",
        "cholesterol_mg", "sodium_mg", "carbohydrates_g", "fibre_g", "total_sugars_g", "protein_g"]

def is_num(t): return bool(re.fullmatch(r"\d+(\.\d+)?", t))
def fnum(t):
    try: return float(t)
    except: return None
def clean(s):
    s = re.sub(r"[^\x00-\x7F]", "", s)  # drop ® and other non-ASCII glyphs
    s = re.sub(r"\*+", "", s)
    s = re.sub(r"\(as packaged\)\s*1?", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def section_of(name):
    n = name.lower()
    if n.startswith("breads"): return "breads"
    if "sandwich condiments" in n: return "sauces"
    if n.startswith("seasonings"): return "skip"
    if n.startswith("vegetables"): return "veggies"
    if n.startswith("cheese") and "amount" in n: return "cheeses"
    if "individual proteins" in n: return "proteins"
    if n.startswith("cookies"): return "cookies"
    if n.startswith("sides"): return "sides"
    if n.startswith("soup"): return "soups"
    if any(n.startswith(h) for h in
           ["sandwiches", "wraps", "salads", "power bowls", "breakfast", "desserts",
            "great canadian", "snackwiches", "6\"", "canada nutrition"]):
        return "skip"
    return None  # not a header row

pdf = pdfplumber.open(PDF)
components = {"breads": [], "proteins": [], "cheeses": [], "veggies": [], "sauces": []}
menu = {"cookies": [], "sides": [], "soups": []}
SKIP_NAMES = {"Wild Rice (4 oz)", "Salt", "Pepper"}

current = None
pending = None
for pi in [1, 2]:
    page = pdf.pages[pi]
    words = page.extract_words(keep_blank_chars=False)
    rows = defaultdict(list)
    for w in words:
        rows[round(w["top"] / 2.0)].append(w)
    for t in sorted(rows):
        line = sorted(rows[t], key=lambda w: w["x0"])
        nums = [w for w in line if is_num(w["text"]) and w["x0"] >= 220]
        name = clean(" ".join(w["text"] for w in line if w["x0"] < 210 and not (is_num(w["text"]) and w["x0"] >= 220)))
        if len(nums) < 11:  # header or floating name row
            sec = section_of(name)
            if sec is not None:
                current = sec
                pending = None
            elif name:
                pending = name
            continue
        # data row
        nm = name if name else (pending or "")
        pending = None
        if not nm or current in (None, "skip"):
            continue
        vals = [fnum(w["text"]) for w in sorted(nums, key=lambda w: w["x0"])[:11]]
        if current == "breads":
            nm = re.sub(r'^6"\s*', "", nm)
        if nm in SKIP_NAMES:
            continue
        entry = {"name": nm, "nutrition": dict(zip(COLS, vals))}
        if current in components:
            components[current].append(entry)
        elif current in menu:
            menu[current].append({**entry, "subcategory": current.capitalize()})

# ---- write component file (for the builder) ----
json.dump({"components": components}, open("data/components.json", "w"), indent=1)

# ---- write standalone menu items ----
CAT = {"cookies": "Cookies & Desserts", "sides": "Sides", "soups": "Soups"}
items = []
for key, label in CAT.items():
    for e in menu[key]:
        items.append({
            "name": e["name"], "category": label, "subcategory": label,
            "serving": "1 serving", "nutrition": e["nutrition"],
        })
json.dump({"items": items}, open("data/menu_items.json", "w"), indent=1)

# ---- report ----
for k, v in components.items():
    print(f"{k:9s} ({len(v)}):", [x['name'] for x in v])
print()
print("menu items:", len(items))
for it in items:
    print(f"  {it['category'][:18]:18s} | {it['name'][:34]:34s} | {it['nutrition']['calories_kcal']}c")
