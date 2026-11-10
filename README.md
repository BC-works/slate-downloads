# Slate downloads

Slate is a desktop notebook with persistent tabs, groups, local saving, and durable note history.

## Install

Download the latest version from [Releases](https://github.com/BC-works/slate-downloads/releases/latest).

- **Windows x64:** run `Slate-<version>-Setup-x64.exe`. Existing notes are preserved.
- **Linux x64:** download `Slate-<version>-x86_64.AppImage`, make it executable, then open it. Keep it in a folder you can write to so it can update itself.
- The Linux tar archive is available for manual installation; in-app installation of updates requires the AppImage.

Version 1.3 and later checks for updates on startup. **Update available** appears above **On this device**, with background download progress below it. Once verified, Slate saves your workspace, creates a backup, installs silently, and relaunches automatically. Save or backup failures pause installation and keep the app open for recovery. **Help → Check for updates** and About also show update status.

If you are on 1.2, use **Download update → Restart to install** once to get 1.3. Subsequent updates are automatic.

If you have the older ZIP build, install the new Windows installer or switch to the Linux AppImage once. Future updates can happen inside Slate.

Your notes are stored separately in the original `Margin` application-data folder. On Windows this is `%APPDATA%\Margin`; on Linux it is normally `~/.config/Margin`. Updates do not upload your notes. Use **Help → Open library folder** to locate the library.

Downloads are unsigned development builds. Windows may show an unknown-publisher prompt. Linux desktop behavior is tested; Windows packages are built on Windows and their model tests run there, but full Windows installation/update interaction has not yet been verified on a Windows desktop.

This repository contains public app downloads, update metadata, checksums, and the distribution workflow. The application source and development history are maintained separately in a private repository. GitHub's automatically generated source archive here contains only this distribution repository.

## Verify downloads

Each release includes `Slate-<version>-SHA256SUMS.txt`. The updater also verifies downloaded packages against the release's SHA-512 metadata. Both platform manifests and their binaries are published together.

## Release process

The source project builds and tests an immutable version tag in private CI. An authorized release operator supplies temporary download links and expected digests for the approved binary assets to this repository's **Publish downloads** workflow. The workflow validates the files, checks both update manifests, stages a draft, and publishes only a complete release. It rejects different bytes for a version that is already published. No permanent source-repository credential is stored here or in the app.
