# Working with text

Business software is full of text: document numbers, location IDs, carrier names, messages for users. This lesson shows the tools ABAP gives you to build and take apart text.

## String templates

A string template is text between two `|` characters. Anything inside `{ }` is an ABAP expression whose value gets inserted:

```abap
DATA lv_tor_id TYPE string VALUE '6100000101'.
DATA lv_stops TYPE i VALUE 3.

WRITE / |Freight order { lv_tor_id } has { lv_stops } stops.|.
WRITE / |Next year it will be { 2026 + 1 }.|.
```

You can add formatting options inside the braces. A few useful ones:

```abap
DATA lv_doc TYPE c LENGTH 10 VALUE '0000004711'.
DATA lv_date TYPE d VALUE '20261021'.

WRITE / |{ lv_doc ALPHA = OUT }|.
WRITE / |{ lv_date DATE = ISO }|.
```

`ALPHA = OUT` removes leading zeros. SAP stores many numbers, such as document numbers, with leading zeros, so you'll use it a lot.

## Joining and measuring text

Use `&&` to glue strings together, `strlen( )` to count characters, and `to_upper( )` / `to_lower( )` to change case:

```abap
DATA lv_site TYPE string VALUE 'Grand Rapids'.
DATA lv_label TYPE string.

lv_label = `Plant ` && lv_site.
WRITE / lv_label.
WRITE / |{ strlen( lv_label ) } characters|.
WRITE / to_upper( lv_label ).

lv_label = 'Plant ' && lv_site.
WRITE / lv_label.
```

Look closely at the last line of output: the space is gone. ABAP has two kinds of text literals:

- `'Plant '` in single quotes is a fixed-length text, and ABAP **drops trailing spaces** from it.
- `` `Plant ` `` in backquotes is a **string literal** and keeps every character.

Use backquotes when trailing spaces matter.

`strlen( )` and `to_upper( )` are **built-in functions**. A function call has a space after the opening and before the closing parenthesis: `strlen( lv_label )`, not `strlen(lv_label)`.

## Parts of a string

To take a piece of a text, write `variable+offset(length)`. The offset starts at **0**:

```abap
DATA lv_locid TYPE string VALUE 'PLANT_GRR'.

WRITE / lv_locid+0(5).
WRITE / lv_locid+6(3).
```

## Splitting and searching

`SPLIT` cuts a text at a separator, `FIND` checks whether a text contains something, and `REPLACE` changes it. All three set the system field `sy-subrc`: **0 means success**, anything else means it didn't work or wasn't found.

```abap
DATA lv_locid TYPE string VALUE 'HUB_DTW'.
DATA lv_kind TYPE string.
DATA lv_code TYPE string.

SPLIT lv_locid AT '_' INTO lv_kind lv_code.
WRITE / |Kind: { lv_kind }, code: { lv_code }|.

FIND 'DTW' IN lv_locid.
IF sy-subrc = 0.
  WRITE / 'This location is in Detroit.'.
ENDIF.

REPLACE 'HUB' IN lv_locid WITH 'DC'.
WRITE / lv_locid.
```

> **`c` versus `string`.** A `c LENGTH 10` variable always holds exactly 10 characters and fills the rest with spaces, which ABAP ignores at the end of a text. A `string` is exactly as long as its content. Use `string` for text you build up; you'll meet `c` in database fields.

## Exercise

The stop description below has the form `<sequence>;<location>;<O or I>`. Split it and print the result in the format shown under **Show expected output**.

```abap exercise
DATA lv_stop TYPE string VALUE '2;HUB_DTW;I'.
DATA lv_seq TYPE string.
DATA lv_location TYPE string.
DATA lv_category TYPE string.

" split lv_stop here

WRITE / |Stop { lv_seq } at { lv_location } ({ lv_category })|.
--- solution ---
DATA lv_stop TYPE string VALUE '2;HUB_DTW;I'.
DATA lv_seq TYPE string.
DATA lv_location TYPE string.
DATA lv_category TYPE string.

SPLIT lv_stop AT ';' INTO lv_seq lv_location lv_category.

WRITE / |Stop { lv_seq } at { lv_location } ({ lv_category })|.
--- expected ---
Stop 2 at HUB_DTW (I)
```
