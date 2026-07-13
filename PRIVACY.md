# Tabento privacy information

Tabento is local-first. It has no account system, analytics SDK, telemetry, advertising code, or project-operated server.

Workspace names, saved URLs/titles, notes, todos, reminders, settings, archive entries, and tool data are stored in `chrome.storage.local` under `te`. A small settings mirror prevents theme flashing. Tabento does not implement sync.

| Permission | Purpose |
| --- | --- |
| `tabs` | Save, focus, hibernate, reopen, and optionally close tabs. |
| `storage` | Persist local application data. |
| `contextMenus` | Offer explicit saves for pages, links, selected text, and image URLs. |
| `bookmarks` | Import bookmarks when requested. |
| `alarms` | Schedule local reminders. |
| `notifications` | Display reminder and storage notifications. |

The manifest requests no host permissions. Tabento does not inspect arbitrary page content. Opening a saved URL contacts that site. Favicon rendering may contact Google’s public favicon endpoint. Font stylesheet references may contact Google Fonts when allowed; system-font fallbacks remain available.

JSON exports can contain private planning and browsing information. Store them securely. Users can delete items/workspaces or uninstall the extension; export first if a backup is required.
