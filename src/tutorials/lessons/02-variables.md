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

## Exercise

A truck can carry 24,000 KG. It is already loaded with 15,250.5 KG. Complete the program so it calculates and prints the remaining capacity.

```abap exercise
DATA lv_capacity TYPE p LENGTH 10 DECIMALS 1 VALUE '24000'.
DATA lv_loaded TYPE p LENGTH 10 DECIMALS 1 VALUE '15250.5'.
DATA lv_remaining TYPE p LENGTH 10 DECIMALS 1.

" calculate lv_remaining here

WRITE / |Remaining capacity: { lv_remaining } KG|.
--- solution ---
DATA lv_capacity TYPE p LENGTH 10 DECIMALS 1 VALUE '24000'.
DATA lv_loaded TYPE p LENGTH 10 DECIMALS 1 VALUE '15250.5'.
DATA lv_remaining TYPE p LENGTH 10 DECIMALS 1.

lv_remaining = lv_capacity - lv_loaded.

WRITE / |Remaining capacity: { lv_remaining } KG|.
--- expected ---
Remaining capacity: 8749.5 KG
```
