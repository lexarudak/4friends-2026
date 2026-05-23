# Language Feedback Log

Last updated: 2026-05-23
Last reminder shown: 2026-05-08

## Purpose

Track frequent grammar/wording mistakes from user messages and provide better alternatives.

## Frequent issues

| #   | Type             | Often written                                                | Better phrasing                                                  | Note                                                        |
| --- | ---------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| 1   | Spelling         | "dublications"                                               | "duplications"                                                   | Common typo                                                 |
| 2   | Spelling         | "hole app"                                                   | "whole app"                                                      | Common typo                                                 |
| 3   | Spelling         | "rools"                                                      | "rules"                                                          | Common typo                                                 |
| 4   | Preposition      | "enter to room123"                                           | "enter room123" / "go to room123" / "join room123"               | In English, “enter” usually does not take “to”              |
| 5   | Request style    | "why so much??"                                              | "Why are there so many requests?"                                | Clearer and more natural                                    |
| 6   | Wording          | "lets connect this request to this table"                    | "let’s connect this data source to this table"                   | “request” is less natural than “data source” in API context |
| 7   | Wording          | "lets she skeleton"                                          | "let’s show a skeleton"                                          | Likely typo: “she” → “show”                                 |
| 8   | Grammar          | "if user have 2 rooms"                                       | "if a user has 2 rooms"                                          | Subject-verb agreement (`user has`)                         |
| 9   | Spelling         | "Aslo"                                                       | "also"                                                           | Common typo                                                 |
| 10  | Spelling         | "messege"                                                    | "message"                                                        | Common typo                                                 |
| 11  | Grammar          | "we have now results yet"                                    | "we have no results yet"                                         | Use `no` (not `now`) in this sentence pattern               |
| 12  | Spelling         | "transperent"                                                | "transparent"                                                    | Common typo                                                 |
| 13  | Wording          | "centrify it"                                                | "center it" / "align it to the center"                           | More natural UI wording                                     |
| 14  | Grammar/Spelling | "do we concider this point distribution when highlight lins" | "do we consider this point distribution when highlighting lines" | Verb form + spelling (`consider`, `lines`)                  |
| 15  | Grammar          | "lets test it with mocks"                                    | "let's test it with mocks"                                       | Repeated: use apostrophe in `let's`                         |
| 16  | Grammar          | "why we dont apply 2 points bonus for it?"                   | "why don't we apply a 2-point bonus for it?"                     | Use auxiliary `don't` and article `a`                       |
| 17  | Spelling/Grammar | "its imposible"                                              | "it's impossible"                                                | Apostrophe + spelling (`impossible`)                        |
| 18  | Grammar          | "let the first match be also"                                | "let the first match also be"                                    | Prefer `also` before main verb                              |
| 19  | Grammar          | "why 1:1 bet is 3 not 5?"                                    | "why is a 1:1 bet 3, not 5?"                                     | Use auxiliary verb `is` for questions                       |
| 20  | Grammar          | "why we have 5 here?"                                        | "why do we have 5 here?"                                         | Use auxiliary `do` in present simple questions              |
| 21  | Grammar          | "if he beted a draw"                                         | "if they bet on a draw"                                          | Use `bet` (not `beted`) and natural phrasing                |
| 22  | Wording          | "this is so large"                                           | "this is too large"                                              | `too` is natural for excessive size                         |
| 23  | Spelling         | "shoul" / "buterfull"                                        | "should" / "beautiful"                                           | Frequent typing mistakes                                    |
| 24  | Spelling         | "usless"                                                     | "useless"                                                        | Common typo                                                 |
| 25  | Spelling         | "mok data"                                                   | "mock data"                                                      | Common typo in dev context                                  |
| 26  | Spelling         | "tranket titles"                                             | "truncate titles"                                                | Correct verb for shortening text                            |
| 27  | Spelling/Wording | "stik with responsive design"                                | "stick to responsive design"                                     | Natural phrasing in UI requests                             |
| 28  | Spelling         | "exapmle"                                                    | "example"                                                        | Common typo                                                 |
| 29  | Spelling         | "posible" / "hightlight" / "hor"                             | "possible" / "highlight" / "for"                                 | Repeated typo pattern in UI requests                        |
| 30  | Spelling/Grammar | "shoul" / "collors" / "guidlene"                             | "should" / "colors" / "guideline"                                | Repeated typo pattern in implementation requests            |
| 31  | Grammar          | "all posible variants"                                       | "all possible variants"                                          | Add article and correct spelling                            |

## Recent examples

### Example A

- Original: "remove dublications"
- Better: "remove duplications"

### Example B

- Original: "i need you to refactor the hole app"
- Better: "I need you to refactor the whole app."

### Example C

- Original: "admin page should not be privat"
- Better: "The admin page should not be private."

### Example D

- Original: "i enter to admin room"
- Better: "I entered the admin room." / "I joined the admin room."

### Example E

- Original: "lets connect this request to this table"
- Better: "Let’s connect this data source to this table."

### Example F

- Original: "ok, lets she skeleton for the first fetch"
- Better: "OK, let’s show a skeleton for the first fetch."

### Example G

- Original: "if user have 2 rooms, we need to take the best value for him"
- Better: "If a user has 2 rooms, we should take their best value."

### Example H

- Original: "Aslo we should create a way"
- Better: "Also, we should create a way"

### Example I

- Original: "lest add a messege to Bets History that we have now results yet"
- Better: "Let’s add a message to Bets History that says: ‘We have no results yet.’"

### Example J

- Original: "make it bigger, more transperent and centrify it"
- Better: "Make it bigger, more transparent, and center it."

### Example K

- Original: "check, do we concider this point distribution when highlight lins in our live section?"
- Better: "Can you check whether we consider this point distribution when highlighting lines in the Live section?"

### Example L

- Original: "lets test it with mocks"
- Better: "Let's test it with mocks."

### Example M

- Original: "why we dont apply 2 points bonus for it?"
- Better: "Why don't we apply a 2-point bonus for it?"

### Example N

- Original: "yeah. but its imposible. we just block bets like this. create realistic mocks"
- Better: "Yeah, but it's impossible — we block bets like this. Please create realistic mocks."

### Example O

- Original: "and let the first match be also a playoff match but with 1:1 score"
- Better: "And let the first match also be a playoff match, but with a 1:1 score."

### Example P

- Original: "and why 1:1 bet is 3 not 5?"
- Better: "And why is a 1:1 bet 3, not 5?"

### Example Q

- Original: "and why we have 5 here?"
- Better: "And why do we have 5 here?"

### Example R

- Original: "ok. we should add info which winner user selected if he beted a draw in playoff"
- Better: "OK, we should show which winner the user selected if they bet on a draw in a playoff match."

### Example S

- Original: "this is so large. it can be just a dot left or right by score"
- Better: "This is too large. It can be just a dot on the left or right of the score."

### Example T

- Original: "nice. but now we shoul keep this place for other bets. to make it buterfull"
- Better: "Nice. But now we should keep this space for other bets to make it more beautiful."

### Example U

- Original: "make usless dots invisible"
- Better: "Make useless dots invisible."

### Example V

- Original: "add mok data to test playoff view of next matches"
- Better: "Add mock data to test the playoff view in Next Matches."

### Example W

- Original: "and tranket titles"
- Better: "And truncate titles."

### Example X

- Original: "also add an exapmle of playoff match where score is 2:1"
- Better: "Also add an example of a playoff match where the score is 2:1."

### Example Y

- Original: "for all posible tables lets apply this colors hor hightlight"
- Better: "For all possible tables, let’s apply these colors for highlight."

### Example Z

- Original: "we shoul fix collors with our new guidlene"
- Better: "We should fix colors using our new guideline."

### Example AA

- Original: "add mock for all posible variants"
- Better: "Add a mock for all possible variants."

## Reminder cadence

- Reminder target: every 3 days.
- Practical rule in chat: when the user writes and 3+ days passed since `Last reminder shown`, remind to review this file.
