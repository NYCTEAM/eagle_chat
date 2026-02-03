#!/bin/bash

#######################################
# Eagle Chat 磁盘监控脚本
# 监控 /mnt/7tb-disk 使用情况
#######################################

DISK_PATH="/mnt/7tb-disk"
MONGODB_DIR="/mnt/7tb-disk/mongodb/eagle-chat"
UPLOAD_DIR="/mnt/7tb-disk/eagle-chat-uploads"
BACKUP_DIR="/mnt/7tb-disk/eagle-chat-backups"
LOG_DIR="/mnt/7tb-disk/eagle-chat-logs"

# 警告阈值（百分比）
WARNING_THRESHOLD=80
CRITICAL_THRESHOLD=90

echo "=========================================="
echo "🦅 Eagle Chat 磁盘使用监控"
echo "=========================================="
echo ""

# 获取磁盘使用率
DISK_USAGE=$(df -h "$DISK_PATH" | awk 'NR==2 {print $5}' | sed 's/%//')
DISK_TOTAL=$(df -h "$DISK_PATH" | awk 'NR==2 {print $2}')
DISK_USED=$(df -h "$DISK_PATH" | awk 'NR==2 {print $3}')
DISK_AVAIL=$(df -h "$DISK_PATH" | awk 'NR==2 {print $4}')

echo "📊 总体磁盘使用："
echo "  - 挂载点: $DISK_PATH"
echo "  - 总容量: $DISK_TOTAL"
echo "  - 已使用: $DISK_USED ($DISK_USAGE%)"
echo "  - 可用: $DISK_AVAIL"
echo ""

# 检查警告级别
if [ "$DISK_USAGE" -ge "$CRITICAL_THRESHOLD" ]; then
    echo "🔴 严重警告: 磁盘使用率 ${DISK_USAGE}% (>= ${CRITICAL_THRESHOLD}%)"
elif [ "$DISK_USAGE" -ge "$WARNING_THRESHOLD" ]; then
    echo "🟡 警告: 磁盘使用率 ${DISK_USAGE}% (>= ${WARNING_THRESHOLD}%)"
else
    echo "🟢 正常: 磁盘使用率 ${DISK_USAGE}%"
fi
echo ""

echo "📁 各目录使用情况："

if [ -d "$MONGODB_DIR" ]; then
    MONGO_SIZE=$(du -sh "$MONGODB_DIR" 2>/dev/null | cut -f1)
    MONGO_COUNT=$(find "$MONGODB_DIR" -type f 2>/dev/null | wc -l)
    echo "  - MongoDB数据: $MONGO_SIZE ($MONGO_COUNT 个文件)"
else
    echo "  - MongoDB数据: 未初始化"
fi

if [ -d "$UPLOAD_DIR" ]; then
    UPLOAD_SIZE=$(du -sh "$UPLOAD_DIR" 2>/dev/null | cut -f1)
    UPLOAD_COUNT=$(find "$UPLOAD_DIR" -type f 2>/dev/null | wc -l)
    echo "  - 上传文件: $UPLOAD_SIZE ($UPLOAD_COUNT 个文件)"
else
    echo "  - 上传文件: 未初始化"
fi

if [ -d "$BACKUP_DIR" ]; then
    BACKUP_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/eagle_chat_backup_*.tar.gz 2>/dev/null | wc -l)
    echo "  - 数据库备份: $BACKUP_SIZE ($BACKUP_COUNT 个备份)"
    
    if [ "$BACKUP_COUNT" -gt 0 ]; then
        LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/eagle_chat_backup_*.tar.gz 2>/dev/null | head -1)
        LATEST_DATE=$(stat -c %y "$LATEST_BACKUP" 2>/dev/null | cut -d' ' -f1)
        LATEST_SIZE=$(du -sh "$LATEST_BACKUP" 2>/dev/null | cut -f1)
        echo "    最新备份: $(basename "$LATEST_BACKUP") ($LATEST_SIZE, $LATEST_DATE)"
    fi
else
    echo "  - 数据库备份: 未初始化"
fi

if [ -d "$LOG_DIR" ]; then
    LOG_SIZE=$(du -sh "$LOG_DIR" 2>/dev/null | cut -f1)
    LOG_COUNT=$(find "$LOG_DIR" -type f 2>/dev/null | wc -l)
    echo "  - 日志文件: $LOG_SIZE ($LOG_COUNT 个文件)"
else
    echo "  - 日志文件: 未初始化"
fi

echo ""
echo "💡 清理建议："

# 检查旧日志
if [ -d "$LOG_DIR" ]; then
    OLD_LOGS=$(find "$LOG_DIR" -name "*.log" -mtime +30 2>/dev/null | wc -l)
    if [ "$OLD_LOGS" -gt 0 ]; then
        echo "  - 发现 $OLD_LOGS 个超过30天的日志文件"
        echo "    清理命令: find $LOG_DIR -name '*.log' -mtime +30 -delete"
    fi
fi

# 检查旧备份
if [ -d "$BACKUP_DIR" ]; then
    OLD_BACKUPS=$(find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 2>/dev/null | wc -l)
    if [ "$OLD_BACKUPS" -gt 0 ]; then
        echo "  - 发现 $OLD_BACKUPS 个超过30天的备份文件"
        echo "    清理命令: find $BACKUP_DIR -name '*.tar.gz' -mtime +30 -delete"
    fi
fi

# 磁盘使用率高时的建议
if [ "$DISK_USAGE" -ge "$WARNING_THRESHOLD" ]; then
    echo ""
    echo "⚠️  磁盘使用率较高，建议："
    echo "  1. 清理旧日志文件"
    echo "  2. 清理旧备份文件"
    echo "  3. 检查上传文件是否有重复或无用文件"
    echo "  4. 考虑压缩MongoDB数据"
fi

echo ""
echo "=========================================="
