#!/bin/bash
# Backup MinIO Data
set -e

BACKUP_DIR="./backups/s3"
DATE=$(date +"%Y-%m-%d")
BACKUP_FILE="$BACKUP_DIR/minio_backup_$DATE.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "Starting MinIO backup: $BACKUP_FILE"

# Tar the mounted volume data directory.
# In a real cluster, you'd use 'mc mirror' instead, but for VPS this works well.
tar -czf "$BACKUP_FILE" -C ./minio_prod_data .

echo "MinIO Backup completed successfully."

# Keep only last 3 days of heavy image backups
find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +3 -delete

echo "Old MinIO backups cleaned up."
