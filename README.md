# Slate downloads

Slate is a desktop notebook with persistent tabs, nested subnotes, groups, local saving, and durable note history.

## Install

Slate 1.7.1 refines subnotes into comfortable notebook pages. Their surfaces, borders, text, and accents follow Paper, Midnight, Forest, or the current system appearance. A brief page turn accompanies switching subnotes; editing stops the motion immediately, and reduced-motion preferences disable it. Startup and switching root notes stay immediate.

Slate 1.7 adds independent subnotes with theme-matched page tabs below the heading and expandable sidebar arrows. Each note can contain further subnotes. Child tabs, selected paths, and expansion return after reopening. Use **New subnote**, the subnote row's **+**, or **Note → Move under note…** to organize existing notes; promote a child with **Make a top-level note**. The sidebar defaults to 320px and resizes up to 520px. Search shows ancestor paths and export-all preserves nested folders.

Children follow their root's group. Archiving/trashing a parent includes its branch while preserving a child's independent status. A blank parent with children is kept when its tab closes. Older libraries are backed up before migration; text and revision history stay intact.

Slate 1.5 reduces editing allocations, bounds reconstructed-text caches, and mounts only a viewport of long lists while preserving full history and saving guarantees. A synthetic 1,224-note Linux search workload measured about 26% less proportional process memory than 1.4.0; smaller libraries and other operating systems may see different savings. Full history remains loaded in this optimization pass.

Slate 1.4 includes larger interface text, a sidebar hide/show button, separate Pinned and Recent sections, a left-aligned editor with a title divider, and a search dialog with matching snippets and keyboard selection. Closing an unused blank draft removes it from the live library; notes with meaningful text/title history remain recoverable.

Download the latest version from [Releases](https://github.com/BC-works/slate-downloads/releases/latest).

- **Windows x64:** run `Slate-<version>-Setup-x64.exe`. Existing notes are preserved.
- **Linux x64:** download `Slate-<version>-x86_64.AppImage`, make it executable, then open it. Keep it in a folder you can write to so it can update itself.
- The Linux tar archive is available for manual installation; in-app installation of updates requires the AppImage.

Version 1.6 and later checks for updates on startup and waits for your click. **Download update** appears above **On this device**; click it to download with progress underneath. When verified, the button becomes **Restart to update**. You can keep writing until you click it. Slate then saves your workspace, creates a backup, installs silently, and relaunches. Save or backup failures keep the app open for recovery. Normal closing never installs a downloaded package. **Help → Check for updates** and About also show details and the same actions.

Versions 1.3–1.5 retain their old automatic behavior while acquiring a newer release and may install it automatically once. The click-to-download and click-to-restart policy applies after upgrading to 1.6 or later. If you are on 1.2, use its existing Download update and Restart to install controls once.

If you have the older ZIP build, install the new Windows installer or switch to the Linux AppImage once. Future updates can happen inside Slate.

Your notes are stored separately in the original `Margin` application-data folder. On Windows this is `%APPDATA%\Margin`; on Linux it is normally `~/.config/Margin`. Updates do not upload your notes. Use **Help → Open library folder** to locate the library.

Downloads are unsigned development builds. Windows may show an unknown-publisher prompt. Linux desktop behavior is tested; Windows packages are built on Windows and their model tests run there, but full Windows installation/update interaction has not yet been verified on a Windows desktop.

This repository contains public app downloads, update metadata, checksums, and the distribution workflow. The application source and development history are maintained separately in a private repository. GitHub's automatically generated source archive here contains only this distribution repository.

## Verify downloads

Each release includes `Slate-<version>-SHA256SUMS.txt`. The updater also verifies downloaded packages against the release's SHA-512 metadata. Both platform manifests and their binaries are published together.

## Release process

The source project builds and tests an immutable version tag in private CI. An authorized release operator supplies temporary download links and expected digests for the approved binary assets to this repository's **Publish downloads** workflow. The workflow validates the files, checks both update manifests, stages a draft, and publishes only a complete release. It rejects different bytes for a version that is already published. No permanent source-repository credential is stored here or in the app.
