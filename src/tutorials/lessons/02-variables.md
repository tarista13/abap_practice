# Variables and data types

A **variable** is a named place to store a value. In ABAP you declare it with `DATA`, and every variable has a **type** that decides what it can hold.

```abap
DATA lv_stops TYPE i.
DATA lv_carrier TYPE string.

lv_stops = 3.
lv_carrier = 'CARRIER_A'.

WRITE / lv_carrier.
WRITE / lv_stops.
```

The `lv_` prefix is a common naming convention: **l**ocal **v**ariable. You'll also see `ls_` for structures and `lt_` for tables later on. ABAP doesn't require prefixes, but most SAP teams use them.

## Common types

| Type | Holds | Example value |
|---|---|---|
| `i` | whole numbers | `42` |
| `p LENGTH 8 DECIMALS 2` | exact decimal numbers (weights, money) | `1450.50` |
| `string` | text of any length | `'Grand Rapids'` |
| `c LENGTH 10` | text of a fixed length | `'CARRIER_A'` |
| `d` | dates, as `YYYYMMDD` | `'20261021'` |
| `abap_bool` | true or false: `abap_true` (`'X'`) or `abap_false` (`' '`) | `abap_true` |

Use `VALUE` to give a variable a starting value:

```abap
DATA lv_weight TYPE p LENGTH 8 DECIMALS 3 VALUE '1450.5'.
DATA lv_unit TYPE c LENGTH 3 VALUE 'KG'.
DATA lv_pickup TYPE d VALUE '20261021'.
DATA lv_is_hazardous TYPE abap_bool VALUE abap_true.

WRITE / |Weight: { lv_weight } { lv_unit }|.
WRITE / |Pickup: { lv_pickup DATE = ISO }|.
WRITE / |Hazardous goods: { lv_is_hazardous }|.
```

`abap_true` prints as `X`; `abap_false` is a single space, so it prints as nothing.

The `|...{ }...|` syntax is a **string template**, which puts values into text. The next lesson covers it in detail. We use it here because it prints numbers and dates in a predictable format. (`WRITE` on its own formats numbers according to user settings, so in this sandbox `WRITE lv_weight` shows a decimal comma.)

## Calculating

ABAP has the usual arithmetic operators: `+`, `-`, `*`, `/`, plus `DIV` (whole-number division) and `MOD` (remainder). Put spaces around operators and parentheses; ABAP requires them.

```abap
DATA lv_pallets TYPE i VALUE 26.
DATA lv_per_truck TYPE i VALUE 33.
DATA lv_trucks TYPE i.
DATA lv_left_over TYPE i.

lv_pallets = lv_pallets + 45.
lv_trucks = lv_pallets DIV lv_per_truck.
lv_left_over = lv_pallets MOD lv_per_truck.

WRITE / |{ lv_pallets } pallets fill { lv_trucks } trucks, { lv_left_over } pallets left over.|.
```

> **Types matter.** If you divide two whole numbers with `/` and store the result in an `i` variable, ABAP **rounds** it: `7 / 2` stored in an `i` becomes `4`. Store it in a `p ... DECIMALS 2` variable and you get `3.50`. That's why you use `DIV` when you want to cut off the fraction, as for the trucks above.

## Constants

A **constant** is a value that never changes. Declaring it with a name makes code easier to read than scattering the same number everywhere:

```abap
CONSTANTS lc_kg_per_lb TYPE p LENGTH 8 DECIMALS 5 VALUE '0.45359'.
DATA lv_pounds TYPE i VALUE 1760.
DATA lv_kilos TYPE p LENGTH 10 DECIMALS 2.

lv_kilos = lv_pounds * lc_kg_per_lb.
WRITE / |{ lv_pounds } LB = { lv_kilos } KG|.
```

## Practice

What does this print? Think about the type of each variable.

```abap predict
DATA lv_pallets TYPE i VALUE 7.
DATA lv_trucks TYPE i.
DATA lv_exact TYPE p LENGTH 8 DECIMALS 2.

lv_trucks = lv_pallets / 2.
lv_exact = lv_pallets / 2.

WRITE / |{ lv_trucks }|.
WRITE / |{ lv_exact }|.
WRITE / |{ lv_pallets DIV 2 } and { lv_pallets MOD 2 }|.
--- explain ---
`7 / 2` is 3.5. Stored in the integer `lv_trucks`, it's **rounded** to `4`. The packed number `lv_exact` keeps it as `3.50`. `DIV` cuts the fraction off instead (`3`), and `MOD` gives the remainder (`1`).
```

Now build a small capacity calculator for a truck, starting from an empty program.

```abap steps
" Write your program here
--- step ---
Declare an integer variable `lv_capacity` with the value `24000` and print it as `Capacity: 24000 KG`.
--- expected ---
Capacity: 24000 KG
--- requires ---
DATA\s+lv_capacity\s+TYPE\s+i\b :: Declare lv_capacity with DATA ... TYPE i.
\{\s*lv_capacity\s*\} :: Print the variable with a string template like |... { lv_capacity } ...|, instead of typing the number into the text.
--- hint ---
`DATA name TYPE i VALUE 123.` declares a variable with a starting value.
--- hint ---
`WRITE / |Capacity: { lv_capacity } KG|.`
--- solution ---
DATA lv_capacity TYPE i VALUE 24000.
WRITE / |Capacity: { lv_capacity } KG|.
--- step ---
The truck is already loaded with 15,250.5 KG. That needs decimals, so declare `lv_loaded` as a **packed number** with one decimal place, and print it on a second line: `Loaded: 15250.5 KG`.
--- expected ---
Capacity: 24000 KG
Loaded: 15250.5 KG
--- requires ---
lv_loaded\s+TYPE\s+p\b :: Declare lv_loaded as a packed number (TYPE p).
\{\s*lv_loaded\s*\} :: Print lv_loaded with a string template.
--- hint ---
A packed number type looks like `TYPE p LENGTH 10 DECIMALS 1`.
--- hint ---
The VALUE of a decimal number goes in quotes: `VALUE '15250.5'`.
--- solution ---
DATA lv_capacity TYPE i VALUE 24000.
DATA lv_loaded TYPE p LENGTH 10 DECIMALS 1 VALUE '15250.5'.
WRITE / |Capacity: { lv_capacity } KG|.
WRITE / |Loaded: { lv_loaded } KG|.
--- step ---
Calculate how much capacity is left in a new variable `lv_remaining` and print it as a third line: `Remaining: 8749.5 KG`.
--- expected ---
Capacity: 24000 KG
Loaded: 15250.5 KG
Remaining: 8749.5 KG
--- requires ---
lv_remaining\s*=[^\n]*- :: Calculate lv_remaining with a subtraction (lv_remaining = ... - ...).
--- hint ---
Which type does `lv_remaining` need so it can hold `.5`?
--- hint ---
`lv_remaining = lv_capacity - lv_loaded.`
--- solution ---
DATA lv_capacity TYPE i VALUE 24000.
DATA lv_loaded TYPE p LENGTH 10 DECIMALS 1 VALUE '15250.5'.
DATA lv_remaining TYPE p LENGTH 10 DECIMALS 1.
lv_remaining = lv_capacity - lv_loaded.
WRITE / |Capacity: { lv_capacity } KG|.
WRITE / |Loaded: { lv_loaded } KG|.
WRITE / |Remaining: { lv_remaining } KG|.
--- step ---
Pallets weigh 750 KG each. Add a last line saying how many **whole** pallets still fit: `Pallets that fit: 11`.
--- expected ---
Capacity: 24000 KG
Loaded: 15250.5 KG
Remaining: 8749.5 KG
Pallets that fit: 11
--- requires ---
\bDIV\b :: Use DIV, so the fraction of a pallet is cut off instead of rounded.
--- hint ---
8749.5 / 750 is 11.66. You can't load two-thirds of a pallet, and rounding would give 12.
--- hint ---
`lv_remaining DIV 750` gives the whole number of pallets. You can put it straight into a string template.
--- solution ---
DATA lv_capacity TYPE i VALUE 24000.
DATA lv_loaded TYPE p LENGTH 10 DECIMALS 1 VALUE '15250.5'.
DATA lv_remaining TYPE p LENGTH 10 DECIMALS 1.
lv_remaining = lv_capacity - lv_loaded.
WRITE / |Capacity: { lv_capacity } KG|.
WRITE / |Loaded: { lv_loaded } KG|.
WRITE / |Remaining: { lv_remaining } KG|.
WRITE / |Pallets that fit: { lv_remaining DIV 750 }|.
```

A US supplier sends weights in pounds. Convert them, this time with less guidance.

```abap steps
" Write your program here
--- step ---
Declare a **constant** for the conversion factor, 0.45359 KG per LB, and an integer variable with the shipment weight of `1760` LB. Print `Shipment: 1760 LB`.
--- expected ---
Shipment: 1760 LB
--- requires ---
CONSTANTS :: Declare the conversion factor with CONSTANTS.
--- hint ---
`CONSTANTS lc_name TYPE p LENGTH 8 DECIMALS 5 VALUE '0.45359'.`
--- solution ---
CONSTANTS lc_kg_per_lb TYPE p LENGTH 8 DECIMALS 5 VALUE '0.45359'.
DATA lv_pounds TYPE i VALUE 1760.
WRITE / |Shipment: { lv_pounds } LB|.
--- step ---
Convert the weight to kilograms with two decimal places and change the line to `Shipment: 1760 LB = 798.32 KG`.
--- expected ---
Shipment: 1760 LB = 798.32 KG
--- requires ---
\* :: Multiply by your constant to convert.
--- hint ---
You need a new packed variable with `DECIMALS 2` for the result.
--- solution ---
CONSTANTS lc_kg_per_lb TYPE p LENGTH 8 DECIMALS 5 VALUE '0.45359'.
DATA lv_pounds TYPE i VALUE 1760.
DATA lv_kilos TYPE p LENGTH 10 DECIMALS 2.
lv_kilos = lv_pounds * lc_kg_per_lb.
WRITE / |Shipment: { lv_pounds } LB = { lv_kilos } KG|.
--- step ---
A pallet holds at most 1000 KG. Print a second line with the space left on the pallet: `Space left: 201.68 KG`.
--- expected ---
Shipment: 1760 LB = 798.32 KG
Space left: 201.68 KG
--- hint ---
Subtract the kilograms from 1000. Should 1000 be a constant too?
--- solution ---
CONSTANTS lc_kg_per_lb TYPE p LENGTH 8 DECIMALS 5 VALUE '0.45359'.
CONSTANTS lc_pallet_max TYPE i VALUE 1000.
DATA lv_pounds TYPE i VALUE 1760.
DATA lv_kilos TYPE p LENGTH 10 DECIMALS 2.
DATA lv_space TYPE p LENGTH 10 DECIMALS 2.
lv_kilos = lv_pounds * lc_kg_per_lb.
lv_space = lc_pallet_max - lv_kilos.
WRITE / |Shipment: { lv_pounds } LB = { lv_kilos } KG|.
WRITE / |Space left: { lv_space } KG|.
```
