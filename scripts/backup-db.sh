#!/bin/bash
# Backup PostgreSQL Database
set -e

# Load environment variables
source ../.env.prod

BACKUP_DIR="./backups/db"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/ai_studio_db_$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "Starting database backup: $BACKUP_FILE"

# Run pg_dump inside the postgres container
docker exec ai-studio-postgres pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"

echo "Backup completed successfully."

# Keep only last 7 days of backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -delete

echo "Old backups cleaned up."
