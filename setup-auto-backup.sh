#!/bin/bash

#######################################
# 设置Eagle Chat自动备份
# 每天凌晨3点自动备份数据库
#######################################

echo "=========================================="
echo "🦅 设置Eagle Chat自动备份"
echo "=========================================="
echo ""

SCRIPT_DIR="/opt/eagle-chat"
BACKUP_SCRIPT="$SCRIPT_DIR/backup-database.sh"

# 确保备份脚本存在且可执行
if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo "❌ 备份脚本不存在: $BACKUP_SCRIPT"
    exit 1
fi

chmod +x "$BACKUP_SCRIPT"

# 添加cron任务
CRON_JOB="0 3 * * * $BACKUP_SCRIPT >> /mnt/7tb-disk/eagle-chat-logs/backup.log 2>&1"

# 检查cron任务是否已存在
if crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
    echo "⚠️  自动备份任务已存在"
else
    # 添加新的cron任务
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ 自动备份任务已添加"
fi

echo ""
echo "📋 备份计划："
echo "  - 时间: 每天凌晨3点"
echo "  - 脚本: $BACKUP_SCRIPT"
echo "  - 日志: /mnt/7tb-disk/eagle-chat-logs/backup.log"
echo "  - 保留: 30天"
echo ""
echo "💡 管理命令："
echo "  - 查看任务: crontab -l"
echo "  - 手动备份: $BACKUP_SCRIPT"
echo "  - 查看日志: tail -f /mnt/7tb-disk/eagle-chat-logs/backup.log"
echo ""
echo "✅ 设置完成！"
