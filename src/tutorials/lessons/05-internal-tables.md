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

## Exercise

Add up the weight of all items and print the total. Then print how many items weigh more than 400 KG.

```abap exercise
TYPES: BEGIN OF ty_item,
         descr  TYPE string,
         weight TYPE i,
       END OF ty_item.

DATA lt_items TYPE STANDARD TABLE OF ty_item WITH EMPTY KEY.
DATA ls_item TYPE ty_item.
DATA lv_total TYPE i.
DATA lv_heavy TYPE i.

lt_items = VALUE #(
  ( descr = 'Office chairs'     weight = 950 )
  ( descr = 'Desks'             weight = 500 )
  ( descr = 'Lamps'             weight = 300 )
  ( descr = 'Filing cabinets'   weight = 800 )
  ( descr = 'Monitor arms'      weight = 120 ) ).

" loop over lt_items here

WRITE / |Total weight: { lv_total } KG|.
WRITE / |Heavy items: { lv_heavy }|.
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
  ( descr = 'Office chairs'     weight = 950 )
  ( descr = 'Desks'             weight = 500 )
  ( descr = 'Lamps'             weight = 300 )
  ( descr = 'Filing cabinets'   weight = 800 )
  ( descr = 'Monitor arms'      weight = 120 ) ).

LOOP AT lt_items INTO ls_item.
  lv_total = lv_total + ls_item-weight.
  IF ls_item-weight > 400.
    lv_heavy = lv_heavy + 1.
  ENDIF.
ENDLOOP.

WRITE / |Total weight: { lv_total } KG|.
WRITE / |Heavy items: { lv_heavy }|.
--- expected ---
Total weight: 2670 KG
Heavy items: 3
```
