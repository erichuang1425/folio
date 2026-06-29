# TabNest

**A private, visual workspace for the tabs you want to keep.**

TabNest replaces the browser's new tab page with a local-first command center for tabs,
notes, todos, stacks, reminders, and lightweight personal productivity tools. It is built
as a vanilla Manifest V3 extension for Chromium browsers, with no build step and no host
permissions.

![TabNest icon](icons/icon128.png)

## Why It Exists

Modern browser sessions get messy fast: research tabs, half-written notes, quick tasks,
articles to read, subscriptions to track, and goals you meant to come back to. TabNest
turns that sprawl into a workspace you can scan, search, rearrange, and resume.

It is designed for people who live in the browser but still want a calmer system:
local-first storage, fast keyboard-driven organization, and enough structure to keep
context without turning every tab into a project-management ceremony.

## Highlights

- **Visual tab workspaces**: organize saved tabs into workspaces, categories, groups,
  recursive stacks, and color-coded cards.
- **Mixed cards**: keep tabs, notes, and todos side by side, with rich text, checkboxes,
  slash commands, reminders, and undo support.
- **Multiple views**: switch between board, list, group focus, and free-positioning canvas
  modes depending on how you want to think.
- **Search operators**: filter with plain text, quoted phrases, and operators such as
  `color:`, `type:`, `is:`, `domain:`, `url:`, `in:`, `has:reminder`, and `reminder:`.
  Prefix any term with `-` to exclude matches.
- **Browser-aware workflow**: save the current tab, save all open tabs, batch-select open
  tabs, bind workspaces to windows, and reopen saved tabs when needed.
- **Tab hibernation**: open saved tabs through a lightweight suspended page so they use
  near-zero memory until you activate them.
- **Built-in tools**: Pomodoro, finance diary, subscriptions, habits, hydration, reading,
  goals, and workout tracking, including draggable floating widgets for several tools.
- **Privacy-conscious by default**: no host permissions; TabNest does not read page
  content. Stored URLs, titles, notes, and tool data live in `chrome.storage.local`.
- **Portable data**: export and import TabNest data with a versioned envelope and preview
  flow.

## Product Tour

Screenshots are best captured from the loaded extension because the app depends on
browser extension APIs. The current interface includes these main surfaces:

| Surface | What to Look For |
| --- | --- |
| Workspace board | Sidebar with open tabs, category tabs, draggable groups, nested stacks, and card actions. |
| Search | Structured operators for narrowing a busy workspace without leaving the keyboard. |
| Canvas view | Free-positioned groups on a dotted grid for spatial planning. |
| Tools hub | Personal trackers and floating widgets that can stay open while organizing tabs. |
| Popup | Quick-save flow for the current tab or all tabs in the current window. |

## Tech Stack

- **Browser platform**: Manifest V3 extension for Chrome and Microsoft Edge
- **Frontend**: HTML, CSS, and vanilla JavaScript
- **Storage**: `chrome.storage.local`
- **Background work**: MV3 service worker, alarms, notifications, and context menus
- **CI**: GitHub Actions syntax checks for JavaScript and manifest validation
- **Build tooling**: none required

## Install for Development

1. Clone the repository.
2. Open `chrome://extensions/` or `edge://extensions/`.
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select the repository folder.
6. Open a new tab to launch TabNest.

After editing files, reload the extension from the browser's extensions page.

## Usage

- Open a new tab to use the full workspace.
- Use the extension popup to save the current tab or every open tab.
- Drag open tabs from the sidebar into a group or stack.
- Create notes and todos directly inside saved groups.
- Use search for broad text queries or structured filters like:

```text
type:tab in:work domain:github.com "pull request" -is:done
```

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Cmd/Ctrl + K` | Search across saved items |
| `Cmd/Ctrl + Shift + S` | Save current tab to Inbox |
| `Cmd/Ctrl + Shift + E` | Open the extension popup |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `S` | Focus the open-tab filter |
| `M` | Move the focused item or current selection |
| `?` | Show the keyboard cheatsheet |
| `Esc` | Close overlays or clear selections |
| `/todo`, `/done` | Convert or update notes and todos |
| `/red`, `/green`, `/blue`, `/yellow`, `/orange` | Set item color |

## Project Structure

```text
tabnest/
├── manifest.json              # MV3 manifest, permissions, commands, icons
├── background.js              # Service worker for menus, alarms, notifications, saves
├── newtab.html                # Main workspace shell
├── newtab.css                 # Themes, layout, components, tools, responsive styling
├── newtab.js                  # Main application state, rendering, search, tools
├── popup.html                 # Toolbar popup shell
├── popup.css                  # Popup styling
├── popup.js                   # Quick-save and popup tab list behavior
├── suspended.html             # Lightweight hibernated-tab placeholder
├── suspended.js               # Resume logic for hibernated tabs
├── emoji-data.js              # Emoji picker data
├── icons/                     # Extension icons
├── DESIGN.md                  # Product and visual-design notes
└── .github/workflows/ci.yml   # Validation workflow
```

## Architecture

TabNest is a single-page extension app. Most state lives under a compact local storage
object keyed as `te`:

```js
{
  workspaces: [{
    id,
    name,
    symbol,
    windowId,
    activeCatId,
    categories: [{
      id,
      name,
      groups: [{
        id,
        name,
        symbol,
        color,
        collapsed,
        items: [
          { type: "tab", url, title, fav, color, reminder },
          { type: "note", html, color, reminder },
          { type: "todo", text, done, color, reminder },
          { type: "stack", name, symbol, color, expanded, items: [] }
        ]
      }]
    }]
  }],
  activeWsId,
  archive,
  settings,
  pomo,
  fin,
  subscriptions,
  habits,
  water,
  books,
  goals,
  workouts
}
```

Rendering is intentionally straightforward: state changes update the local store and then
re-render the affected surface or the full workspace. Destructive actions create undo
snapshots before mutation, with a 50-entry in-memory undo stack.

## Testing

Run the same checks used by CI:

```powershell
node --check newtab.js
node --check background.js
node --check popup.js
node --check suspended.js
node --check emoji-data.js
node -e "JSON.parse(require('fs').readFileSync('manifest.json','utf8'))"
```

The GitHub Actions workflow runs these syntax and manifest checks on pushes to `main`
and on pull requests.

## Deployment

TabNest is currently distributed as an unpacked developer-mode extension. For a store
release, package the repository contents as a browser extension bundle after validating
the manifest, icons, permissions, screenshots, privacy policy, and store listing copy.

## Roadmap

- Capture polished product screenshots for the README and extension-store listing.
- Add automated UI smoke tests for critical workspace flows.
- Expand import/export coverage and migration tests.
- Explore optional encrypted sync while preserving the local-first default.
- Continue improving accessibility, keyboard workflows, and high-contrast support.

## Permissions

| Permission | Why TabNest Uses It |
| --- | --- |
| `tabs` | Read, create, focus, and close tabs for saved-tab workflows |
| `storage` | Persist local workspace and tool data |
| `contextMenus` | Save pages, links, selections, and images from the browser context menu |
| `bookmarks` | Import bookmarks into workspaces |
| `alarms` | Schedule reminders and subscription alerts |
| `notifications` | Show reminder and storage notifications |

TabNest does not request host permissions.

## License

MIT
