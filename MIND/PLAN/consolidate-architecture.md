# Plan: Consolidate Architecture Documentation

## Goal
Merge root `ARCHITECTURE.md` into `.gemini/ARCHITECTURE.md` and delete the root file to reduce redundancy.

## Steps
1. Create a merged version of `.gemini/ARCHITECTURE.md`.
2. Delete the root `ARCHITECTURE.md`.
3. Run build to ensure everything is still correct.
4. Increment version in `package.json`.
5. Commit and push changes.
