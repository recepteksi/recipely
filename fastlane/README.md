# Play Store metadata

Store-listing copy for Google Play, kept under version control in the
[fastlane supply](https://docs.fastlane.tools/actions/supply/) layout.

```
fastlane/metadata/android/<locale>/
  title.txt              # ≤ 30 chars
  short_description.txt   # ≤ 80 chars
  full_description.txt    # ≤ 4000 chars
  changelogs/default.txt  # ≤ 500 chars — fallback release notes
```

Locales: `en-US`, `tr-TR` (keep both in sync, like the in-app i18n).

## What CI uploads automatically

The release job (`.github/workflows/ci.yml`) uses `r0adkll/upload-google-play`,
which pushes the **AAB** and the per-locale **release notes** from
`distribution/whatsnew/` (`whatsnew-en-US`, `whatsnew-tr-TR`) on every push to
`main`. Keep those files in sync with `changelogs/default.txt` here.

## What is uploaded manually (for now)

`r0adkll` does **not** push the title / short / full description. Either:

- Paste the contents of the files above into Play Console → Main store listing, or
- Run `fastlane supply --skip_upload_apk --skip_upload_aab` with these files.

Wiring full-listing auto-sync would require adding fastlane to the pipeline.
