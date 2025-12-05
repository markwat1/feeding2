# 要件文書

## 概要

ペットの餌やり、体重測定、メンテナンス作業を記録・管理するWebアプリケーション。複数のペットに対して統一された餌管理を行い、個体別の体重記録と給水器・トイレのメンテナンス履歴を管理する。

## 用語集

- **Pet_Care_System**: ペット管理システム
- **Feed_Record**: 餌やり記録
- **Feed_Type**: 餌の種類
- **Pet**: ペット個体
- **Weight_Record**: 体重記録
- **Feeding_Schedule**: 餌やりスケジュール
- **Maintenance_Record**: メンテナンス記録
- **Water_Filter**: 給水器フィルター
- **Litter_Box**: トイレ砂
- **Nail_Clipping**: 爪切り

## 要件

### 要件1

**ユーザーストーリー:** ペット飼い主として、餌の種類を事前に登録したい。これにより、餌やり時に適切な餌を選択できる。

#### 受入基準

1. THE Pet_Care_System SHALL メーカー名と商品名を含む餌の種類を登録する機能を提供する
2. THE Pet_Care_System SHALL 登録された餌の種類をポップアップで選択可能にする
3. THE Pet_Care_System SHALL 餌の種類の一覧を表示する機能を提供する

### 要件2

**ユーザーストーリー:** ペット飼い主として、決まった時間に餌やりを記録したい。これにより、ペットの食事管理を適切に行える。

#### 受入基準

1. THE Pet_Care_System SHALL 餌やりの時間を事前にスケジュールとして登録する機能を提供する
2. WHEN 餌やり記録画面を開く時、THE Pet_Care_System SHALL 最も近いスケジュール時刻をデフォルト値として設定する
3. THE Pet_Care_System SHALL 餌やり時に餌の種類と時刻を記録する機能を提供する
4. THE Pet_Care_System SHALL 餌を食べきったかどうかを後から記録する機能を提供する

### 要件3

**ユーザーストーリー:** ペット飼い主として、前回の餌の摂食状況を記録したい。これにより、ペットの食欲や健康状態を把握できる。

#### 受入基準

1. WHEN 餌やり記録画面を開く時、IF 前回の餌の摂食記録が未登録の場合、THEN THE Pet_Care_System SHALL 前回の摂食状況の登録フォームを表示する
2. THE Pet_Care_System SHALL 餌の摂食状況を「食べきった」または「残した」として記録する機能を提供する
3. THE Pet_Care_System SHALL 摂食状況を2つのボタン（「食べきった」ボタンと「残した」ボタン）で直接記録可能にする
4. WHEN ユーザーが「食べきった」ボタンをクリックする時、THE Pet_Care_System SHALL 前回の餌やり記録の摂食状況を「食べきった」として即座に記録する
5. WHEN ユーザーが「残した」ボタンをクリックする時、THE Pet_Care_System SHALL 前回の餌やり記録の摂食状況を「残した」として即座に記録する

### 要件4

**ユーザーストーリー:** ペット飼い主として、ペットの個体情報と体重を管理したい。これにより、ペットの健康状態を追跡できる。

#### 受入基準

1. THE Pet_Care_System SHALL ペットの個体名を登録する機能を提供する
2. THE Pet_Care_System SHALL 体重をkg単位で小数点以下2桁まで記録する機能を提供する
3. THE Pet_Care_System SHALL 体重測定日付とともに体重記録を保存する機能を提供する
4. THE Pet_Care_System SHALL 不定期な体重測定記録に対応する

### 要件5

**ユーザーストーリー:** ペット飼い主として、餌やり記録をカレンダー形式で確認したい。これにより、ペットの食事履歴を視覚的に把握できる。

#### 受入基準

1. THE Pet_Care_System SHALL 餌やり記録をカレンダー形式で表示する機能を提供する
2. THE Pet_Care_System SHALL カレンダー上でその日のすべての餌やり記録を時刻付きで表示する
3. THE Pet_Care_System SHALL カレンダー上で餌の種類を商品名で表示する
4. WHEN 餌を食べきった場合、THE Pet_Care_System SHALL 該当記録を緑色で表示する
5. WHEN 餌を残した場合、THE Pet_Care_System SHALL 該当記録を黄色で表示する
6. WHEN 摂食状況が未記録の場合、THE Pet_Care_System SHALL 該当記録をグレー色で表示する
7. WHEN 体重を記録した場合、THE Pet_Care_System SHALL カレンダー上の該当日に体重を表示する

### 要件5.1

**ユーザーストーリー:** ペット飼い主として、カレンダー上の餌やり記録をクリックして詳細を確認したい。これにより、その日の全ての記録を一覧で確認できる。

#### 受入基準

1. WHEN カレンダー上の日付をクリックする時、THE Pet_Care_System SHALL その日のすべての記録を詳細モーダルで表示する
2. THE Pet_Care_System SHALL 詳細モーダルで餌やり記録、体重記録、メンテナンス記録を分類して表示する
3. THE Pet_Care_System SHALL 各餌やり記録に時刻、餌の種類、摂食状況を表示する
4. THE Pet_Care_System SHALL 摂食状況をクリックで切り替え可能にする

### 要件5.2

**ユーザーストーリー:** ペット飼い主として、カレンダーの詳細モーダルから餌やり記録を編集・削除したい。これにより、記録の修正や誤った記録の削除ができる。

#### 受入基準

1. THE Pet_Care_System SHALL 詳細モーダルで各餌やり記録に編集ボタンを提供する
2. WHEN 編集ボタンをクリックする時、THE Pet_Care_System SHALL インライン編集フォームを表示する
3. THE Pet_Care_System SHALL 編集フォームで餌の種類と時刻を変更可能にする
4. THE Pet_Care_System SHALL 各餌やり記録に削除ボタンを提供する
5. WHEN 削除ボタンをクリックする時、THE Pet_Care_System SHALL 確認ダイアログを表示する
6. THE Pet_Care_System SHALL 編集・削除操作の成功・失敗をメッセージで通知する

### 要件6

**ユーザーストーリー:** ペット飼い主として、給水器、トイレ、爪切りのメンテナンス履歴を記録したい。これにより、適切なメンテナンススケジュールを管理できる。

#### 受入基準

1. THE Pet_Care_System SHALL 給水器フィルター交換の記録機能を提供する
2. THE Pet_Care_System SHALL トイレ砂交換の記録機能を提供する
3. THE Pet_Care_System SHALL 爪切りの記録機能を提供する
4. THE Pet_Care_System SHALL メンテナンス記録に実施日時を含める
5. THE Pet_Care_System SHALL メンテナンス履歴を表示する機能を提供する

### 要件7

**ユーザーストーリー:** ペット飼い主として、Webアプリケーションを開いた時に餌やり記録画面が最初に表示されてほしい。これにより、日常的な餌やり作業を効率的に行える。

#### 受入基準

1. WHEN Pet_Care_System にアクセスする時、THE Pet_Care_System SHALL 餌やり記録画面を初期画面として表示する
2. THE Pet_Care_System SHALL 餌やり記録画面で餌の種類選択と時刻設定を可能にする