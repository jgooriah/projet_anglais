# English Sentence Betting Game

This small web app lets students test their English by betting points on whether sentences are **correct** or **incorrect**.

## How to run

1. Open the folder in your file explorer:  
   `Projet_anglais`
2. Double-click `index.html` to open it in your browser (Chrome, Edge, etc.).

No installation or server is required: it is just **HTML + CSS + JavaScript**.

## How to play

- Each team starts with **10 points**.
- For each sentence:
  - Each team chooses **TRUE** or **FALSE**.
  - Each team types how many points they want to bet in the **Bet (points)** column (from 0 up to their current number of points).
  - Click **REVEAL ANSWER**:
    - Teams that guessed correctly **win** the number of points they bet.
    - Teams that guessed incorrectly **lose** the number of points they bet.
  - The explanation and (if needed) the corrected sentence are shown under the sentence.
  - Click **NEXT SENTENCE** to continue.

Scores are kept from one sentence to the next so you can see which team wins at the end of the 10 sentences.

## Changing the sentences

The sentences are defined in `app.js` inside the `sentences` array:

- `text`: the sentence shown to the students.
- `isCorrect`: `true` if the sentence is correct, `false` otherwise.
- `explanation`: short explanation shown after revealing the answer.
- `corrected`: the correct version (or `null` if the original is already correct).

You can edit this list to fit your lesson or add/remove sentences as needed.

