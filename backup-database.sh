#!/bin/bash

#######################################
# Eagle Chat 数据库备份脚本
# 备份到大硬盘 /mnt/7tb-disk
#######################################

set -e

# 配置
BACKUP_DIR="/mnt/7tb-disk/eagle-chat-backups"
MONGODB_DATA_DIR="/mnt/7tb-disk/mongodb/eagle-chat"
DB_NAME="eagle_chat"
DB_USER="eagle_user"
DB_PASS="EagleUser2026!@#"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="eagle_chat_backup_$TIMESTAMP"
KEEP_DAYS=30

echo "=========================================="
echo "🦅 Eagle Chat 数据库备份"
echo "=========================================="
echo ""

# 创建备份目录
mkdir -p "$BACKUP_DIR"

echo "[1/4] 开始备份数据库..."
mongodump \
  --uri="mongodb://$DB_USER:$DB_PASS@localhost:27017/$DB_NAME?authSource=$DB_NAME" \
  --out="$BACKUP_DIR/$BACKUP_NAME"

echo "[2/4] 压缩备份文件..."
cd "$BACKUP_DIR"
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"

echo "[3/4] 备份文件信息..."
BACKUP_SIZE=$(du -sh "$BACKUP_NAME.tar.gz" | cut -f1)
echo "  - 备份文件: $BACKUP_NAME.tar.gz"
echo "  - 文件大小: $BACKUP_SIZE"
echo "  - 保存位置: $BACKUP_DIR"

echo "[4/4] 清理旧备份 (保留${KEEP_DAYS}天)..."
find "$BACKUP_DIR" -name "eagle_chat_backup_*.tar.gz" -mtime +$KEEP_DAYS -delete

echo ""
echo "✅ 备份完成！"
echo ""
echo "📊 备份统计："
echo "  - 最新备份: $BACKUP_NAME.tar.gz ($BACKUP_SIZE)"
echo "  - 备份总数: $(ls -1 $BACKUP_DIR/eagle_chat_backup_*.tar.gz 2>/dev/null | wc -l)"
echo "  - 总占用: $(du -sh $BACKUP_DIR | cut -f1)"
echo ""
echo "💡 恢复命令："
echo "  tar -xzf $BACKUP_DIR/$BACKUP_NAME.tar.gz -C /tmp"
echo "  mongorestore --uri='mongodb://$DB_USER:$DB_PASS@localhost:27017/$DB_NAME?authSource=$DB_NAME' /tmp/$BACKUP_NAME/$DB_NAME"
echo ""
