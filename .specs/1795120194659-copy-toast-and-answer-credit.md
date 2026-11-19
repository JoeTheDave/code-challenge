# Copy toast + credit stars when answers are fetched

## Summary
1. The result row's **Copy** button gave no feedback. It now shows a small toast
   ("Copied 1234"), fading after 2s; a clipboard failure shows an error toast.
   The toast is a shared `components/Toast.tsx` (the git panel uses it too).
2. **(Re-)fetch answers** pulled AoC's accepted answer but left the star off. An accepted
   answer on the site means the part is solved, so fetching now credits it: each AoC part
   with an answer gets its star, "Both parts of this puzzle are complete" credits both
   (covers the last day's free star), and a fetched Euler answer marks it solved. Stars are
   only ever added, never removed. The link now shows on every problem ("fetch answers"
   when nothing is credited yet), since that's exactly the case that needs it, and warns
   when the site has no accepted answer.

## Iteration plan
1. Toast component + copy feedback; star/solved credit in `fetchAnswers`; link always shown.
