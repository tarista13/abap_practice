# Decisions and loops

Programs become useful when they react to data: route heavy shipments differently, skip canceled orders, repeat work for every stop. That's what `IF`, `CASE` and loops are for.

## IF

```abap
DATA lv_weight TYPE i VALUE 18500.

IF lv_weight > 24000.
  WRITE / 'Too heavy for one truck.'.
ELSEIF lv_weight > 15000.
  WRITE / 'Full truckload (FTL).'.
ELSE.
  WRITE / 'Less than truckload (LTL).'.
ENDIF.
```

Every `IF` needs a matching `ENDIF`, and every condition and branch ends with a period.

## Comparing values

| Operator | Alternative | Meaning |
|---|---|---|
| `=` | `EQ` | equal |
| `<>` | `NE` | not equal |
| `<` / `>` | `LT` / `GT` | less / greater than |
| `<=` / `>=` | `LE` / `GE` | less / greater or equal |

Combine conditions with `AND`, `OR` and `NOT`. Use `IS INITIAL` to check whether a variable still has its empty starting value (0 for numbers, blank for text):

```abap
DATA lv_carrier TYPE string.
DATA lv_lifecycle TYPE c LENGTH 2 VALUE '02'.

IF lv_carrier IS INITIAL.
  WRITE / 'No carrier assigned yet.'.
ENDIF.

IF lv_lifecycle = '02' OR lv_lifecycle = '01'.
  WRITE / 'The order is still open.'.
ENDIF.

IF NOT ( lv_lifecycle = '10' ).
  WRITE / 'The order is not canceled.'.
ENDIF.
```

## CASE

When you compare one value against several options, `CASE` is easier to read than a chain of `ELSEIF`s:

```abap
DATA lv_mot TYPE c LENGTH 2 VALUE '03'.

CASE lv_mot.
  WHEN '01'.
    WRITE / 'Road'.
  WHEN '02'.
    WRITE / 'Rail'.
  WHEN '03'.
    WRITE / 'Sea'.
  WHEN '05'.
    WRITE / 'Air'.
  WHEN OTHERS.
    WRITE / 'Unknown mode of transport'.
ENDCASE.
```

One `WHEN` can also list several values: `WHEN '01' OR '02'.` The mode-of-transport codes here are typical defaults; each TM system can define its own.

## Loops: DO and WHILE

`DO n TIMES` repeats a block a fixed number of times. Inside the loop, the system field `sy-index` counts the passes, starting at 1:

```abap
DO 3 TIMES.
  WRITE / |Loading pallet { sy-index }|.
ENDDO.
```

`WHILE` repeats as long as its condition is true:

```abap
DATA lv_load TYPE i VALUE 0.
DATA lv_pallets TYPE i VALUE 0.

WHILE lv_load + 750 <= 24000.
  lv_load = lv_load + 750.
  lv_pallets = lv_pallets + 1.
ENDWHILE.

WRITE / |{ lv_pallets } pallets of 750 KG fit, total { lv_load } KG.|.
```

Inside any loop, `CONTINUE` skips to the next pass and `EXIT` leaves the loop.

> **Endless loops.** If a `WHILE` condition never becomes false, the loop never ends. Here the sandbox stops your program after 10 seconds; on a real SAP system it would run until a time limit cancels it. Try removing the `lv_load = lv_load + 750.` line above to see what happens.

## Exercise

Print the stop numbers from 1 to 5, but mark the first stop as `(loading)` and every other stop as `(unloading)`. Use a `DO` loop and an `IF`.

```abap exercise
DO 5 TIMES.
  WRITE / |Stop { sy-index }|.
ENDDO.
--- solution ---
DO 5 TIMES.
  IF sy-index = 1.
    WRITE / |Stop { sy-index } (loading)|.
  ELSE.
    WRITE / |Stop { sy-index } (unloading)|.
  ENDIF.
ENDDO.
--- expected ---
Stop 1 (loading)
Stop 2 (unloading)
Stop 3 (unloading)
Stop 4 (unloading)
Stop 5 (unloading)
```
