export interface Challenge {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  topics: string[];
  /** global class the learner implements; the tests are its local test classes */
  className: string;
  /** shows the database table browser next to the description */
  usesDatabase?: boolean;
  /** paragraphs; lines starting with "- " are list items, **text** is bold */
  description: string[];
  starter: string;
  solution: string;
  tests: string;
}
