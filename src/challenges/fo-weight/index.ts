import type { Challenge } from "../types";
import starter from "./starter.abap?raw";
import solution from "./solution.abap?raw";
import tests from "./tests.abap?raw";

export const foWeight: Challenge = {
  id: "fo-weight",
  title: "Freight order gross weight",
  level: "Beginner",
  topics: ["LOOP AT ... WHERE", "CASE", "Packed numbers"],
  className: "zcl_fo_weight",
  description: [
    "A freight order in SAP TM has items of different categories. Planners need the total gross weight of the goods on the order, in kilograms.",
    "Implement **get_total_weight_kg** so that it:",
    "- adds up **gro_wei_val** of every item whose **item_cat** is **PRD** (product),",
    "- ignores every other category, such as **PKG** (package),",
    "- converts weights whose **gro_wei_uni** is **LB** to kilograms using **c_kg_per_lb**,",
    "- returns 0 for an order without items.",
    "Click **Run tests** to check your code against the hidden ABAP Unit tests.",
  ],
  starter,
  solution,
  tests,
};
