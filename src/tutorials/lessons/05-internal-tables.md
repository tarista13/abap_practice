# Structures and internal tables

A freight order isn't one value, it's many: a number, a carrier, a status, a weight. And it doesn't have one stop, it has several. ABAP has two building blocks for this:

- A **structure** groups several fields into one record.
- An **internal table** holds many records of the same kind, like rows in a spreadsheet, in memory while your program runs.

Internal tables are the most important data type in ABAP. Almost every program reads data into them, loops over them, and changes them.

## Structures

Define the shape of a record with `TYPES BEGIN OF ... END OF`, then declare a variable of that type. Access a field with a dash: `ls_stop-location`.

```abap
TYPES: BEGIN OF ty_stop,
         seq      TYPE i,
         location TYPE string,
         category TYPE c LENGTH 1,
       END OF ty_stop.

DATA ls_stop TYPE ty_stop.

ls_stop-seq = 1.
ls_stop-location = 'PLANT_GRR'.
ls_stop-category = 'O'.

WRITE / |Stop { ls_stop-seq }: { ls_stop-location } ({ ls_stop-category })|.
```

## Internal tables

Declare a table with `TYPE STANDARD TABLE OF <row type>`. `APPEND` adds a row at the end, `lines( )` counts the rows, and `LOOP AT ... INTO` goes through them one by one:

```abap
TYPES: BEGIN OF ty_stop,
         seq      TYPE i,
         location TYPE string,
       END OF ty_stop.

DATA lt_stops TYPE STANDARD TABLE OF ty_stop WITH EMPTY KEY.
DATA ls_stop TYPE ty_stop.

ls_stop-seq = 1.
ls_stop-location = 'PLANT_GRR'.
APPEND ls_stop TO lt_stops.

ls_stop-seq = 2.
ls_stop-location = 'HUB_DTW'.
APPEND ls_stop TO lt_stops.

WRITE / |The route has { lines( lt_stops ) } stops:|.
LOOP AT lt_stops INTO ls_stop.
  WRITE / |  { sy-tabix }. { ls_stop-location }|.
ENDLOOP.
```

Inside a `LOOP`, the system field `sy-tabix` holds the number of the current row.

## Filling a table in one go

The `VALUE` operator builds a whole table at once. Each row goes in its own parentheses:

```abap
TYPES: BEGIN OF ty_item,
         descr  TYPE string,
         weight TYPE i,
       END OF ty_item.

DATA lt_items TYPE STANDARD TABLE OF ty_item WITH EMPTY KEY.
DATA ls_item TYPE ty_item.

lt_items = VALUE #(
  ( descr = 'Office chairs' weight = 950 )
  ( descr = 'Desks'         weight = 500 )
  ( descr = 'Lamps'         weight = 300 ) ).

SORT lt_items BY weight DESCENDING.

LOOP AT lt_items INTO ls_item WHERE weight >= 500.
  WRITE / |{ ls_item-descr }: { ls_item-weight } KG|.
ENDLOOP.
```

`SORT ... BY` orders the rows, and `LOOP AT ... WHERE` only visits the rows that match the condition.

## Reading single rows

To get one specific row, use `READ TABLE`. It sets `sy-subrc` to 0 if it found a row:

```abap
TYPES: BEGIN OF ty_stop,
         seq      TYPE i,
         location TYPE string,
       END OF ty_stop.

DATA lt_stops TYPE STANDARD TABLE OF ty_stop WITH EMPTY KEY.
DATA ls_stop TYPE ty_stop.

lt_stops = VALUE #(
  ( seq = 1 location = 'PLANT_GRR' )
  ( seq = 2 location = 'HUB_DTW' )
  ( seq = 3 location = 'DC_CHI' ) ).

READ TABLE lt_stops INTO ls_stop WITH KEY location = 'HUB_DTW'.
IF sy-subrc = 0.
  WRITE / |HUB_DTW is stop number { ls_stop-seq }.|.
ENDIF.

READ TABLE lt_stops INTO ls_stop INDEX 3.
WRITE / |The last stop is { ls_stop-location }.|.

" A table expression does the same in one line
WRITE / |The first stop is { lt_stops[ 1 ]-location }.|.
```

> **Careful with table expressions.** `lt_stops[ 5 ]` doesn't set `sy-subrc` when the row doesn't exist; it raises an **exception** that stops the program. Change the `1` above to `5` and run it to see.

## Changing and deleting rows

To change rows while looping, loop with `ASSIGNING` a **field symbol** instead of `INTO` a copy. A field symbol, written `<name>`, points directly at the row in the table, so assigning a value to it changes the table:

```abap
TYPES: BEGIN OF ty_item,
         descr  TYPE string,
         weight TYPE i,
       END OF ty_item.

DATA lt_items TYPE STANDARD TABLE OF ty_item WITH EMPTY KEY.
DATA ls_item TYPE ty_item.
FIELD-SYMBOLS <ls_item> TYPE ty_item.

lt_items = VALUE #(
  ( descr = 'Pallet'        weight = 20 )
  ( descr = 'Office chairs' weight = 950 ) ).

" add 5 KG of packaging to every item
LOOP AT lt_items ASSIGNING <ls_item>.
  <ls_item>-weight = <ls_item>-weight + 5.
ENDLOOP.

DELETE lt_items WHERE descr = 'Pallet'.

LOOP AT lt_items INTO ls_item.
  WRITE / |{ ls_item-descr }: { ls_item-weight } KG|.
ENDLOOP.
```

## Practice

What does this print? Pay attention to `sy-tabix` after sorting.

```abap predict
DATA lt_weights TYPE STANDARD TABLE OF i WITH EMPTY KEY.
DATA lv_weight TYPE i.

lt_weights = VALUE #( ( 300 ) ( 100 ) ( 200 ) ).
APPEND 50 TO lt_weights.
SORT lt_weights.

LOOP AT lt_weights INTO lv_weight WHERE table_line > 80.
  WRITE / |{ sy-tabix }: { lv_weight }|.
ENDLOOP.
--- explain ---
After `APPEND` the table is 300, 100, 200, 50, and `SORT` puts it in ascending order: 50, 100, 200, 300. The `WHERE` skips 50, but `sy-tabix` is still the row's position in the table, so the first printed row is number 2, not 1. (`table_line` means "the whole row", for tables whose rows are simple values like these.)
```

Build a route from scratch: a structure type, a table, and a few ways of reading it.

```abap steps
" Write your program here
--- step ---
Define a structure type `ty_stop` with an integer `seq` and a string `location`, and an internal table `lt_stops` of it. Fill it with three stops: 1 `PLANT_GRR`, 2 `HUB_DTW`, 3 `DC_CHI`. Then print how many rows the table has: `3 stops`.
--- expected ---
3 stops
--- requires ---
BEGIN\s+OF\s+ty_stop :: Define the structure type with TYPES: BEGIN OF ty_stop ... END OF ty_stop.
lines\( :: Count the rows with lines( ), don't type the 3 in.
--- hint ---
`VALUE #( ( seq = 1 location = '...' ) ( ... ) )` fills the whole table at once.
--- hint ---
`|{ lines( lt_stops ) } stops|`
--- solution ---
TYPES: BEGIN OF ty_stop,
         seq      TYPE i,
         location TYPE string,
       END OF ty_stop.

DATA lt_stops TYPE STANDARD TABLE OF ty_stop WITH EMPTY KEY.

lt_stops = VALUE #(
  ( seq = 1 location = 'PLANT_GRR' )
  ( seq = 2 location = 'HUB_DTW' )
  ( seq = 3 location = 'DC_CHI' ) ).

WRITE / |{ lines( lt_stops ) } stops|.
--- step ---
Below that, print each stop as `<seq>: <location>`.
--- expected ---
3 stops
1: PLANT_GRR
2: HUB_DTW
3: DC_CHI
--- requires ---
LOOP\s+AT :: Use LOOP AT.
--- hint ---
You need a work area variable of type `ty_stop` to `LOOP AT ... INTO`.
--- solution ---
TYPES: BEGIN OF ty_stop,
         seq      TYPE i,
         location TYPE string,
       END OF ty_stop.

DATA lt_stops TYPE STANDARD TABLE OF ty_stop WITH EMPTY KEY.
DATA ls_stop TYPE ty_stop.

lt_stops = VALUE #(
  ( seq = 1 location = 'PLANT_GRR' )
  ( seq = 2 location = 'HUB_DTW' )
  ( seq = 3 location = 'DC_CHI' ) ).

WRITE / |{ lines( lt_stops ) } stops|.
LOOP AT lt_stops INTO ls_stop.
  WRITE / |{ ls_stop-seq }: { ls_stop-location }|.
ENDLOOP.
--- step ---
After the list, look up the stop at `HUB_DTW` **by its location** and print `HUB_DTW is stop 2`, taking the 2 from the row you found.
--- expected ---
3 stops
1: PLANT_GRR
2: HUB_DTW
3: DC_CHI
HUB_DTW is stop 2
--- requires ---
READ\s+TABLE[\s\S]*WITH\s+KEY :: Use READ TABLE ... WITH KEY location = ...
--- hint ---
`READ TABLE lt_stops INTO ls_stop WITH KEY location = 'HUB_DTW'.`
--- hint ---
Check `sy-subrc = 0` before using the row; that's how you know it was found.
--- solution ---
TYPES: BEGIN OF ty_stop,
         seq      TYPE i,
         location TYPE string,
       END OF ty_stop.

DATA lt_stops TYPE STANDARD TABLE OF ty_stop WITH EMPTY KEY.
DATA ls_stop TYPE ty_stop.

lt_stops = VALUE #(
  ( seq = 1 location = 'PLANT_GRR' )
  ( seq = 2 location = 'HUB_DTW' )
  ( seq = 3 location = 'DC_CHI' ) ).

WRITE / |{ lines( lt_stops ) } stops|.
LOOP AT lt_stops INTO ls_stop.
  WRITE / |{ ls_stop-seq }: { ls_stop-location }|.
ENDLOOP.

READ TABLE lt_stops INTO ls_stop WITH KEY location = 'HUB_DTW'.
IF sy-subrc = 0.
  WRITE / |{ ls_stop-location } is stop { ls_stop-seq }|.
ENDIF.
--- step ---
The route gets a fourth stop: 4 `DC_MSP`. Add it with `APPEND` (not in the `VALUE`), and list the stops in **reverse** order, last stop first. The count and the lookup should still work.
--- expected ---
4 stops
4: DC_MSP
3: DC_CHI
2: HUB_DTW
1: PLANT_GRR
HUB_DTW is stop 2
--- requires ---
\bAPPEND\b :: Add the new stop with APPEND.
\bSORT\b :: Use SORT to reverse the order.
--- hint ---
Fill a work area with the new stop's fields, then `APPEND ls_stop TO lt_stops.`
--- hint ---
`SORT lt_stops BY seq DESCENDING.` Where does it need to go?
--- solution ---
TYPES: BEGIN OF ty_stop,
         seq      TYPE i,
         location TYPE string,
       END OF ty_stop.

DATA lt_stops TYPE STANDARD TABLE OF ty_stop WITH EMPTY KEY.
DATA ls_stop TYPE ty_stop.

lt_stops = VALUE #(
  ( seq = 1 location = 'PLANT_GRR' )
  ( seq = 2 location = 'HUB_DTW' )
  ( seq = 3 location = 'DC_CHI' ) ).

ls_stop-seq = 4.
ls_stop-location = 'DC_MSP'.
APPEND ls_stop TO lt_stops.
SORT lt_stops BY seq DESCENDING.

WRITE / |{ lines( lt_stops ) } stops|.
LOOP AT lt_stops INTO ls_stop.
  WRITE / |{ ls_stop-seq }: { ls_stop-location }|.
ENDLOOP.

READ TABLE lt_stops INTO ls_stop WITH KEY location = 'HUB_DTW'.
IF sy-subrc = 0.
  WRITE / |{ ls_stop-location } is stop { ls_stop-seq }|.
ENDIF.
```

Now analyze the items of a freight order. The table is filled for you; the logic is yours.

```abap steps
TYPES: BEGIN OF ty_item,
         descr  TYPE string,
         weight TYPE i,
       END OF ty_item.

DATA lt_items TYPE STANDARD TABLE OF ty_item WITH EMPTY KEY.

lt_items = VALUE #(
  ( descr = 'Office chairs'   weight = 950 )
  ( descr = 'Desks'           weight = 500 )
  ( descr = 'Lamps'           weight = 300 )
  ( descr = 'Filing cabinets' weight = 800 )
  ( descr = 'Monitor arms'    weight = 120 ) ).
--- step ---
Print the total weight of all items: `Total: 2670 KG`.
--- expected ---
Total: 2670 KG
--- requires ---
LOOP\s+AT :: Add the weights up in a LOOP AT.
--- hint ---
Keep a running total in a variable: add each item's weight to it inside the loop.
--- solution ---
TYPES: BEGIN OF ty_item,
         descr  TYPE string,
         weight TYPE i,
       END OF ty_item.

DATA lt_items TYPE STANDARD TABLE OF ty_item WITH EMPTY KEY.
DATA ls_item TYPE ty_item.
DATA lv_total TYPE i.

lt_items = VALUE #(
  ( descr = 'Office chairs'   weight = 950 )
  ( descr = 'Desks'           weight = 500 )
  ( descr = 'Lamps'           weight = 300 )
  ( descr = 'Filing cabinets' weight = 800 )
  ( descr = 'Monitor arms'    weight = 120 ) ).

LOOP AT lt_items INTO ls_item.
  lv_total = lv_total + ls_item-weight.
ENDLOOP.

WRITE / |Total: { lv_total } KG|.
--- step ---
Also count the items heavier than 400 KG and print `Heavy items: 3` as a second line.
--- expected ---
Total: 2670 KG
Heavy items: 3
--- hint ---
A second counter variable, increased inside an `IF` in the same loop.
--- solution ---
TYPES: BEGIN OF ty_item,
         descr  TYPE string,
         weight TYPE i,
       END OF ty_item.

DATA lt_items TYPE STANDARD TABLE OF ty_item WITH EMPTY KEY.
DATA ls_item TYPE ty_item.
DATA lv_total TYPE i.
DATA lv_heavy TYPE i.

lt_items = VALUE #(
  ( descr = 'Office chairs'   weight = 950 )
  ( descr = 'Desks'           weight = 500 )
  ( descr = 'Lamps'           weight = 300 )
  ( descr = 'Filing cabinets' weight = 800 )
  ( descr = 'Monitor arms'    weight = 120 ) ).

LOOP AT lt_items INTO ls_item.
  lv_total = lv_total + ls_item-weight.
  IF ls_item-weight > 400.
    lv_heavy = lv_heavy + 1.
  ENDIF.
ENDLOOP.

WRITE / |Total: { lv_total } KG|.
WRITE / |Heavy items: { lv_heavy }|.
--- step ---
Print the description of the heaviest item as a third line: `Heaviest: Office chairs`. There's more than one way to do this.
--- expected ---
Total: 2670 KG
Heavy items: 3
Heaviest: Office chairs
--- hint ---
One way: sort the table by weight, heaviest first, and read row 1.
--- hint ---
Another way: in the loop, remember the item whenever its weight is bigger than the biggest one so far.
--- solution ---
TYPES: BEGIN OF ty_item,
         descr  TYPE string,
         weight TYPE i,
       END OF ty_item.

DATA lt_items TYPE STANDARD TABLE OF ty_item WITH EMPTY KEY.
DATA ls_item TYPE ty_item.
DATA lv_total TYPE i.
DATA lv_heavy TYPE i.

lt_items = VALUE #(
  ( descr = 'Office chairs'   weight = 950 )
  ( descr = 'Desks'           weight = 500 )
  ( descr = 'Lamps'           weight = 300 )
  ( descr = 'Filing cabinets' weight = 800 )
  ( descr = 'Monitor arms'    weight = 120 ) ).

LOOP AT lt_items INTO ls_item.
  lv_total = lv_total + ls_item-weight.
  IF ls_item-weight > 400.
    lv_heavy = lv_heavy + 1.
  ENDIF.
ENDLOOP.

SORT lt_items BY weight DESCENDING.

WRITE / |Total: { lv_total } KG|.
WRITE / |Heavy items: { lv_heavy }|.
WRITE / |Heaviest: { lt_items[ 1 ]-descr }|.
--- step ---
Every item gets 5 KG of packaging. Add it to each row **in the table**, before the other calculations, using a field symbol.
--- expected ---
Total: 2695 KG
Heavy items: 3
Heaviest: Office chairs
--- requires ---
ASSIGNING :: Change the rows in place with LOOP AT ... ASSIGNING <field symbol>.
--- hint ---
`FIELD-SYMBOLS <ls_item> TYPE ty_item.` then `LOOP AT lt_items ASSIGNING <ls_item>.`
--- solution ---
TYPES: BEGIN OF ty_item,
         descr  TYPE string,
         weight TYPE i,
       END OF ty_item.

DATA lt_items TYPE STANDARD TABLE OF ty_item WITH EMPTY KEY.
DATA ls_item TYPE ty_item.
DATA lv_total TYPE i.
DATA lv_heavy TYPE i.
FIELD-SYMBOLS <ls_item> TYPE ty_item.

lt_items = VALUE #(
  ( descr = 'Office chairs'   weight = 950 )
  ( descr = 'Desks'           weight = 500 )
  ( descr = 'Lamps'           weight = 300 )
  ( descr = 'Filing cabinets' weight = 800 )
  ( descr = 'Monitor arms'    weight = 120 ) ).

LOOP AT lt_items ASSIGNING <ls_item>.
  <ls_item>-weight = <ls_item>-weight + 5.
ENDLOOP.

LOOP AT lt_items INTO ls_item.
  lv_total = lv_total + ls_item-weight.
  IF ls_item-weight > 400.
    lv_heavy = lv_heavy + 1.
  ENDIF.
ENDLOOP.

SORT lt_items BY weight DESCENDING.

WRITE / |Total: { lv_total } KG|.
WRITE / |Heavy items: { lv_heavy }|.
WRITE / |Heaviest: { lt_items[ 1 ]-descr }|.
```
