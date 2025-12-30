QuestRoot v25 - 新セッション引き継ぎ資料
以下の内容を QuestRoot_v25_summary.md として保存してください。

Copy# QuestRoot v25 - 開発状況まとめ

**最終更新:** 2025-01-08  
**バージョン:** v25  
**形式:** 単一HTMLファイル（オフライン完結型）

---

## 📋 プロジェクト概要

### コンセプト
業務タスク管理ツール × RPG育成ゲームの融合システム

### 表向き
- 4階層のタスク管理システム
- プロジェクト進捗の可視化

### 実態
- キャラクター育成とタスク完了を連動
- 部門配置・転職によるステータス強化
- ゲーム要素でモチベーション維持

### 想定利用環境
- 会社での業務管理（英語UI、業務ツール風デザイン）
- オフライン完結（localStorageのみ使用）
- ブラウザで動作（HTML単一ファイル）

---

## ✅ 実装済み機能（v25時点）

### 1. タスク管理システム

#### 4階層構造
Tier 0: Main Quest - 大プロジェクト ↓ Tier 1: Section - 中カテゴリ ↓ Tier 2: Sub-Quest - 具体的タスクグループ ↓ Tier 3: Command - 実行する作業単位（経験値獲得対象）


#### タスク属性
- **タイプ:** Blitz（短期集中）/ Steady（継続監視）
- **優先度:** Normal / EMERGENCY
- **期限:** 日付設定可能
- **状態管理:** Work Done（作業完了）/ Report Done（報告完了）

#### 画面構成
- **左側:** ワールドマップ（全タスク階層表示）
- **中央:** バトルビュー（実行可能なCommandタスクのみ表示）
- **右側:** キャラクターパネル（パーティ状況表示）

#### 主要機能
- フォーカスモード（Main Questを1つに絞り込み）
- 折りたたみ機能
- テンプレート機能（Sub-Quest単位で保存・インポート）
- EXPORT/IMPORT（JSON形式、全データ対応）

---

### 2. キャラクター育成システム

#### パーティ構成
- **4人の部下** + **1人の上司（Commander/Elder）** = 合計5人
- 各キャラクター独立のレベル・ステータス管理
- 装備スロット: 2つ（未実装）

#### キャラクター属性
```javascript
character = {
    id: number,
    name: string,              // 苗字50種からランダム
    jobName: string,           // 職業名
    level: number,             // レベル
    exp: number,               // 経験値（現在未使用）
    baseStats: {               // 基礎ステータス
        hp: number,            // 体力
        mp: number,            // 魔力
        atk: number,           // 攻撃力
        def: number            // 防御力
    },
    equipment: [null, null],   // 装備スロット（未実装）
    isElder: boolean,          // Elder判定フラグ
    expPriority: boolean,      // 経験値優先フラグ
    deptLevelCount: number,    // 現在の部門で獲得したレベル数
    currentDepartment: string  // 現在の所属部門ID
}
レベルアップシステム
トリガー: Commandタスク完了時（✓ DONE または ⚡ QUICK）
処理内容:
ランダムで1人レベルアップ
ユーザーが選んだ優先キャラが1レベルアップ
Development Center の場合: さらにランダムで1人レベルアップ（合計3レベル）
ステータス上昇: HP/MP/ATK/DEFのいずれか1つがランダムで+1
3. 部門システム（6部門）
3-1. Development Center（研修部門）
特殊部門: 新規採用者の育成専門
固定Commander: Elder（Lv.99、全ステータス30、全システム対象外）
経験値ボーナス: 1.3倍（+30%）
レベルキャップ: Lv.5
職業（2種、重複可）:
Fresh Graduate（新卒）
Career Hire（中途採用）
配属条件: Lv.5到達で他部門へ配属可能
3-2. Business Development（事業開発部門）
部門バフ: ATK × 1.2
職業（5種、重複不可）:
Sales Lead
Account Manager
Proposal Specialist
Market Analyst
Commander
3-3. Operations（業務運用部門）
部門バフ: DEF × 1.2
職業（5種、重複不可）:
Process Manager
Quality Controller
Documentation
Support Staff
Commander
3-4. Planning & Strategy（企画戦略部門）
部門バフ: MP × 1.2
職業（5種、重複不可）:
Strategic Planner
Business Analyst
Project Coordinator
Research Specialist
Commander
3-5. Production & Delivery（製造・納品部門）
部門バフ: HP × 1.2
職業（5種、重複不可）:
Production Lead
Technical Staff
Quality Assurance
Logistics
Commander
3-6. Corporate Support（経営支援部門）
部門バフ: HP/MP/ATK/DEF すべて × 1.1
職業（5種、重複不可）:
HR Coordinator
Finance Staff
Legal & Compliance
General Affairs
Commander
4. バフ・デバフシステム
ステータス計算順序
基礎ステータス
  ↓
① 部門バフ適用（在籍中の部門のみ）
  ↓
② Commanderデバフ適用（Commander自身の場合: 全ステータス × 0.7）
  ↓
③ Commanderバフ適用（部下の場合）
  - HP × 1.1
  - MP × 1.15
  - ATK × 1.2
  - DEF × 1.1
  ↓
最終ステータス（表示値）
Commander の特性
自身: 全ステータスに -30% デバフ
効果: 部下4人に強力なバフを付与
スロット: 5番目（専用枠）
転職: 可能（通常メンバー ⇔ Commander の行き来可）
Elder の特性
固定キャラ: Development Center の5番目に固定配置
ステータス: Lv.99、全ステータス30
特殊処理: すべてのバフ・デバフ・育成システムの対象外
5. 部門間転職システム
転職条件
現在の部門で10レベル獲得（deptLevelCount >= 10）
週2回まで転職可能（月曜0時リセット）
Development Center → 通常部門の初回配属は対象外
転職時の処理
転職元の部門バフを基礎値に固定化
例: Business Development（ATK×1.2）→ Operations
- 転職前基礎ATK: 10
- 部門バフ適用後: 12
- 転職時: 基礎ATK が 10 → 12 に永続変更
職業名変更
転職先部門に移動
deptLevelCount を0にリセット
週次転職カウント +1
視覚的フィードバック
転職可能キャラの名前が赤色に変化
⚡ TRANSFER バッジ表示
転職ボタンが有効化（週次制限到達時は無効化）
週次制限
カウント方法: localStorageで管理
リセットタイミング: ページ読み込み時に月曜0時判定
表示: ヘッダーに「TRANSFERS: X/2」と常時表示
6. その他のシステム
総合戦闘力
計算式: パーティ全員の（HP + MP + ATK + DEF）の合計
表示場所: キャラクターパネル上部（⚔️ POWER: XXX）
用途: 将来の週次ボスバトルで使用予定
システムログ
表示位置: ヘッダー直下（常設）
表示行数: 5行分（カスタマイズ可能）
内容:
レベルアップ通知（タイムスタンプ付き）
転職通知
ステータス永続上昇通知
保持件数: 最新20件
操作: 手動クリアボタン付き
保留システム
キャラクターを「別部門待機」状態に移動可能
全部門共通の保留プール
保留からの復帰、または完全解雇が可能
❌ 未実装機能
優先度: 高
1. 装備システム
装備スロット: 2つ（既にデータ構造は存在）
必要な実装:
装備品の種類とステータスボーナス
ドロップ処理（タスク完了時？）
装着UI（モーダルまたはキャラクターカード内）
装備品データベース
2. 週次ボスバトル
概要: 週に1回、総合戦闘力でボスと戦闘
必要な実装:
ボスデータ（HP、推奨戦闘力など）
戦闘判定ロジック
報酬システム（装備品ドロップ？）
バトル演出
優先度: 中
3. 通常部門間での自由な配置換え
現在: Development Center → 通常部門のみ
拡張: 通常部門 ⇔ 通常部門の配置換え（転職とは別）
4. データ分析・統計
部門別の成長グラフ
タスク完了統計
キャラクター成長履歴
5. UI/UX改善
アニメーション追加（レベルアップ時など）
レスポンシブデザイン
モバイル対応
🎯 次のセッションで実装したい機能
提案1: 装備システム
検討事項
装備品の種類
武器 / 防具 / アクセサリ？
部門特化型装備？
ドロップ方法
タスク完了時にランダムドロップ？
ショップで購入？
レアリティ設定
★1～★5 のような段階？
ステータスボーナス
固定値 or パーセンテージ？
提案2: 週次ボスバトル
検討事項
ボスの強さ
総合戦闘力ベースの判定？
部門構成による有利不利？
報酬
装備品ドロップ
経験値ボーナス
特殊アイテム？
演出
シンプルなテキストベース？
アニメーション付き？
📁 データ構造
LocalStorage キー一覧
Copy'questRoot_dual_v25'        // タスクデータ
'questRoot_templates_v25'   // テンプレートデータ
'questRoot_departments_v25' // 部門・キャラクターデータ
'questRoot_reserve_v25'     // 保留キャラクターデータ
'questRoot_systemlog_v25'   // システムログ
'questRoot_transfer_v25'    // 週次転職カウントデータ
主要データ構造
Copy// タスク
task = {
    id: number,
    parentId: number | null,
    text: string,
    workDone: boolean,
    reportDone: boolean,
    comment: string,
    priority: 'normal' | 'emergency',
    type: 'blitz' | 'steady',
    deadline: string,
    completedAt: string,
    isCollapsed: boolean
}

// 部門
department = {
    characters: [char1, char2, char3, char4, commander_or_elder]
}

// 週次転職データ
weeklyTransferData = {
    weekStartDate: string,    // ISO形式（月曜0時）
    transferCount: number,    // 今週の転職回数
    maxTransfers: 2           // 上限
}
🐛 既知の問題・制約
仕様上の制約
Development Center のレベルキャップ（Lv.5）は絶対
週次転職は2回まで（仕様）
Elder は完全に固定（変更不可）
技術的制約
ブラウザのlocalStorage容量上限（約5MB）
単一HTMLファイル形式（外部ファイル読み込み不可）
未実装による制約
装備システムがないため、ステータス強化手段が限定的
週次ボスバトルがないため、総合戦闘力の用途が現状不明確
🔧 技術仕様
開発環境
言語: HTML + CSS + JavaScript（Vanilla JS）
フレームワーク: なし（Pure JavaScript）
依存関係: なし（外部ライブラリ不使用）
ストレージ: localStorage のみ
ファイル構成
QuestRoot_v25.html    ← すべてが1ファイルに集約
ブラウザ対応
Chrome / Edge / Firefox / Safari（モダンブラウザ）
IE 非対応（localStorage使用のため）
📝 開発履歴
v21（初期状態）
基本的なタスク管理システム
キャラクター育成システム
6部門システム
Development Center → 通常部門の配属機能
v22
レベルアップシステム実装
経験値優先フラグ
Development Center のレベルキャップ（Lv.5）
v23
システムログ追加（常設表示）
プログレスバー削除
タイムスタンプ付きログ
v24
部門バフシステム実装
総合戦闘力表示
ステータス加算値表示（例: HP 14(+4)）
v25（最新）
部門間転職システム実装
転職時の永続ステータス上昇
週次転職回数制限（2回/週）
Commander転職対応
転職可能時の視覚的フィードバック
💡 設計思想
ゲームバランス
転職による永続成長 で長期的な強化を実現
週次制限 で特定キャラの使い回しを防止
部門ごとの特性 で戦略的な配置を促す
ユーザー体験
タスク完了 = 報酬 の即時フィードバック
視覚的な成長実感（レベルアップ、ステータス上昇）
業務ツール風UI で職場でも使いやすい
拡張性
装備システム追加が容易（スロット確保済み）
週次ボスバトル追加が容易（戦闘力計算済み）
新部門追加が容易（DEPARTMENT_CONFIG に追加するだけ）
🚀 次のセッションへの要望
やりたいこと
装備システムの設計・実装

まずは仕様協議から
データ構造の確定
UI設計
週次ボスバトルの設計

ボスの強さ設定
報酬システム
質問・相談したいこと
（ここに記載）