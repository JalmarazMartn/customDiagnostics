JalmarazMartn: Get from git history 5 last changes in the line "Version =" and their related commit messages

GitHub Copilot: I'll list recent commits that touched package.json (since 2023) and then show their diffs so we can find which ones changed the version line — expected outcome: identify the most recent commits that modified version.

Ran terminal command: git -C "c:\Users\Jesus\Documents\Proyecto js\customDiagnostics" log --since="2023-01-01" --pretty=format:'==%h %ad %s' --date=iso -- package.json

Ran terminal command: git -C "c:\Users\Jesus\Documents\Proyecto js\customDiagnostics" log --since="2023-01-01" -p --pretty=format:'==%h %ad %s' --date=iso -- package.json | Select-String -Pattern '^[+-].*"version"' -Context 0,1

Ran terminal command: git -C "c:\Users\Jesus\Documents\Proyecto js\customDiagnostics" log -S '"version": "0.0.63"' --pretty=format:'%h %ad %s' --date=iso -- package.json

Ran terminal command: git -C "c:\Users\Jesus\Documents\Proyecto js\customDiagnostics" log -S '"version": "0.0.62"' --pretty=format:'%h %ad %s' --date=iso -- package.json

Ran terminal command: git -C "c:\Users\Jesus\Documents\Proyecto js\customDiagnostics" log --since="2023-01-01" --pretty=format:'==COMMIT==%n%H %h %ad %s' -p --date=iso -- package.json | Select-String -Pattern '^\+\s*"version"' -Context 3,0

Ran terminal command: git -C "c:\Users\Jesus\Documents\Proyecto js\customDiagnostics" log --since="2023-01-01" --pretty=format:'==COMMIT==%n%H %h %ad %s' -p --date=iso -- package.json | Select-String -Pattern '^\+\s*"version"' -Context 6,3

Ran terminal command: $hashes = 'c0a6fad b917674 35941a0 d2ef018 2e96d0d b43036d 8848baf 8781b7f 164cf42 12f287c 097f1aa af37201 6f9b4e0 e410a78 502ba77'; foreach ($h in $hashes.split(' ')) { Write-Host '==='+$h; git -C "c:\Users\Jesus\Documents\Proyecto js\customDiagnostics" show $h -- package.json | Select-String -Pattern '^[+-].*"version"' || Write-Host 'no version change'; }

Ran terminal command: $hashes = 'c0a6fad b917674 35941a0 d2ef018 2e96d0d b43036d 8848baf 8781b7f 164cf42 12f287c 097f1aa af37201 6f9b4e0 e410a78 502ba77'; foreach ($h in $hashes.Split(' ')) { Write-Host '==='+$h; $out = git -C "c:\Users\Jesus\Documents\Proyecto js\customDiagnostics" show $h -- package.json | Select-String -Pattern '^[+-].*"version"'; if ($out) { $out } else { Write-Host 'no version change' } }

Ran terminal command: git -C "c:\Users\Jesus\Documents\Proyecto js\customDiagnostics" log -n 1 --pretty=format:'%h %ad %s' --date=iso c0a6fad

Ran terminal command: git -C "c:\Users\Jesus\Documents\Proyecto js\customDiagnostics" log -n 1 --pretty=format:'%h %ad %s' --date=iso b917674

Ran terminal command: git -C "c:\Users\Jesus\Documents\Proyecto js\customDiagnostics" log -n 1 --pretty=format:'%h %ad %s' --date=iso 35941a0

Ran terminal command: git -C "c:\Users\Jesus\Documents\Proyecto js\customDiagnostics" log -n 1 --pretty=format:'%h %ad %s' --date=iso d2ef018

Ran terminal command: git -C "c:\Users\Jesus\Documents\Proyecto js\customDiagnostics" log -n 1 --pretty=format:'%h %ad %s' --date=iso b43036d

Ran terminal command: for %h in (c0a6fad b917674 35941a0 d2ef018 b43036d) do @echo === %h && git -C "c:\Users\Jesus\Documents\Proyecto js\customDiagnostics" show %h -- package.json | findstr /R "[+-].*\"version\""

Ran terminal command: $hashes = @('c0a6fad','b917674','35941a0','d2ef018','b43036d'); foreach ($h in $hashes) { Write-Host '==='+$h; git -C "c:\Users\Jesus\Documents\Proyecto js\customDiagnostics" show $h -- package.json | Select-String '^[+-].*"version"' }

Thanks — I checked the git history for commits that actually changed the `"version"` line and found the five most recent version-line changes. Here they are (most recent first):

- c0a6fad — 2025-09-14 07:02:53 +0200 — Filextension empty. Begin LLM tools  
  version change: "0.0.62" -> "0.0.63"

- b917674 — 2025-04-05 08:54:01 +0200 — Show commad "JAM Custom Rules. Pick a ruleset and apply replacements in current document" in command palette everytime you are in a document.  
  version change: "0.0.61" -> "0.0.62"

- 35941a0 — 2025-02-17 20:49:43 +0100 — Get More codeactions in discoverer  
  version change: "0.0.60" -> "0.0.61"

- d2ef018 — 2025-02-16 08:09:17 +0100 — New version  
  version change: "0.0.59" -> "0.0.60"

- b43036d — 2024-12-24 10:27:59 +0100 — Tests and fixes  
  version change: "0.0.58" -> "0.0.59"

Notes:
- Your workspace package.json currently shows `"version": "0.0.63"`, which matches the top entry above.
- There are many earlier incremental bumps prior to these (I can include more if you want).

Next steps I can do for you:
- Show the full commit diffs / commit bodies for any of these hashes.
- Create a short changelog from those commits.
- Search for when automated version bumps started (if you'd like to detect an automation).

Which of the next steps would you like?