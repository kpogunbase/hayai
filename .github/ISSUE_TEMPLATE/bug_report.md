
```md
# .github/ISSUE_TEMPLATE/bug_report.md

---
name: Bug report
about: Report a bug (especially parsing, timing, or playback issues)
title: "[Bug]: "
labels: ["bug"]
assignees: ""
---

## Summary
A clear and concise description of the bug.

## Environment
- OS: (macOS / Windows / iOS / Android / Linux)
- Browser: (Chrome / Safari / Firefox / Edge) + version
- Device: (desktop / iPhone model / Android model)
- Build: (local dev / production)

## Steps to Reproduce
1.
2.
3.

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Severity
- [ ] Blocker (feature unusable)
- [ ] High (major feature broken)
- [ ] Medium (workaround exists)
- [ ] Low (minor annoyance)

## Mode
- [ ] Reading Mode
- [ ] Challenge Mode
- [ ] Both

## Reader State (if relevant)
- WPM setting (or current WPM in Challenge Mode):
- Token index at time of issue:
- Document type: (TXT / DOCX / PDF)
- Document length (approx words/tokens):

## Timing / Playback Diagnostics (critical for RSVP bugs)
Check any that apply:
- [ ] Timer drift (speed gradually becomes wrong)
- [ ] Runaway scheduler (speed increases unexpectedly fast)
- [ ] Multiple timers (pausing doesn’t stop advancement)
- [ ] Index skips ahead / jumps backward
- [ ] Pause/resume changes speed unexpectedly
- [ ] Back/Forward controls behave incorrectly

## Parsing Diagnostics (critical for file bugs)
Check any that apply:
- [ ] DOCX parsing failed
- [ ] PDF parsing returned empty text
- [ ] PDF parsing garbled order/spaces
- [ ] TXT encoding issue
- [ ] Text preview shows missing/extra characters
- [ ] App crashed on upload

## Console Logs / Screenshots
Paste any relevant logs and attach screenshots.

