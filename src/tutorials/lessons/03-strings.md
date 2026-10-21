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

## Practice

What does this print? Watch the quotes closely.

```abap predict
DATA lv_text TYPE string.

lv_text = 'DC ' && 'CHI'.
WRITE / lv_text.

lv_text = `DC ` && `CHI`.
WRITE / lv_text.
WRITE / |{ strlen( lv_text ) }|.
WRITE / lv_text+3(3).
--- explain ---
With single quotes the trailing space of `'DC '` is dropped, so you get `DCCHI`. Backquotes keep it: `DC CHI`, which is 6 characters long. Offset 3 is the fourth character (offsets start at 0), so `+3(3)` is `CHI`.
```

A stop arrives from another system as one line of text. Take it apart, step by step.

```abap steps
DATA lv_stop TYPE string VALUE '2;HUB_DTW;I'.
--- step ---
`lv_stop` holds a stop as `<sequence>;<location>;<category>`. Split it into three variables of your own and print the sequence as `Sequence: 2`.
--- expected ---
Sequence: 2
--- requires ---
\bSPLIT\b :: Use SPLIT to take the text apart.
--- hint ---
Declare three `string` variables, then `SPLIT lv_stop AT ';' INTO ... ... ... .`
--- hint ---
Print only the first of the three variables for now.
--- solution ---
DATA lv_stop TYPE string VALUE '2;HUB_DTW;I'.
DATA lv_seq TYPE string.
DATA lv_location TYPE string.
DATA lv_category TYPE string.

SPLIT lv_stop AT ';' INTO lv_seq lv_location lv_category.
WRITE / |Sequence: { lv_seq }|.
--- step ---
Print the location on a second line: `Location: HUB_DTW`.
--- expected ---
Sequence: 2
Location: HUB_DTW
--- hint ---
You already have the location in one of your variables.
--- solution ---
DATA lv_stop TYPE string VALUE '2;HUB_DTW;I'.
DATA lv_seq TYPE string.
DATA lv_location TYPE string.
DATA lv_category TYPE string.

SPLIT lv_stop AT ';' INTO lv_seq lv_location lv_category.
WRITE / |Sequence: { lv_seq }|.
WRITE / |Location: { lv_location }|.
--- step ---
Location IDs have the form `<kind>_<code>`. Take the location apart too and print a third line `HUB code: DTW`, using the kind and the code from your variables (not typed in).
--- expected ---
Sequence: 2
Location: HUB_DTW
HUB code: DTW
--- requires ---
SPLIT[\s\S]*SPLIT :: Use a second SPLIT on the location.
!'HUB :: Don't type HUB into your text; use the variable that holds the kind.
--- hint ---
The separator this time is `_`.
--- hint ---
`|{ lv_kind } code: { lv_code }|`
--- solution ---
DATA lv_stop TYPE string VALUE '2;HUB_DTW;I'.
DATA lv_seq TYPE string.
DATA lv_location TYPE string.
DATA lv_category TYPE string.
DATA lv_kind TYPE string.
DATA lv_code TYPE string.

SPLIT lv_stop AT ';' INTO lv_seq lv_location lv_category.
SPLIT lv_location AT '_' INTO lv_kind lv_code.
WRITE / |Sequence: { lv_seq }|.
WRITE / |Location: { lv_location }|.
WRITE / |{ lv_kind } code: { lv_code }|.
--- step ---
Finish with a summary line built from **one** string template: `Stop 2 at HUB_DTW (I)`.
--- expected ---
Sequence: 2
Location: HUB_DTW
HUB code: DTW
Stop 2 at HUB_DTW (I)
--- hint ---
A string template can contain several `{ }` expressions.
--- solution ---
DATA lv_stop TYPE string VALUE '2;HUB_DTW;I'.
DATA lv_seq TYPE string.
DATA lv_location TYPE string.
DATA lv_category TYPE string.
DATA lv_kind TYPE string.
DATA lv_code TYPE string.

SPLIT lv_stop AT ';' INTO lv_seq lv_location lv_category.
SPLIT lv_location AT '_' INTO lv_kind lv_code.
WRITE / |Sequence: { lv_seq }|.
WRITE / |Location: { lv_location }|.
WRITE / |{ lv_kind } code: { lv_code }|.
WRITE / |Stop { lv_seq } at { lv_location } ({ lv_category })|.
```

Document numbers in SAP are stored with leading zeros. Clean one up for display.

```abap steps
DATA lv_tor_id TYPE c LENGTH 20 VALUE '00000000006100000101'.
--- step ---
Print the freight order number without its leading zeros: `Order: 6100000101`.
--- expected ---
Order: 6100000101
--- requires ---
ALPHA\s*=\s*OUT :: Use the ALPHA = OUT formatting option instead of cutting characters off by hand.
--- hint ---
Formatting options go inside the `{ }` of a string template, after the variable.
--- solution ---
DATA lv_tor_id TYPE c LENGTH 20 VALUE '00000000006100000101'.
WRITE / |Order: { lv_tor_id ALPHA = OUT }|.
--- step ---
Store the short number in a `string` variable and print its length as a second line: `Length: 10`.
--- expected ---
Order: 6100000101
Length: 10
--- requires ---
strlen\( :: Use strlen( ) to get the length.
--- hint ---
You can assign a string template to a variable: `lv_short = |{ ... }|.`
--- hint ---
Why not `strlen( lv_tor_id )`? Try it. A `c LENGTH 20` field always has 20 characters.
--- solution ---
DATA lv_tor_id TYPE c LENGTH 20 VALUE '00000000006100000101'.
DATA lv_short TYPE string.
lv_short = |{ lv_tor_id ALPHA = OUT }|.
WRITE / |Order: { lv_short }|.
WRITE / |Length: { strlen( lv_short ) }|.
--- step ---
The first two digits tell the document type: `61` means freight order. Print them as a third line: `Type prefix: 61`.
--- expected ---
Order: 6100000101
Length: 10
Type prefix: 61
--- requires ---
\(\s*2\s*\) :: Take the first two characters with offset and length, like lv_x+0(2).
--- hint ---
Offsets start at 0.
--- solution ---
DATA lv_tor_id TYPE c LENGTH 20 VALUE '00000000006100000101'.
DATA lv_short TYPE string.
lv_short = |{ lv_tor_id ALPHA = OUT }|.
WRITE / |Order: { lv_short }|.
WRITE / |Length: { strlen( lv_short ) }|.
WRITE / |Type prefix: { lv_short+0(2) }|.
```
