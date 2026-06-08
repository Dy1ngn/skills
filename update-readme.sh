#!/bin/bash
# 自动扫描 skills 目录，更新 README.md 中的 skill 列表
# 用法: bash update-readme.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
README="$SCRIPT_DIR/README.md"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 README.md 是否存在
if [ ! -f "$README" ]; then
    error "README.md 不存在于 $SCRIPT_DIR"
    exit 1
fi

# 收集所有 skill 文件夹（排除隐藏文件和脚本本身）
SKILLS=""
SKILL_COUNT=0

for dir in "$SCRIPT_DIR"/*/; do
    [ -d "$dir" ] || continue
    name="$(basename "$dir")"

    # 跳过隐藏文件夹和特殊文件
    [[ "$name" == .* ]] && continue
    [[ "$name" == "node_modules" ]] && continue
    [[ "$name" == "txtText" ]] && continue
    [[ "$name" == "tools" ]] && continue

    # 检查是否是有效的 skill（包含 README.md 或 SKILL.md）
    if [ ! -f "$dir/README.md" ] && [ ! -f "$dir/SKILL.md" ]; then
        warn "跳过 $name: 缺少 README.md 或 SKILL.md"
        continue
    fi

    # 尝试读取 skill 的描述（从 README.md）
    desc=""
    if [ -f "$dir/README.md" ]; then
        # 取第一个非空非标题行作为描述
        desc="$(grep -m1 -E '^[^#\-].+' "$dir/README.md" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')"
    fi

    # 如果没有描述，使用默认描述
    if [ -z "$desc" ]; then
        desc="暂无描述"
    fi

    # 生成表格行
    SKILLS="${SKILLS}| [$name](./$name) | $desc | |\n"
    SKILL_COUNT=$((SKILL_COUNT + 1))
done

# 生成列表内容
if [ -z "$SKILLS" ]; then
    LIST_CONTENT="> 暂无 skill，添加后会自动更新此处。"
else
    # 生成表格
    LIST_CONTENT="| Skill | 描述 | 适用场景 |\n"
    LIST_CONTENT="${LIST_CONTENT}|-------|------|----------|\n"
    LIST_CONTENT="${LIST_CONTENT}$(echo -e "$SKILLS" | sed 's/[[:space:]]*$//')"
fi

# 替换 README.md 中的标记区域
if [ -f "$README" ]; then
    # 使用 awk 替换两个标记之间的内容
    awk -v content="$LIST_CONTENT" '
    /<!-- SKILLS_LIST_START -->/ { print; print content; skip=1; next }
    /<!-- SKILLS_LIST_END -->/ { skip=0 }
    !skip { print }
    ' "$README" > "$README.tmp" && mv "$README.tmp" "$README"

    info "README.md 已更新 (共 $SKILL_COUNT 个 skill)"
else
    error "README.md 不存在"
    exit 1
fi
