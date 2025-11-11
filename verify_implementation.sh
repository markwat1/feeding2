#!/bin/bash

echo "=== ペット体重グラフ機能実装の確認 ==="
echo

# Check if all new files exist
echo "📁 新しく作成されたファイルの確認:"
files=(
    "client/src/components/common/WeightChart.tsx"
    "client/src/components/common/WeightChart.module.css"
    "client/src/components/common/PeriodSelector.tsx"
    "client/src/components/common/PeriodSelector.module.css"
    "client/src/utils/dateUtils.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (見つかりません)"
    fi
done

echo
echo "📝 変更されたファイルの確認:"
modified_files=(
    "client/package.json"
    "client/src/components/PetManagement.tsx"
    "client/src/components/PetManagement.module.css"
)

for file in "${modified_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (見つかりません)"
    fi
done

echo
echo "📦 依存関係の確認:"
if grep -q "chart.js" client/package.json; then
    echo "✅ chart.js が package.json に追加されています"
else
    echo "❌ chart.js が package.json に見つかりません"
fi

if grep -q "react-chartjs-2" client/package.json; then
    echo "✅ react-chartjs-2 が package.json に追加されています"
else
    echo "❌ react-chartjs-2 が package.json に見つかりません"
fi

echo
echo "🔧 次のステップ:"
echo "1. 依存関係をインストール: ./install_chart_dependencies.sh"
echo "2. 開発サーバーを起動: npm run dev"
echo "3. ブラウザで http://localhost:3000 にアクセス"
echo "4. ペット管理ページで体重グラフ機能をテスト"

echo
echo "📖 詳細な実装情報は WEIGHT_CHART_IMPLEMENTATION.md を参照してください"