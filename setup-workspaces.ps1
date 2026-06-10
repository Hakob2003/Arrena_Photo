$dirs = @(
    "apps\frontend",
    "apps\backend-api",
    "apps\worker",
    "packages\database\prisma",
    "packages\shared-types\src",
    "packages\ui-kit"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir
    Write-Host "Created: $dir"
}

Write-Host "Workspace scaffolding complete!"
