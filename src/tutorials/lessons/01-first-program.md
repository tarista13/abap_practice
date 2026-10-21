# Your first ABAP program

ABAP (Advanced Business Application Programming) is the language SAP's business applications are written in, including SAP Transportation Management (TM). Every freight order, carrier selection and charge calculation you see in TM ends up running ABAP code.

In this course you write real ABAP right in the browser. Every code box on these pages is a small editor: change the code, then click **Run** (or press **Ctrl+Enter**) to see what it does.

## Hello, ABAP

```abap
REPORT zhello.

WRITE 'Hello, SAP TM!'.
```

Two things to notice:

- `REPORT zhello.` names the program. Programs you write yourself start with **Z** (or **Y**); SAP reserves the other letters for its own code. In these small examples you can leave the `REPORT` line out.
- `WRITE` prints text to the output. Text in single quotes `'...'` is a **text literal**.

## Every statement ends with a period

An ABAP program is a list of **statements**, and every statement ends with a period `.` — forgetting it is the most common beginner mistake. Line breaks and extra spaces don't matter, and ABAP doesn't care about upper or lower case in keywords: `WRITE`, `write` and `Write` are the same.

Use `/` to start a new line in the output:

```abap
WRITE / 'Freight order 6100000101'.
WRITE / 'Carrier: CARRIER_A'.
write /
  'Status: In process'.
```

## Comments

Comments explain your code to other people. ABAP has two kinds:

- A `*` in the **first column** turns the whole line into a comment.
- A `"` turns the rest of the line into a comment.

```abap
* This whole line is a comment
WRITE / 'Loading at plant'. " and this is a comment at the end of a line
" WRITE / 'This line does not run'.
```

## Chained statements

When several statements start with the same keyword, you can write the keyword once, followed by a colon `:`, and separate the parts with commas. This is called a **chain**:

```abap
WRITE: / 'Stop 1: PLANT_GRR',
       / 'Stop 2: HUB_DTW',
       / 'Stop 3: DC_CHI'.
```

> **Try breaking things.** Delete a period in one of the examples above and click Run. The red underline and the message tell you exactly where the problem is. Reading these messages is a skill worth practicing.

## Practice

First, read the program below **without running it**. What do you think it prints? Type your guess, then check it.

```abap predict
WRITE: / 'Stop 1', / 'Stop 2'.
* WRITE / 'Stop 3'.
WRITE / 'Stop 4'. " WRITE / 'Stop 5'.
WRITE / '" Stop 6'.
--- explain ---
The chain prints `Stop 1` and `Stop 2`. The `*` line is a comment, and so is everything after the `"` on the `Stop 4` line. But the `"` inside `'" Stop 6'` is part of a text literal, so it's printed, not treated as a comment.
```

Now write a program yourself, from an empty editor. Each step adds a little. Click **Run & check** when you think a step is done; the next step appears when the output is right.

```abap steps
" Write your program here
--- step ---
You're printing a shipping label for a truck driver. Start with the first line: print `Freight order 6100000104`.
--- expected ---
Freight order 6100000104
--- requires ---
WRITE :: Use a WRITE statement.
--- hint ---
Text goes between single quotes, and every statement ends with a period.
--- hint ---
`WRITE 'Freight order ...'.`
--- solution ---
WRITE 'Freight order 6100000104'.
--- step ---
Add two more lines below it: `From: PLANT_ATH` and `To: DC_MSP`. Each must be on its own line.
--- expected ---
Freight order 6100000104
From: PLANT_ATH
To: DC_MSP
--- hint ---
Without `/`, a WRITE continues on the same line. Put a `/` right after `WRITE` to start a new line.
--- solution ---
WRITE / 'Freight order 6100000104'.
WRITE / 'From: PLANT_ATH'.
WRITE / 'To: DC_MSP'.
--- step ---
That's a lot of `WRITE` keywords. Rewrite the three statements as **one chained statement**. The output stays the same.
--- expected ---
Freight order 6100000104
From: PLANT_ATH
To: DC_MSP
--- requires ---
WRITE\s*: :: Use a chain: WRITE followed by a colon.
!WRITE\s+/ :: There's still a separate "WRITE /" statement. Use one WRITE: with the parts separated by commas.
--- hint ---
A chain is the keyword, a colon, then the parts separated by commas: `WRITE: / 'a', / 'b'.`
--- hint ---
Only the last part ends with a period. The others end with a comma.
--- solution ---
WRITE: / 'Freight order 6100000104',
       / 'From: PLANT_ATH',
       / 'To: DC_MSP'.
--- step ---
Finally, document your program: add a **full-line comment** at the very top that says what the program does, and put a comment at the end of the `To:` line saying it's the final stop. The output must not change.
--- expected ---
Freight order 6100000104
From: PLANT_ATH
To: DC_MSP
--- requires ---
^\* :: Add a full-line comment: a line that starts with * in the very first column.
DC_MSP'\.\s*" :: Add a " comment after the To: part (after its period).
--- hint ---
A full-line comment starts with `*` in column 1, with no spaces in front of it.
--- hint ---
An end-of-line comment starts with `"`. Put it after the period that ends the chain.
--- solution ---
* Prints the shipping label for the driver
WRITE: / 'Freight order 6100000104',
       / 'From: PLANT_ATH',
       / 'To: DC_MSP'. " final stop
```

One more, a little more independent. This time there are fewer hints in the instructions; use what you learned above.

```abap steps
" Write your program here
--- step ---
A dispatcher needs a quick checklist for loading a truck. Print the title `Loading checklist` and, under it, a line of ten `=` characters.
--- expected ---
Loading checklist
==========
--- hint ---
Two WRITE statements (or one chain), each starting a new line with `/`.
--- solution ---
WRITE / 'Loading checklist'.
WRITE / '=========='.
--- step ---
Add three checklist items below the line, each starting with `[ ]`: `Check seal`, `Count pallets`, `Sign CMR document`.
--- expected ---
Loading checklist
==========
[ ] Check seal
[ ] Count pallets
[ ] Sign CMR document
--- hint ---
`[ ]` is just text, so it goes inside the quotes: `'[ ] Check seal'`.
--- solution ---
WRITE / 'Loading checklist'.
WRITE / '=========='.
WRITE / '[ ] Check seal'.
WRITE / '[ ] Count pallets'.
WRITE / '[ ] Sign CMR document'.
--- step ---
The seal was checked. Change the first item to `[X] Check seal`, and turn the `Count pallets` line into a comment so it no longer prints (the pallets were counted at the warehouse). Keep the line in the code.
--- expected ---
Loading checklist
==========
[X] Check seal
[ ] Sign CMR document
--- requires ---
^\s*(\*|")[^\n]*Count pallets :: Keep the "Count pallets" line in your code, but turn it into a comment.
--- hint ---
Put a `*` at the very start of that line, or a `"` in front of `WRITE`.
--- solution ---
WRITE / 'Loading checklist'.
WRITE / '=========='.
WRITE / '[X] Check seal'.
* WRITE / '[ ] Count pallets'.
WRITE / '[ ] Sign CMR document'.
```
