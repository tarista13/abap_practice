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

## Practice

What does this loop print?

```abap predict
DO 6 TIMES.
  IF sy-index = 2.
    CONTINUE.
  ENDIF.
  IF sy-index = 5.
    EXIT.
  ENDIF.
  WRITE / |Pass { sy-index }|.
ENDDO.
WRITE / 'Done'.
--- explain ---
Pass 2 is skipped by `CONTINUE`, which jumps to the next pass. At pass 5, `EXIT` leaves the loop completely, so passes 5 and 6 never print. The program then continues after `ENDDO`.
```

Classify shipments by weight. You'll start with one rule and add more, the way real requirements tend to arrive.

```abap steps
" Write your program here
--- step ---
Write a `DO` loop that runs 3 times. In each pass, calculate a weight of `sy-index * 9000` and print it: `Weight: 9000`, `Weight: 18000`, `Weight: 27000`.
--- expected ---
Weight: 9000
Weight: 18000
Weight: 27000
--- requires ---
\bDO\s+3\s+TIMES :: Use DO 3 TIMES.
--- hint ---
Declare an integer `lv_weight` before the loop and assign it inside the loop.
--- hint ---
`lv_weight = sy-index * 9000.`
--- solution ---
DATA lv_weight TYPE i.

DO 3 TIMES.
  lv_weight = sy-index * 9000.
  WRITE / |Weight: { lv_weight }|.
ENDDO.
--- step ---
Shipments over 15,000 KG are a full truckload (`FTL`); lighter ones are less than truckload (`LTL`). Add the classification to each line: `Weight: 9000 LTL`, and so on.
--- expected ---
Weight: 9000 LTL
Weight: 18000 FTL
Weight: 27000 FTL
--- requires ---
\bIF\b :: Use IF to decide between FTL and LTL.
--- hint ---
You can WRITE different text in each branch of an `IF ... ELSE ... ENDIF`.
--- solution ---
DATA lv_weight TYPE i.

DO 3 TIMES.
  lv_weight = sy-index * 9000.
  IF lv_weight > 15000.
    WRITE / |Weight: { lv_weight } FTL|.
  ELSE.
    WRITE / |Weight: { lv_weight } LTL|.
  ENDIF.
ENDDO.
--- step ---
A truck can't carry more than 24,000 KG. Heavier shipments must say `Too heavy` instead of `FTL`.
--- expected ---
Weight: 9000 LTL
Weight: 18000 FTL
Weight: 27000 Too heavy
--- requires ---
\bELSEIF\b :: Add an ELSEIF branch.
--- hint ---
Conditions are checked from top to bottom, and the first true one wins. Which check has to come first?
--- solution ---
DATA lv_weight TYPE i.

DO 3 TIMES.
  lv_weight = sy-index * 9000.
  IF lv_weight > 24000.
    WRITE / |Weight: { lv_weight } Too heavy|.
  ELSEIF lv_weight > 15000.
    WRITE / |Weight: { lv_weight } FTL|.
  ELSE.
    WRITE / |Weight: { lv_weight } LTL|.
  ENDIF.
ENDDO.
--- step ---
Change the loop to run **5** times, but stop as soon as a shipment is too heavy, since it has to be split first. After the loop, print `Stopped at 27000 KG`.
--- expected ---
Weight: 9000 LTL
Weight: 18000 FTL
Weight: 27000 Too heavy
Stopped at 27000 KG
--- requires ---
\bDO\s+5\s+TIMES :: The loop should run up to 5 times.
\bEXIT\b :: Use EXIT to leave the loop.
--- hint ---
`EXIT` leaves the loop. After the loop, `lv_weight` still has the value from the last pass.
--- solution ---
DATA lv_weight TYPE i.

DO 5 TIMES.
  lv_weight = sy-index * 9000.
  IF lv_weight > 24000.
    WRITE / |Weight: { lv_weight } Too heavy|.
    EXIT.
  ELSEIF lv_weight > 15000.
    WRITE / |Weight: { lv_weight } FTL|.
  ELSE.
    WRITE / |Weight: { lv_weight } LTL|.
  ENDIF.
ENDDO.
WRITE / |Stopped at { lv_weight } KG|.
```

Translate mode-of-transport codes into names.

```abap steps
DATA lv_mot TYPE c LENGTH 2 VALUE '03'.
--- step ---
Use `CASE` to print the name for `lv_mot`: `Road` for `01`, `Sea` for `03`, and `Other` for any other code.
--- expected ---
Sea
--- requires ---
\bCASE\b :: Use CASE.
WHEN\s+OTHERS :: Handle all other codes with WHEN OTHERS.
--- hint ---
`CASE lv_mot. WHEN '01'. ... WHEN OTHERS. ... ENDCASE.`
--- solution ---
DATA lv_mot TYPE c LENGTH 2 VALUE '03'.

CASE lv_mot.
  WHEN '01'.
    WRITE / 'Road'.
  WHEN '03'.
    WRITE / 'Sea'.
  WHEN OTHERS.
    WRITE / 'Other'.
ENDCASE.
--- step ---
Test all codes from `01` to `03` at once: put your `CASE` in a `DO 3 TIMES` loop and set `lv_mot = |0{ sy-index }|.` at the start of each pass. Print `<code>: <name>` for each, like `01: Road`.
--- expected ---
01: Road
02: Other
03: Sea
--- requires ---
\bDO\b :: Use a DO loop.
--- hint ---
`|0{ sy-index }|` turns pass 1 into the text `01`.
--- hint ---
Inside each WHEN, print with a string template: `|{ lv_mot }: Road|`.
--- solution ---
DATA lv_mot TYPE c LENGTH 2 VALUE '03'.

DO 3 TIMES.
  lv_mot = |0{ sy-index }|.
  CASE lv_mot.
    WHEN '01'.
      WRITE / |{ lv_mot }: Road|.
    WHEN '03'.
      WRITE / |{ lv_mot }: Sea|.
    WHEN OTHERS.
      WRITE / |{ lv_mot }: Other|.
  ENDCASE.
ENDDO.
--- step ---
`02` is rail. Add it.
--- expected ---
01: Road
02: Rail
03: Sea
--- hint ---
One more `WHEN` branch.
--- solution ---
DATA lv_mot TYPE c LENGTH 2 VALUE '03'.

DO 3 TIMES.
  lv_mot = |0{ sy-index }|.
  CASE lv_mot.
    WHEN '01'.
      WRITE / |{ lv_mot }: Road|.
    WHEN '02'.
      WRITE / |{ lv_mot }: Rail|.
    WHEN '03'.
      WRITE / |{ lv_mot }: Sea|.
    WHEN OTHERS.
      WRITE / |{ lv_mot }: Other|.
  ENDCASE.
ENDDO.
```
