---
layout: ../../layouts/DocLayout.astro
title: Install OwnerLens
description: Basic local install and run flow for the OwnerLens site and project.
---

## Requirements

- PowerShell 7 (`pwsh`) on `PATH` for the OwnerLens module and snapshot
  collectors. Do not use Windows PowerShell (`powershell.exe`).
- Node.js and npm for building from a source checkout.
- Azure PowerShell and Microsoft Graph PowerShell modules when collecting data:

```powershell
Install-Module Az -Scope CurrentUser
Install-Module Az.ManagedServiceIdentity -Scope CurrentUser
Install-Module Microsoft.Graph -Scope CurrentUser
```

Run all PowerShell commands in `pwsh`.

## Create Snapshots

Collectors write these files by default:

- `data/snapshot.json` for Azure subscriptions, resource groups, resources,
  managed identities, role assignments, and optional activity logs.
- `data/entra-snapshot.json` for Microsoft Entra service principals,
  application registrations, groups, and group membership facts.

Sign in from `pwsh`:

```powershell
Connect-AzAccount
Connect-MgGraph -TenantId "<tenant-id>" -Scopes "Application.Read.All","Group.Read.All","Directory.Read.All"
```

Collect snapshots from `pwsh`:

```powershell
Install-Module OwnerLens -Scope CurrentUser -AllowPrerelease
Invoke-OwnerLensCollectAzure -SubscriptionIds "sub-id-1,sub-id-2"
Invoke-OwnerLensCollectEntra -TenantId "<tenant-id>"
```

More collector options are documented in [tools/README.md](tools/README.md).

Snapshot files can contain sensitive tenant, subscription, identity, group,
credential, and activity-log metadata. Review them before sharing. Files matching
`data/*snapshot.json` are ignored by git.


## Run

Start the local app from `pwsh`:

```powershell
Install-Module OwnerLens -Scope CurrentUser -AllowPrerelease
Start-OwnerLens -DataPath ./data
Open-OwnerLens
```

`Start-OwnerLens` binds to `127.0.0.1`, chooses a free port, creates the data
directory, waits up to 180 seconds for the runtime API to become ready, stores
runtime state under `$env:LOCALAPPDATA\OwnerLens`, and writes server stdout/stderr
logs under `$env:LOCALAPPDATA\OwnerLens\logs`.

Use an explicit port or data directory when needed:

```powershell
Start-OwnerLens -Port 4174 -DataPath C:\OwnerLensData
Start-OwnerLens -StartupTimeoutSeconds 240
```