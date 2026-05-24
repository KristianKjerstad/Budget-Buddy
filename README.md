# Budget-Buddy

## Backend Hot Reload

Run the backend with automatic reload when files change.

### In VS Code (Task)

1. Open Command Palette (`Cmd+Shift+P`)
2. Select `Tasks: Run Task`
3. Choose `watch backend`

This runs the task defined in `.vscode/tasks.json`:

```bash
dotnet watch run --project backend/backend.csproj
```

### In Terminal

From the repo root, run:

```bash
dotnet watch run --project backend/backend.csproj
```

### Stop the watcher

Press `Ctrl+C` in the running terminal.