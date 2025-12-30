<script>
    const STORAGE_KEY = 'questRoot_dual_v25';
    const TEMP_KEY = 'questRoot_templates_v25';
    const DEPT_KEY = 'questRoot_departments_v25';
    const RESERVE_KEY = 'questRoot_reserve_v25';
    const LOG_KEY = 'questRoot_systemlog_v25';
    const TRANSFER_KEY = 'questRoot_transfer_v25';
    const EQUIPMENT_KEY = 'questRoot_equipment_v25';
    const OWNED_EQUIPMENT_KEY = 'questRoot_owned_equipment_v25';
    
    let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let templates = JSON.parse(localStorage.getItem(TEMP_KEY)) || [];
    let departments = JSON.parse(localStorage.getItem(DEPT_KEY)) || {};
    let reserveCharacters = JSON.parse(localStorage.getItem(RESERVE_KEY)) || [];
    let systemLogs = JSON.parse(localStorage.getItem(LOG_KEY)) || [];
    let weeklyTransferData = JSON.parse(localStorage.getItem(TRANSFER_KEY)) || initWeeklyTransferData();
    let ownedEquipment = JSON.parse(localStorage.getItem(OWNED_EQUIPMENT_KEY)) || [];
    let equipmentIdCounter = Math.max(...ownedEquipment.map(e => e.instanceId || 0), 0) + 1;
    let currentDepartment = 'training';
    let currentMode = 'map'; 
    let assigningCharacter = null;
    let assigningFromIndex = null;
    let assigningFromDepartment = null;
    let isTransferMode = false;
    const labels = ['Main Quest', 'Section', 'Sub-Quest', 'Command'];
    const LEVEL_CAP_FOR_ASSIGNMENT = 5;
    const LEVEL_FOR_TRANSFER = 10;

    const SURNAMES = [
        'Tanaka', 'Suzuki', 'Takahashi', 'Watanabe', 'Ito',
        'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato', 'Yoshida',
        'Yamada', 'Sasaki', 'Matsumoto', 'Inoue', 'Kimura',
        'Hayashi', 'Saito', 'Shimizu', 'Yamaguchi', 'Morita',
        'Ikeda', 'Hashimoto', 'Yamazaki', 'Ishikawa', 'Maeda',
        'Fujita', 'Okada', 'Hasegawa', 'Murakami', 'Kondo',
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
        'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
        'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson',
        'Martin', 'Lee', 'Thompson', 'White', 'Harris'
    ];

    const DEPARTMENT_CONFIG = {
        training: {
            name: 'Development Center',
            jobs: ['Fresh Graduate', 'Career Hire'],
            isTraining: true,
            expBonus: 1.3,
            buff: null
        },
        business: {
            name: 'Business Development',
            jobs: ['Sales Lead', 'Account Manager', 'Proposal Specialist', 'Market Analyst', 'Commander'],
            buff: { atk: 1.2 }
        },
        operations: {
            name: 'Operations',
            jobs: ['Process Manager', 'Quality Controller', 'Documentation', 'Support Staff', 'Commander'],
            buff: { def: 1.2 }
        },
        planning: {
            name: 'Planning & Strategy',
            jobs: ['Strategic Planner', 'Business Analyst', 'Project Coordinator', 'Research Specialist', 'Commander'],
            buff: { mp: 1.2 }
        },
        production: {
            name: 'Production & Delivery',
            jobs: ['Production Lead', 'Technical Staff', 'Quality Assurance', 'Logistics', 'Commander'],
            buff: { hp: 1.2 }
        },
        corporate: {
            name: 'Corporate Support',
            jobs: ['HR Coordinator', 'Finance Staff', 'Legal & Compliance', 'General Affairs', 'Commander'],
            buff: { hp: 1.1, mp: 1.1, atk: 1.1, def: 1.1 }
        }
    };

    // ========== Equipment System Constants ==========
    
    const EQUIPMENT_DROP_RATE = 0.05; // 5% drop rate
    const EQUIPMENT_RARITY_RATES = {
        1: 0.50, // ★1: 50% of drops (2.5% total)
        2: 0.20, // ★2: 20% of drops (1.0% total)
        3: 0.15, // ★3: 15% of drops (0.75% total)
        4: 0.10, // ★4: 10% of drops (0.5% total)
        5: 0.05  // ★5: 5% of drops (0.25% total)
    };

    const EQUIPMENT_DATABASE = [
        // ★1 Common Equipment (20 items)
        { id: 1, name: 'Iron Sword', type: 'weapon', rarity: 1, statBonus: { atk: 3 } },
        { id: 2, name: 'Wooden Staff', type: 'weapon', rarity: 1, statBonus: { mp: 4, atk: 1 } },
        { id: 3, name: 'Rusty Blade', type: 'weapon', rarity: 1, statBonus: { atk: 5 } },
        { id: 4, name: 'Training Sword', type: 'weapon', rarity: 1, statBonus: { atk: 2, mp: 2 } },
        { id: 5, name: 'Bronze Dagger', type: 'weapon', rarity: 1, statBonus: { atk: 4 } },
        { id: 6, name: 'Leather Armor', type: 'armor', rarity: 1, statBonus: { hp: 5, def: 2 } },
        { id: 7, name: 'Cloth Robe', type: 'armor', rarity: 1, statBonus: { mp: 6, def: 1 } },
        { id: 8, name: 'Padded Vest', type: 'armor', rarity: 1, statBonus: { hp: 7 } },
        { id: 9, name: 'Simple Shield', type: 'armor', rarity: 1, statBonus: { def: 4 } },
        { id: 10, name: 'Work Clothes', type: 'armor', rarity: 1, statBonus: { hp: 4, def: 2 } },
        { id: 11, name: 'Iron Mace', type: 'weapon', rarity: 1, statBonus: { atk: 4 } },
        { id: 12, name: 'Short Bow', type: 'weapon', rarity: 1, statBonus: { atk: 3, mp: 1 } },
        { id: 13, name: 'Stone Hammer', type: 'weapon', rarity: 1, statBonus: { atk: 5 } },
        { id: 14, name: 'Apprentice Wand', type: 'weapon', rarity: 1, statBonus: { mp: 5 } },
        { id: 15, name: 'Iron Spear', type: 'weapon', rarity: 1, statBonus: { atk: 4 } },
        { id: 16, name: 'Hide Armor', type: 'armor', rarity: 1, statBonus: { hp: 6, def: 1 } },
        { id: 17, name: 'Cloth Tunic', type: 'armor', rarity: 1, statBonus: { mp: 5, hp: 2 } },
        { id: 18, name: 'Wooden Shield', type: 'armor', rarity: 1, statBonus: { def: 3 } },
        { id: 19, name: 'Leather Boots', type: 'armor', rarity: 1, statBonus: { def: 2, hp: 2 } },
        { id: 20, name: 'Work Gloves', type: 'armor', rarity: 1, statBonus: { def: 1, hp: 3 } },

        // ★2 Uncommon Equipment (12 items)
        { id: 21, name: 'Steel Blade', type: 'weapon', rarity: 2, statBonus: { atk: 12 } },
        { id: 22, name: 'Apprentice Staff', type: 'weapon', rarity: 2, statBonus: { mp: 8, atk: 4 } },
        { id: 23, name: 'Hunter Bow', type: 'weapon', rarity: 2, statBonus: { atk: 10, mp: 2 } },
        { id: 24, name: 'Combat Knife', type: 'weapon', rarity: 2, statBonus: { atk: 11 } },
        { id: 25, name: 'Iron Warhammer', type: 'weapon', rarity: 2, statBonus: { atk: 13 } },
        { id: 26, name: 'Chain Mail', type: 'armor', rarity: 2, statBonus: { hp: 12, def: 5 } },
        { id: 27, name: 'Mage Robe', type: 'armor', rarity: 2, statBonus: { mp: 10, def: 3 } },
        { id: 28, name: 'Steel Shield', type: 'armor', rarity: 2, statBonus: { def: 8 } },
        { id: 29, name: 'Reinforced Vest', type: 'armor', rarity: 2, statBonus: { hp: 10, def: 4 } },
        { id: 30, name: 'Battle Gloves', type: 'armor', rarity: 2, statBonus: { def: 5, atk: 3 } },
        { id: 31, name: 'Elven Sword', type: 'weapon', rarity: 2, statBonus: { atk: 10, mp: 5 } },
        { id: 32, name: 'Dwarven Axe', type: 'weapon', rarity: 2, statBonus: { atk: 14 } },

        // ★3 Rare Equipment (8 items)
        { id: 33, name: 'Mithril Edge', type: 'weapon', rarity: 3, statBonus: { atk: 24 } },
        { id: 34, name: 'Wizard Staff', type: 'weapon', rarity: 3, statBonus: { mp: 18, atk: 8 } },
        { id: 35, name: 'Dragon Slayer', type: 'weapon', rarity: 3, statBonus: { atk: 26 } },
        { id: 36, name: 'Enchanted Blade', type: 'weapon', rarity: 3, statBonus: { atk: 20, mp: 6 } },
        { id: 37, name: 'Dragon Scale', type: 'armor', rarity: 3, statBonus: { hp: 22, def: 10 } },
        { id: 38, name: 'Archmage Robe', type: 'armor', rarity: 3, statBonus: { mp: 20, def: 7 } },
        { id: 39, name: 'Titanium Shield', type: 'armor', rarity: 3, statBonus: { def: 15 } },
        { id: 40, name: 'Sacred Armor', type: 'armor', rarity: 3, statBonus: { hp: 18, def: 9 } },

        // ★4 Epic Equipment - Department Specific (6 items)
        { id: 41, name: 'Revenue Seeker', type: 'weapon', rarity: 4, statBonus: { atk: 25, mp: 15 }, departmentRestriction: 'business' },
        { id: 42, name: 'Process Shield', type: 'armor', rarity: 4, statBonus: { def: 18, hp: 25 }, departmentRestriction: 'operations' },
        { id: 43, name: 'Mana Crystal', type: 'weapon', rarity: 4, statBonus: { mp: 35, atk: 10 }, departmentRestriction: 'planning' },
        { id: 44, name: 'Titan Hammer', type: 'weapon', rarity: 4, statBonus: { atk: 32, hp: 10 }, departmentRestriction: 'production' },
        { id: 45, name: 'Support Baton', type: 'weapon', rarity: 4, statBonus: { hp: 15, mp: 15, atk: 15, def: 15 }, departmentRestriction: 'corporate' },
        { id: 46, name: 'Training Manual', type: 'armor', rarity: 4, statBonus: { hp: 12, mp: 12, atk: 12, def: 12 }, departmentRestriction: 'training' },

        // ★5 Legendary Equipment - Department Specific (4 items)
        { id: 47, name: 'Golden Contract', type: 'weapon', rarity: 5, statBonus: { atk: 35, mp: 25 }, departmentRestriction: 'business' },
        { id: 48, name: 'Perfect System', type: 'armor', rarity: 5, statBonus: { hp: 40, mp: 20, def: 30 }, departmentRestriction: 'operations' },
        { id: 49, name: 'Strategic Vision', type: 'weapon', rarity: 5, statBonus: { mp: 45, atk: 20 }, departmentRestriction: 'planning' },
        { id: 50, name: 'Master Craft', type: 'weapon', rarity: 5, statBonus: { atk: 40, hp: 30 }, departmentRestriction: 'production' }
    ];
    
    function initWeeklyTransferData() {
        return {
            weekStartDate: getMondayOfWeek(new Date()),
            transferCount: 0,
            maxTransfers: 2
        };
    }

    function getMondayOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday.toISOString();
    }

    function checkAndResetWeeklyTransfers() {
        const currentMonday = getMondayOfWeek(new Date());
        if (weeklyTransferData.weekStartDate !== currentMonday) {
            weeklyTransferData = {
                weekStartDate: currentMonday,
                transferCount: 0,
                maxTransfers: 2
            };
            saveWeeklyTransferData();
        }
    }

    function canTransferThisWeek() {
        checkAndResetWeeklyTransfers();
        return weeklyTransferData.transferCount < weeklyTransferData.maxTransfers;
    }

    function incrementTransferCount() {
        weeklyTransferData.transferCount++;
        saveWeeklyTransferData();
    }

    function saveWeeklyTransferData() {
        localStorage.setItem(TRANSFER_KEY, JSON.stringify(weeklyTransferData));
    }

    function updateTransferCounter() {
        checkAndResetWeeklyTransfers();
        const counter = document.getElementById('transfer-counter');
        counter.textContent = `TRANSFERS: ${weeklyTransferData.transferCount}/${weeklyTransferData.maxTransfers}`;
        if (weeklyTransferData.transferCount >= weeklyTransferData.maxTransfers) {
            counter.classList.add('limit-reached');
        } else {
            counter.classList.remove('limit-reached');
        }
    }

    // ========== System Log Functions ==========
    
    function addSystemLog(icon, text, badge = null) {
        const timestamp = new Date().toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        systemLogs.push({ icon, text, badge, timestamp });
        
        if (systemLogs.length > 20) {
            systemLogs.shift();
        }
        
        saveSystemLog();
        renderSystemLog();
    }

    function renderSystemLog() {
        const logDiv = document.getElementById('system-log');
        
        if (systemLogs.length === 0) {
            logDiv.innerHTML = '<button class="btn-clear-log" onclick="clearSystemLog()">CLEAR</button>';
            logDiv.classList.remove('active');
            return;
        }
        
        logDiv.classList.add('active');
        logDiv.innerHTML = `
            <button class="btn-clear-log" onclick="clearSystemLog()">CLEAR</button>
            ${systemLogs.map(log => {
                const badgeHtml = log.badge 
                    ? `<span class="log-badge badge-${log.badge.toLowerCase()}">${log.badge}</span>` 
                    : '';
                
                return `
                    <div class="log-entry">
                        <span class="log-time">${log.timestamp}</span>
                        <span class="log-icon">${log.icon}</span>
                        <span class="log-text">${log.text}</span>
                        ${badgeHtml}
                    </div>
                `;
            }).join('')}
        `;
        
        logDiv.scrollTop = logDiv.scrollHeight;
    }

    function clearSystemLog() {
        if (confirm('すべてのログを削除しますか？')) {
            systemLogs = [];
            saveSystemLog();
            renderSystemLog();
        }
    }

    function saveSystemLog() {
        localStorage.setItem(LOG_KEY, JSON.stringify(systemLogs));
    }

    // ========== Level Up System ==========

    function toggleExpPriority(index) {
        const chars = getCurrentCharacters();
        
        chars.forEach(c => {
            if (c && !c.isElder) {
                c.expPriority = false;
            }
        });
        
        const selectedChar = chars[index];
        if (selectedChar && !selectedChar.isElder) {
            selectedChar.expPriority = true;
        }
        
        saveDepartments();
        saveAndRender();
    }

    function processLevelUp() {
        const dept = getCurrentDepartment();
        const isTraining = isTrainingDepartment();
        
        let eligibleChars = dept.characters.filter(c => {
            if (!c || c.isElder) return false;
            if (isTraining && c.level >= 5) return false;
            return true;
        });
        
        if (eligibleChars.length === 0) {
            if (isTraining) {
                addSystemLog('⚠️', 'パーティ全員がレベル上限（Lv.5）に達しています', null);
            }
            return;
        }
        
        const priorityChar = eligibleChars.find(c => c.expPriority === true);
        
        if (isTraining) {
            for (let i = 0; i < 2; i++) {
                if (eligibleChars.length === 0) break;
                
                const randomChar = eligibleChars[Math.floor(Math.random() * eligibleChars.length)];
                const result = levelUpCharacter(randomChar);
                if (result) {
                    addSystemLog('🎉', `${result.name} Lv.${result.oldLevel} → Lv.${result.newLevel} (${result.statName}+1)`, null);
                }
                
                if (randomChar.level >= 5) {
                    eligibleChars = eligibleChars.filter(c => c.id !== randomChar.id);
                }
            }
            
            if (priorityChar && priorityChar.level < 5) {
                const result = levelUpCharacter(priorityChar);
                if (result) {
                    addSystemLog('⭐', `${result.name} Lv.${result.oldLevel} → Lv.${result.newLevel} (${result.statName}+1)`, 'PRIORITY');
                }
            }
        } 
        else {
            const randomChar = eligibleChars[Math.floor(Math.random() * eligibleChars.length)];
            const result1 = levelUpCharacter(randomChar);
            if (result1) {
                addSystemLog('🎉', `${result1.name} Lv.${result1.oldLevel} → Lv.${result1.newLevel} (${result1.statName}+1)`, null);
            }
            
            if (priorityChar) {
                const result2 = levelUpCharacter(priorityChar);
                if (result2) {
                    addSystemLog('⭐', `${result2.name} Lv.${result2.oldLevel} → Lv.${result2.newLevel} (${result2.statName}+1)`, 'PRIORITY');
                }
            }
        }
        
        saveDepartments();
        saveAndRender();
    }

    function levelUpCharacter(character) {
        if (!character) return null;
        
        const oldLevel = character.level;
        
        if (isTrainingDepartment() && character.level >= 5) {
            return null;
        }
        
        character.level++;
        
        // 部門内レベルカウント更新
        if (character.deptLevelCount !== undefined) {
            character.deptLevelCount++;
        }
        
        const stats = ['hp', 'mp', 'atk', 'def'];
        const statNames = { hp: 'HP', mp: 'MP', atk: 'ATK', def: 'DEF' };
        const selectedStat = stats[Math.floor(Math.random() * 4)];
        character.baseStats[selectedStat]++;
        
        return {
            name: character.name,
            oldLevel: oldLevel,
            newLevel: character.level,
            stat: selectedStat,
            statName: statNames[selectedStat]
        };
    }

    // ========== Department & Character System ==========
    
    function initDepartments() {
        if (Object.keys(departments).length === 0) {
            for (let deptId in DEPARTMENT_CONFIG) {
                departments[deptId] = {
                    characters: Array(5).fill(null)
                };
            }
            
            departments.training.characters[4] = {
                id: 'elder-fixed',
                name: 'Elder',
                jobName: 'Elder',
                level: 99,
                exp: 0,
                baseStats: { hp: 30, mp: 30, atk: 30, def: 30 },
                equipment: [null, null],
                isElder: true,
                expPriority: false,
                deptLevelCount: 0,
                currentDepartment: 'training'
            };
            
            saveDepartments();
        }
        
        // 既存キャラクターへの新フィールド追加（後方互換性）
        for (let deptId in departments) {
            departments[deptId].characters.forEach(char => {
                if (char && !char.isElder) {
                    if (char.deptLevelCount === undefined) {
                        char.deptLevelCount = 0;
                    }
                    if (char.currentDepartment === undefined) {
                        char.currentDepartment = deptId;
                    }
                }
            });
        }
    }

    function getCurrentDepartment() {
        return departments[currentDepartment];
    }

    function getCurrentCharacters() {
        return getCurrentDepartment().characters;
    }

    function getOccupiedJobs() {
        const chars = getCurrentCharacters();
        return chars.filter(c => c !== null && !c.isElder).map(c => c.jobName);
    }

    function isTrainingDepartment() {
        return DEPARTMENT_CONFIG[currentDepartment].isTraining || false;
    }

    function isTrainingJob(jobName) {
        return jobName === 'Fresh Graduate' || jobName === 'Career Hire';
    }

    function randomStat(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomName() {
        return SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
    }

    function generateApplicant(jobName) {
        const baseStats = {
            hp: randomStat(5, 15),
            mp: randomStat(5, 15),
            atk: randomStat(5, 15),
            def: randomStat(5, 15)
        };

        return {
            id: Date.now() + Math.random(),
            name: randomName(),
            jobName: jobName,
            level: 1,
            exp: 0,
            baseStats: baseStats,
            equipment: [null, null],
            expPriority: false,
            deptLevelCount: 0,
            currentDepartment: 'training'
        };
    }

    function applyCommanderDebuff(stats) {
        return {
            hp: Math.floor(stats.hp * 0.7),
            mp: Math.floor(stats.mp * 0.7),
            atk: Math.floor(stats.atk * 0.7),
            def: Math.floor(stats.def * 0.7)
        };
    }

    function getCommanderBuffMultiplier() {
        const chars = getCurrentCharacters();
        const commander = chars.find(c => c && (c.jobName === 'Commander' || c.isElder));
        if (commander) {
            return { hp: 1.1, mp: 1.15, atk: 1.2, def: 1.1 };
        }
        return { hp: 1, mp: 1, atk: 1, def: 1 };
    }

    function getDisplayStats(character, deptId = currentDepartment) {
        if (!character) return null;
        
        let stats = {...character.baseStats};
        
        if (character.isElder) {
            return stats;
        }
        
        const deptConfig = DEPARTMENT_CONFIG[deptId];
        if (deptConfig.buff) {
            for (let stat in deptConfig.buff) {
                stats[stat] = Math.floor(stats[stat] * deptConfig.buff[stat]);
            }
        }
        
        if (character.jobName === 'Commander') {
            return applyCommanderDebuff(stats);
        }
        
        const buff = getCommanderBuffMultiplier();
        return {
            hp: Math.floor(stats.hp * buff.hp),
            mp: Math.floor(stats.mp * buff.mp),
            atk: Math.floor(stats.atk * buff.atk),
            def: Math.floor(stats.def * buff.def)
        };
    }

    function calculateTotalPower() {
        const chars = getCurrentCharacters();
        let totalPower = 0;
        
        chars.forEach(char => {
            if (char) {
                const stats = getDisplayStats(char);
                totalPower += stats.hp + stats.mp + stats.atk + stats.def;
            }
        });
        
        return totalPower;
    }

    function isReadyForAssignment(character) {
        return character && !character.isElder && isTrainingJob(character.jobName) && character.level >= LEVEL_CAP_FOR_ASSIGNMENT;
    }

    function isReadyForTransfer(character) {
        if (!character || character.isElder) return false;
        if (isTrainingJob(character.jobName)) return false;
        return character.deptLevelCount >= LEVEL_FOR_TRANSFER;
    }

    function saveDepartments() {
        localStorage.setItem(DEPT_KEY, JSON.stringify(departments));
        localStorage.setItem(RESERVE_KEY, JSON.stringify(reserveCharacters));
    }

    // ========== Test Functions for Equipment System ==========
    
    function testEquipmentDrop(times = 1) {
        console.log(`=== Equipment Drop Test (${times} times) ===`);
        const results = [];
        
        for (let i = 0; i < times; i++) {
            const result = dropEquipment();
            if (result) {
                results.push({
                    name: result.name,
                    rarity: result.rarity,
                    type: result.type,
                    statBonus: result.statBonus
                });
                console.log(`Drop ${i + 1}: ${result.name} ★${result.rarity} (${result.type})`);
            } else {
                console.log(`Drop ${i + 1}: No drop`);
            }
        }
        
        console.log(`=== Results Summary ===`);
        console.log(`Total drops: ${results.length}/${times} (${(results.length/times*100).toFixed(1)}%)`);
        
        const rarityCount = {};
        results.forEach(item => {
            rarityCount[item.rarity] = (rarityCount[item.rarity] || 0) + 1;
        });
        
        for (let rarity = 1; rarity <= 5; rarity++) {
            const count = rarityCount[rarity] || 0;
            const expectedRate = EQUIPMENT_RARITY_RATES[rarity] * EQUIPMENT_DROP_RATE * 100;
            const actualRate = (count / times) * 100;
            console.log(`★${rarity}: ${count} drops (Expected: ~${expectedRate.toFixed(2)}%, Actual: ${actualRate.toFixed(2)}%)`);
        }
        
        return results;
    }
    
    function testTaskCompletionWithDrops(times = 10) {
        console.log(`=== Task Completion Test (${times} times) ===`);
        
        // テスト用のタスクを作成
        const testTask = {
            id: 'test-task-' + Date.now(),
            text: 'Test Task for Equipment Drops',
            workDone: false,
            reportDone: false,
            parentId: null
        };
        
        tasks.push(testTask);
        
        let totalDrops = 0;
        for (let i = 0; i < times; i++) {
            // タスクを未完了状態にリセット
            testTask.workDone = false;
            testTask.reportDone = false;
            
            // タスク完了（ドロップ付き）
            quickFinish(testTask.id);
            
            // ドロップが発生したかチェック
            const lastItem = ownedEquipment[ownedEquipment.length - 1];
            if (lastItem && lastItem.equipmentId) {
                totalDrops++;
                console.log(`Task ${i + 1}: Equipment drop - ${lastItem.name} ★${lastItem.rarity}`);
            } else {
                console.log(`Task ${i + 1}: No equipment drop`);
            }
        }
        
        // テストタスクを削除
        tasks = tasks.filter(t => t.id !== testTask.id);
        saveAndRender();
        
        console.log(`=== Task Completion Results ===`);
        console.log(`Total tasks: ${times}`);
        console.log(`Equipment drops: ${totalDrops}`);
        console.log(`Drop rate: ${(totalDrops/times*100).toFixed(1)}% (Expected: ~5%)`);
        
        return { totalTasks: times, totalDrops, dropRate: totalDrops/times };
    }
    
    function showOwnedEquipment() {
        console.log('=== Owned Equipment ===');
        if (ownedEquipment.length === 0) {
            console.log('No equipment owned');
            return;
        }
        
        ownedEquipment.forEach((item, index) => {
            const rarityStars = '★'.repeat(item.rarity);
            const equippedText = item.isEquipped ? ` (Equipped to character ${item.equippedTo})` : ' (Not equipped)';
            console.log(`${index + 1}. ${item.name} ${rarityStars} - ${item.type}${equippedText}`);
            console.log(`   Stats:`, item.statBonus);
        });
    }
    
    function clearTestEquipment() {
        const testItems = ownedEquipment.filter(eq => eq.name && eq.name.includes('Test'));
        if (testItems.length > 0) {
            ownedEquipment = ownedEquipment.filter(eq => !eq.name.includes('Test'));
            saveOwnedEquipment();
            console.log(`Cleared ${testItems.length} test equipment items`);
        }
    }

    function switchDepartment(deptId) {
        currentDepartment = deptId;
        saveAndRender();
    }

    function renderDepartmentSelector(containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        for (let deptId in DEPARTMENT_CONFIG) {
            const config = DEPARTMENT_CONFIG[deptId];
            const btn = document.createElement('button');
            btn.className = `dept-btn ${deptId === currentDepartment ? 'active' : ''} ${config.isTraining ? 'training' : ''}`;
            btn.textContent = config.name;
            btn.onclick = () => {
                switchDepartment(deptId);
                if (containerId === 'modal-dept-selector') {
                    renderJobButtons();
                    document.getElementById('applicant-area').innerHTML = '';
                }
            };
            container.appendChild(btn);
        }
    }

    function renderCharacters() {
        const container = document.getElementById('character-list');
        container.innerHTML = '';
        
        const chars = getCurrentCharacters();
        const commanderIndex = 4;
        
        if (isTrainingDepartment()) {
            const bonusDiv = document.createElement('div');
            bonusDiv.className = 'training-bonus';
            bonusDiv.innerHTML = '✨ TRAINING BONUS: +30% EXP';
            container.appendChild(bonusDiv);
        }
        
        for (let i = 0; i < 4; i++) {
            const char = chars[i];
            if (char) {
                container.appendChild(createCharacterCard(char, i, false));
            } else {
                container.appendChild(createEmptyCard(i, false));
            }
        }
        
        const commander = chars[commanderIndex];
        if (commander) {
            container.appendChild(createCharacterCard(commander, commanderIndex, true));
        } else {
            container.appendChild(createEmptyCard(commanderIndex, true));
        }
        
        document.getElementById('total-power').innerText = calculateTotalPower();
    }

    function createCharacterCard(char, index, isCommander) {
        const card = document.createElement('div');
        const isElder = char.isElder || false;
        const ready = isReadyForAssignment(char) && isTrainingDepartment();
        const transferReady = isReadyForTransfer(char) && !isTrainingDepartment();
        
        card.className = `character-card ${isCommander ? (isElder ? 'elder' : 'commander') : ''} ${ready ? 'ready-for-assignment' : ''} ${transferReady ? 'ready-for-transfer' : ''}`;
        
        const displayStats = getDisplayStats(char);
        const baseStats = char.baseStats;
        
        const bonuses = {
            hp: displayStats.hp - baseStats.hp,
            mp: displayStats.mp - baseStats.mp,
            atk: displayStats.atk - baseStats.atk,
            def: displayStats.def - baseStats.def
        };
        
        const hasCommander = getCurrentCharacters().some(c => c && (c.jobName === 'Commander' || c.isElder));
        const deptConfig = DEPARTMENT_CONFIG[currentDepartment];
        const hasBuff = (deptConfig.buff !== null || hasCommander) && !isElder;
        
        const readyBadge = ready ? '<div class="ready-badge">✓ READY</div>' : '';
        const transferReadyBadge = transferReady ? '<div class="transfer-ready-badge">⚡ TRANSFER</div>' : '';
        const actionBtn = isElder ? '' : `<button class="char-action-btn" onclick="showCharacterMenu(${index})">⋮</button>`;
        
        const canTransfer = canTransferThisWeek();
        const assignBtn = ready ? `<button class="btn-assign" onclick="openAssignmentModal(${index}, false)">ASSIGN TO DEPARTMENT</button>` : '';
        const transferBtn = transferReady ? `<button class="btn-transfer" ${!canTransfer ? 'disabled' : ''} onclick="${canTransfer ? `openAssignmentModal(${index}, true)` : ''}">TRANSFER DEPARTMENT</button>` : '';
        
        const expPriorityBtn = !isElder ? `
            <button class="exp-priority-btn ${char.expPriority ? 'active' : ''}" 
                    onclick="toggleExpPriority(${index})">
                ⭐ EXP PRIORITY
            </button>
        ` : '';
        
        const levelCapWarning = (isTrainingDepartment() && char.level >= 5 && !isElder) ? `
            <div class="level-cap-warning">
                ⚠️ LEVEL CAP (ASSIGN TO DEPARTMENT)
            </div>
        ` : '';
        
        const nameClass = transferReady ? 'transfer-ready' : '';
        
        const formatStat = (stat, value, bonus) => {
            const bonusText = bonus !== 0 ? `<span class="stat-bonus">(+${bonus})</span>` : '';
            const colorClass = hasBuff ? 'buffed' : '';
            return `
                <div class="stat-item">
                    <span class="stat-label">${stat}</span>
                    <span class="stat-value ${colorClass}">${value}${bonusText}</span>
                </div>
            `;
        };
        
        card.innerHTML = `
            ${readyBadge}
            ${transferReadyBadge}
            ${actionBtn}
            <div class="character-header">
                <div>
                    <div class="character-name ${nameClass}">${char.name}</div>
                    <div class="character-job">${char.jobName}</div>
                </div>
                <div style="font-size: 0.7rem; color: var(--primary-color);">Lv.${char.level}</div>
            </div>
            <div class="character-stats">
                ${formatStat('HP', displayStats.hp, bonuses.hp)}
                ${formatStat('MP', displayStats.mp, bonuses.mp)}
                ${formatStat('ATK', displayStats.atk, bonuses.atk)}
                ${formatStat('DEF', displayStats.def, bonuses.def)}
            </div>
            ${expPriorityBtn}
            ${levelCapWarning}
            ${assignBtn}
            ${transferBtn}
        `;
        return card;
    }

    function createEmptyCard(index, isCommander) {
        const card = document.createElement('div');
        card.className = `character-card empty ${isCommander ? 'commander' : ''}`;
        card.innerHTML = `<div style="text-align:center; font-size:0.75rem; opacity:0.7;">
            ${isCommander ? '⭐ COMMANDER<br>PROMOTE FROM TEAM' : '➕ RECRUIT<br>MEMBER'}
        </div>`;
        if (!isCommander) {
            card.onclick = () => openPartyManagement();
        }
        return card;
    }

    function showCharacterMenu(index) {
        const chars = getCurrentCharacters();
        const char = chars[index];
        if (!char || char.isElder) return;
        
        if (confirm(`${char.name}を保留リストに移動しますか?`)) {
            reserveCharacters.push(char);
            chars[index] = null;
            saveDepartments();
            saveAndRender();
        }
    }

    // ========== Assignment/Transfer System ==========
    
    function openAssignmentModal(index, isTransfer = false) {
        const sourceDept = currentDepartment;
        const chars = departments[sourceDept].characters;
        const char = chars[index];
        
        if (!char) return;
        if (isTransfer && !isReadyForTransfer(char)) return;
        if (!isTransfer && !isReadyForAssignment(char)) return;
        
        assigningCharacter = char;
        assigningFromIndex = index;
        assigningFromDepartment = sourceDept;
        isTransferMode = isTransfer;
        
        // モーダルタイトル変更
        document.getElementById('assignment-modal-title').textContent = 
            isTransfer ? 'TRANSFER TO DEPARTMENT' : 'ASSIGN TO DEPARTMENT';
        document.getElementById('dept-select-label').textContent = 
            isTransfer ? '転職先部門:' : '配属先部門:';
        document.getElementById('confirm-assignment-btn').textContent = 
            isTransfer ? '✓ 転職を確定' : '✓ 配属を確定';
        
        // キャラクター情報表示
        document.getElementById('assign-char-name').innerText = `${char.name} (${char.jobName})`;
        document.getElementById('assign-char-info').innerText = 
            `Lv.${char.level} | Dept Level: ${char.deptLevelCount} | HP:${char.baseStats.hp} MP:${char.baseStats.mp} ATK:${char.baseStats.atk} DEF:${char.baseStats.def}`;
        
        // 転職時のステータス上昇表示
        if (isTransfer) {
            displayStatBoost(char, sourceDept);
        } else {
            document.getElementById('stat-boost-container').style.display = 'none';
        }
        
        // 部門リスト生成
        const deptSelect = document.getElementById('assign-dept-select');
        deptSelect.innerHTML = '';
        for (let deptId in DEPARTMENT_CONFIG) {
            if (isTransfer) {
                // 転職時は現在の部門以外を表示
                if (deptId !== sourceDept && !DEPARTMENT_CONFIG[deptId].isTraining) {
                    const option = document.createElement('option');
                    option.value = deptId;
                    option.textContent = DEPARTMENT_CONFIG[deptId].name;
                    deptSelect.appendChild(option);
                }
            } else {
                // 初回配属時はDevelopment Center以外を表示
                if (!DEPARTMENT_CONFIG[deptId].isTraining) {
                    const option = document.createElement('option');
                    option.value = deptId;
                    option.textContent = DEPARTMENT_CONFIG[deptId].name;
                    deptSelect.appendChild(option);
                }
            }
        }
        
        updateJobSelect();
        document.getElementById('assignment-modal').style.display = 'block';
    }

    function displayStatBoost(char, sourceDeptId) {
        const container = document.getElementById('stat-boost-container');
        const sourceDeptConfig = DEPARTMENT_CONFIG[sourceDeptId];
        
        if (!sourceDeptConfig.buff) {
            container.style.display = 'none';
            return;
        }
        
        const boosts = [];
        const statNames = { hp: 'HP', mp: 'MP', atk: 'ATK', def: 'DEF' };
        
        for (let stat in sourceDeptConfig.buff) {
            const baseStat = char.baseStats[stat];
            const boostedStat = Math.floor(baseStat * sourceDeptConfig.buff[stat]);
            const increase = boostedStat - baseStat;
            boosts.push({
                name: statNames[stat],
                old: baseStat,
                new: boostedStat,
                increase: increase
            });
        }
        
        if (boosts.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.innerHTML = `
            <div class="stat-boost-display">
                <div class="title">🎁 転職ボーナス（${sourceDeptConfig.name}）</div>
                ${boosts.map(b => `
                    <div class="stat-boost-item">
                        <span>${b.name}: ${b.old} → ${b.new}</span>
                        <span style="color: var(--command-color); font-weight: bold;">+${b.increase}</span>
                    </div>
                `).join('')}
                <div style="margin-top: 8px; font-size: 0.7rem; opacity: 0.7;">
                    ※ 転職時に基礎値に永続的に加算されます
                </div>
            </div>
        `;
        container.style.display = 'block';
    }

    function updateJobSelect() {
        const deptId = document.getElementById('assign-dept-select').value;
        const jobSelect = document.getElementById('assign-job-select');
        const dept = departments[deptId];
        const config = DEPARTMENT_CONFIG[deptId];
        
        const occupiedJobs = dept.characters.filter(c => c !== null && !c.isElder).map(c => c.jobName);
        
        jobSelect.innerHTML = '';
        config.jobs.forEach(job => {
            if (!occupiedJobs.includes(job)) {
                const option = document.createElement('option');
                option.value = job;
                option.textContent = job;
                jobSelect.appendChild(option);
            }
        });
        
        if (jobSelect.options.length === 0) {
            jobSelect.innerHTML = '<option value="">空きポジションがありません</option>';
        }
    }

    function confirmAssignment() {
        const targetDeptId = document.getElementById('assign-dept-select').value;
        const newJob = document.getElementById('assign-job-select').value;
        
        if (!newJob || newJob === '' || newJob === '空きポジションがありません') {
            alert('配属可能な職務がありません');
            return;
        }
        
        const targetDept = departments[targetDeptId];
        let targetIndex = -1;
        
        // Commanderへの転職の場合
        if (newJob === 'Commander') {
            targetIndex = 4;
            if (targetDept.characters[4] !== null) {
                alert('Commanderスロットは既に埋まっています');
                return;
            }
        } else {
            // 通常スロット（0-3）への配属/転職
            for (let i = 0; i < 4; i++) {
                if (targetDept.characters[i] === null) {
                    targetIndex = i;
                    break;
                }
            }
            if (targetIndex === -1) {
                alert('配属先に空きがありません');
                return;
            }
        }
        
        // 転職処理
        if (isTransferMode) {
            applyDepartmentBuffToBaseStats(assigningCharacter, assigningFromDepartment);
            incrementTransferCount();
            addSystemLog('🔄', `${assigningCharacter.name} が ${DEPARTMENT_CONFIG[assigningFromDepartment].name} から ${DEPARTMENT_CONFIG[targetDeptId].name} に転職しました`, null);
        }
        
        // 職業変更
        assigningCharacter.jobName = newJob;
        assigningCharacter.currentDepartment = targetDeptId;
        assigningCharacter.deptLevelCount = 0;
        
        // 移動処理
        targetDept.characters[targetIndex] = assigningCharacter;
        departments[assigningFromDepartment].characters[assigningFromIndex] = null;
        
        saveDepartments();
        closeAssignmentModal();
        saveAndRender();
        
        const actionText = isTransferMode ? '転職' : '配属';
        alert(`${assigningCharacter.name}を${DEPARTMENT_CONFIG[targetDeptId].name}の${newJob}に${actionText}しました！`);
    }

    function applyDepartmentBuffToBaseStats(character, sourceDeptId) {
        const sourceDeptConfig = DEPARTMENT_CONFIG[sourceDeptId];
        if (!sourceDeptConfig.buff) return;
        
        for (let stat in sourceDeptConfig.buff) {
            const oldValue = character.baseStats[stat];
            const newValue = Math.floor(oldValue * sourceDeptConfig.buff[stat]);
            character.baseStats[stat] = newValue;
            
            const increase = newValue - oldValue;
            if (increase > 0) {
                addSystemLog('📈', `${character.name} の ${stat.toUpperCase()} が ${oldValue} → ${newValue} に永続上昇`, null);
            }
        }
    }

    function closeAssignmentModal() {
        document.getElementById('assignment-modal').style.display = 'none';
        assigningCharacter = null;
        assigningFromIndex = null;
        assigningFromDepartment = null;
        isTransferMode = false;
    }

    // ========== Party Management Modal ==========
    
    function openPartyManagement() {
        document.getElementById('party-modal').style.display = 'block';
        renderDepartmentSelector('modal-dept-selector');
        renderJobButtons();
        renderReserveArea();
    }

    function closePartyManagement() {
        document.getElementById('party-modal').style.display = 'none';
        document.getElementById('applicant-area').innerHTML = '';
    }

    let currentApplicants = [];
    let recruitingJob = '';

    function renderJobButtons() {
        const area = document.getElementById('job-select-area');
        const config = DEPARTMENT_CONFIG[currentDepartment];
        const occupiedJobs = getOccupiedJobs();

        area.innerHTML = config.jobs.map(job => {
            const isTrainingJob = (job === 'Fresh Graduate' || job === 'Career Hire');
            const isOccupied = !isTrainingJob && occupiedJobs.includes(job);
            return `<button class="job-btn ${isOccupied ? 'disabled' : ''}" 
                            onclick="${isOccupied ? '' : `startRecruit('${job}')`}">
                            ${job}${isOccupied ? ' (配属済)' : ''}
                            </button>`;
        }).join('');
    }

    function startRecruit(jobName) {
        recruitingJob = jobName;
        currentApplicants = [];
        
        for (let i = 0; i < 3; i++) {
            currentApplicants.push(generateApplicant(jobName));
        }
        
        renderApplicants();
    }

    function renderApplicants() {
        const area = document.getElementById('applicant-area');
        area.innerHTML = `
            <div style="margin: 15px 0; font-size: 0.85rem; color: var(--primary-color);">
                応募者から1名を選択してください（3名中1名）
            </div>
            <div class="applicant-list">
                ${currentApplicants.map((app, i) => `
                    <div class="applicant-card" onclick="hireApplicant(${i})">
                        <div class="applicant-name">${app.name}</div>
                        <div class="applicant-job">${app.jobName}</div>
                        <div class="applicant-stats">
                            <div>HP: ${app.baseStats.hp}</div>
                            <div>MP: ${app.baseStats.mp}</div>
                            <div>ATK: ${app.baseStats.atk}</div>
                            <div>DEF: ${app.baseStats.def}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function hireApplicant(index) {
        const applicant = currentApplicants[index];
        
        const trainingChars = departments.training.characters;
        let targetIndex = -1;
        for (let i = 0; i < 4; i++) {
            if (trainingChars[i] === null) {
                targetIndex = i;
                break;
            }
        }
        
        if (targetIndex === -1) {
            alert('Development Centerに空きがありません');
            return;
        }
        
        trainingChars[targetIndex] = applicant;
        saveDepartments();
        saveAndRender();
        
        renderJobButtons();
        currentApplicants = [];
        document.getElementById('applicant-area').innerHTML = '<div style="color: var(--command-color); margin-top: 15px;">✓ 採用完了！Development Centerに配属されました</div>';
        
        setTimeout(() => {
            document.getElementById('applicant-area').innerHTML = '';
        }, 2000);
    }

    function renderReserveArea() {
        const area = document.getElementById('reserve-area');
        document.getElementById('reserve-count').innerText = reserveCharacters.length;
        
        if (reserveCharacters.length === 0) {
            area.innerHTML = '<div style="opacity: 0.5; font-size: 0.75rem;">保留中のメンバーはいません</div>';
            return;
        }
        
        area.innerHTML = reserveCharacters.map((char, i) => `
            <div class="reserve-card" onclick="showReserveMenu(${i})">
                <span class="name">${char.name}</span>
                <span class="job">${char.jobName}</span>
                ${isReadyForAssignment(char) ? '<span style="color: var(--command-color); margin-left: 8px;">✓</span>' : ''}
            </div>
        `).join('');
    }

    function showReserveMenu(index) {
        const char = reserveCharacters[index];
        const action = prompt(`${char.name}の処理を選択\n1: 現在の部門に復帰\n2: 完全に解雇`);
        
        if (action === '1') {
            const chars = getCurrentCharacters();
            
            let targetIndex = -1;
            for (let i = 0; i < 4; i++) {
                if (chars[i] === null) {
                    targetIndex = i;
                    break;
                }
            }
            if (targetIndex === -1) {
                alert('現在の部門に空きがありません');
                return;
            }
            chars[targetIndex] = char;
            reserveCharacters.splice(index, 1);
        } else if (action === '2') {
            if (confirm(`${char.name}を完全に解雇しますか？`)) {
                reserveCharacters.splice(index, 1);
            }
        }
        
        saveDepartments();
        saveAndRender();
        renderReserveArea();
        if (document.getElementById('party-modal').style.display === 'block') {
            renderJobButtons();
        }
    }

    // ========== Task System ==========
    
    function saveAndRender() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        localStorage.setItem(TEMP_KEY, JSON.stringify(templates));
        if (currentMode === 'map') {
            render();
            renderBattleView();
            renderDepartmentSelector('dept-selector');
            renderCharacters();
            renderSystemLog();
            updateTransferCounter();
        } else {
            renderTemplateEditor();
        }
    }

    function addTask(pId) {
        const input = document.getElementById(pId ? `input-${pId}` : 'main-input');
        if (!input || !input.value) return;

        const newId = Date.now();
        const newTask = { 
            id: newId, parentId: pId, text: input.value, 
            workDone: false, reportDone: false, comment: "", 
            priority: 'normal', type: 'blitz', isCollapsed: false
        };

        if (pId) {
            const dEl = document.getElementById(`date-${pId}`), 
                  pEl = document.getElementById(`priority-${pId}`), 
                  tEl = document.getElementById(`type-${pId}`);
            if (dEl && dEl.value) newTask.deadline = dEl.value;
            if (pEl) newTask.priority = pEl.value;
            if (tEl) newTask.type = tEl.value;
            
            const parent = tasks.find(x => x.id === pId);
            if (parent) parent.isCollapsed = false;
        }

        tasks.push(newTask);
        input.value = "";
        saveAndRender();

        setTimeout(() => {
            const depth = getTaskDepth(newId);
            if (depth < 3) {
                const nextInput = document.getElementById(`input-${newId}`);
                if (nextInput) nextInput.focus();
            } else {
                if (input) input.focus();
            }
        }, 10);
    }

    function enableFocus(id) {
        tasks.forEach(t => {
            if (t.parentId === null) {
                t.isCollapsed = (t.id !== id);
            }
        });
        saveAndRender();
    }

    function toggleCollapse(id) {
        const t = tasks.find(x => x.id === id);
        if (t) {
            t.isCollapsed = !t.isCollapsed;
            saveAndRender();
        }
    }

    function handleGlobalInputKey(e, pId) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            addTask(pId);
        }
    }

    function render() {
        const container = document.getElementById('task-container');
        container.innerHTML = `
            <div style="background: var(--panel-bg); padding: 15px; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 20px;">
                <input type="text" id="main-input" style="width:80%;" placeholder="DEPLOY MAIN MISSION..." onkeydown="handleGlobalInputKey(event, null)">
                <button class="btn-utility" style="background:var(--main-quest-color)" onclick="addTask(null)">DEPLOY</button>
            </div>`;
        tasks.filter(t => t.parentId === null && !t.reportDone).forEach(t => container.appendChild(createTaskElement(t, 0)));
    }

    function createTaskElement(t, depth) {
        const div = document.createElement('div');
        div.className = "task-item";
        
        const children = tasks.filter(x => x.parentId === t.id && !x.reportDone);
        
        let subInputHtml = "";
        let childrenHtml = "";

        const controls = (depth === 0) 
            ? `<button class="btn-toggle" onclick="toggleCollapse(${t.id})">${t.isCollapsed ? '+' : '-'}</button>
               <button class="btn-focus" onclick="enableFocus(${t.id})">FOCUS</button>` 
            : "";

        if (!t.isCollapsed) {
            if (depth < 3) {
                const isSection = (depth === 1), isSub = (depth === 2);
                const extra = isSub ? `<input type="date" id="date-${t.id}"><select id="type-${t.id}"><option value="blitz">⚡ Blitz</option><option value="steady">📊 Steady</option></select><select id="priority-${t.id}"><option value="normal">Normal</option><option value="emergency">EMERGENCY</option></select>` : "";
                const tempImport = isSection && templates.length > 0 ? `<select onchange="importTemplate(${t.id}, this.value); this.value='';"><option value="">IMPORT TEMP</option>${templates.map((temp, i) => `<option value="${i}">${temp.name}</option>`).join('')}</select>` : "";
                subInputHtml = `<div class="sub-input-area"><input type="text" id="input-${t.id}" placeholder="ADD ${labels[depth+1].toUpperCase()}..." style="flex:1;" onkeydown="handleGlobalInputKey(event, ${t.id})"><button class="btn-utility" onclick="addTask(${t.id})">+</button>${extra}${tempImport}</div>`;
            }
            const childrenWrapper = document.createElement('div');
            childrenWrapper.className = "indent";
            children.sort((a,b) => (a.deadline||'9999-12-31').localeCompare(b.deadline||'9999-12-31')).forEach(c => childrenWrapper.appendChild(createTaskElement(c, depth+1)));
            childrenHtml = childrenWrapper.outerHTML;
        } else {
            subInputHtml = `<span class="collapsed-hint">(${children.length} tasks hidden)</span>`;
        }

        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px;">
                ${controls}
                <span class="tier-label label-${depth}">${labels[depth]}</span>
                ${depth===3?`<span class="type-tag type-${t.type}">${t.type==='blitz'?'⚡':'📊'}</span>`:''}
                <span class="editable-text" onclick="enableEdit(${t.id}, this)">${t.text}</span>
                ${depth===3?`<input type="date" value="${t.deadline||''}" class="deadline-badge" onchange="updateDeadline(${t.id}, this.value)">`:''}
                <button style="background:none; border:none; color:var(--danger-color); cursor:pointer;" onclick="deleteTask(${t.id})">&times;</button>
            </div>${subInputHtml}${childrenHtml}`;

        return div;
    }

    function renderBattleView() {
        const listBlitz = document.getElementById('list-blitz'), listSteady = document.getElementById('list-steady');
        listBlitz.innerHTML = ""; listSteady.innerHTML = "";
        let active = tasks.filter(t => !t.reportDone && areChildrenReported(t.id) && getTaskDepth(t.id) === 3);
        active.sort((a,b) => (a.deadline||'9999-12-31').localeCompare(b.deadline||'9999-12-31'));
        
        active.forEach(t => {
            const subQuest = tasks.find(x => x.id === t.parentId) || {};
            const section = tasks.find(x => x.id === subQuest.parentId) || {};
            const mainQuest = tasks.find(x => x.id === section.parentId) || {};
            const container = (t.type === 'blitz') ? listBlitz : listSteady;

            const div = document.createElement('div');
            div.className = `battle-item ${t.workDone?'work-done':''} priority-${t.priority}`;
            div.innerHTML = `
                <div class="breadcrumb">
                    <b style="color:var(--main-quest-color)">${mainQuest.text || '???'}</b> > 
                    <span>${section.text || '???'}</span> > 
                    <b style="color:var(--sub-quest-color)">${subQuest.text || '???'}</b>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.6rem; opacity:0.7;">
                    <span style="color:${t.priority==='emergency'?'var(--danger-color)':'inherit'}; font-weight:bold;">${t.priority.toUpperCase()}</span>
                    <span>⏰ ${t.deadline||'NO DATE'}</span>
                </div>
                <div style="font-weight:bold; margin-top:4px; font-size:0.9rem;">${t.text}</div>
                <div class="battle-btn-group">
                    ${!t.workDone ? `<button class="btn-action btn-quick" onclick="quickFinish(${t.id})">⚡ QUICK</button><button class="btn-action btn-main" style="background:var(--work-done-color); color:white;" onclick="completeWork(${t.id})">✓ DONE</button>` 
                    : `<input type="text" style="width:100%; margin-top:8px;" placeholder="LOG..." onchange="tasks.find(x=>x.id===${t.id}).comment=this.value"><button class="btn-action btn-main" style="background:var(--report-done-color); color:white; width:100%;" onclick="completeReport(${t.id})">✓ FINALIZE</button>`}
                </div>`;
            container.appendChild(div);
        });
        document.getElementById('count-blitz').innerText = active.filter(t => t.type==='blitz').length;
        document.getElementById('count-steady').innerText = active.filter(t => t.type==='steady').length;
    }

    function toggleMode() {
        currentMode = (currentMode === 'map') ? 'template' : 'map';
        document.getElementById('world-map').style.display = (currentMode === 'map') ? 'block' : 'none';
        document.getElementById('template-editor').style.display = (currentMode === 'template') ? 'block' : 'none';
        document.getElementById('battle-view').style.display = (currentMode === 'map') ? 'block' : 'none';
        document.getElementById('character-panel').style.display = (currentMode === 'map') ? 'block' : 'none';
        document.getElementById('mode-btn').innerText = (currentMode === 'map') ? 'TEMPLATE MODE' : 'MAP MODE';
        document.getElementById('main-container').style.gridTemplateColumns = (currentMode === 'map') ? '1fr 450px 280px' : '1fr';
        saveAndRender();
    }

    function quickFinish(id) {
        const t = tasks.find(x => x.id === id);
        t.workDone = true; 
        t.reportDone = true; 
        t.completedAt = new Date().toISOString();
        
        processLevelUp();
        dropEquipment();
        
        checkParentReportStatus(t.parentId); 
        saveAndRender();
    }

    function completeWork(id) { 
        tasks.find(t => t.id === id).workDone = true; 
        
        processLevelUp();
        dropEquipment();
        
        saveAndRender(); 
    }

    function completeReport(id) {
        const t = tasks.find(x => x.id === id);
        t.reportDone = true; 
        t.completedAt = new Date().toISOString();
        checkParentReportStatus(t.parentId); 
        saveAndRender();
    }

    function checkParentReportStatus(pId) {
        if (!pId) return;
        const siblings = tasks.filter(t => t.parentId === pId);
        if (siblings.length > 0 && siblings.every(c => c.reportDone)) {
            const p = tasks.find(t => t.id === pId);
            if (p) { p.reportDone = true; p.completedAt = new Date().toISOString(); checkParentReportStatus(p.parentId); }
        }
    }

    function areChildrenReported(pId) { 
        const c = tasks.filter(x=>x.parentId===pId); 
        return c.length===0?true:c.every(x=>x.reportDone && areChildrenReported(x.id)); 
    }

    function getTaskDepth(id) { 
        let d=0, c=tasks.find(x=>x.id===id); 
        while(c&&c.parentId){d++; c=tasks.find(x=>x.id===c.parentId);} 
        return d; 
    }

    function enableEdit(id, el) { 
        const t = tasks.find(x=>x.id===id); 
        el.onclick=null;
        el.innerHTML = `<input type="text" class="edit-input" value="${t.text}" onkeydown="if(event.key==='Enter') finishEdit(${id}, this.value)">`;
        el.querySelector('input').focus();
    }

    function finishEdit(id, txt) { 
        if(txt) tasks.find(x=>x.id===id).text=txt; 
        saveAndRender(); 
    }

    function updateDeadline(id, val) { 
        tasks.find(x=>x.id===id).deadline=val; 
        saveAndRender(); 
    }

    function deleteTask(id) { 
        if(confirm("DELETE?")) { 
            tasks=tasks.filter(x=>x.id!==id && x.parentId!==id); 
            saveAndRender(); 
        } 
    }

    function exportData() { 
        const blob=new Blob([JSON.stringify({tasks,templates,departments,reserveCharacters,systemLogs,weeklyTransferData})],{type:'application/json'}); 
        const a=document.createElement('a'); 
        a.href=URL.createObjectURL(blob); 
        a.download='QuestRoot_v25.json'; 
        a.click(); 
    }

    function importData(e) { 
        const r=new FileReader(); 
        r.onload=(ev)=>{ 
            const d=JSON.parse(ev.target.result); 
            tasks=d.tasks||[]; 
            templates=d.templates||[]; 
            departments=d.departments||{}; 
            reserveCharacters=d.reserveCharacters||[];
            systemLogs=d.systemLogs||[];
            weeklyTransferData=d.weeklyTransferData||initWeeklyTransferData();
            initDepartments(); 
            saveAndRender(); 
        }; 
        r.readAsText(e.target.files[0]); 
    }

    function clearAllData() { 
        if(confirm("WIPE ALL?")) { 
            tasks=[]; 
            templates=[]; 
            departments={}; 
            reserveCharacters=[];
            systemLogs=[];
            weeklyTransferData=initWeeklyTransferData();
            initDepartments(); 
            saveAndRender(); 
        } 
    }

    function openArchiveTab() {
        const cmds = tasks.filter(t => t.reportDone && getTaskDepth(t.id)===3);
        const win = window.open("", "_blank");
        win.document.write(`<body style="background:#0f172a; color:white; font-family:sans-serif; padding:20px;"><h1>LOGS</h1>${cmds.map(t => `<div><b>${t.text}</b><br><small>${t.completedAt}</small></div>`).join('')}</body>`);
    }

    let tempWorkingSub = { text: "New Template Set", commands: [] };
    
    function renderTemplateEditor() {
        const area = document.getElementById('template-designer-area');
        area.innerHTML = `
            <div style="background: var(--panel-bg); padding: 20px; border-radius: 12px; border: 1px solid var(--template-color); margin-bottom: 20px;">
                <h3 style="margin-top:0; color: var(--template-color);">TEMPLATE DESIGNER</h3>
                <div style="display:flex; gap:10px;"><input type="text" id="temp-name-input" style="flex:1;" placeholder="TEMPLATE NAME..."><button class="btn-utility btn-template" onclick="saveTemplate()">SAVE TEMPLATE</button></div>
                <div id="template-list-area" style="margin-top: 15px; display:flex; flex-wrap:wrap; gap:8px;"></div>
            </div>
            <div class="task-item" style="border-color: var(--sub-quest-color)">
                <span class="tier-label label-2">SUB-QUEST (ROOT)</span>
                <input type="text" value="${tempWorkingSub.text}" style="width:70%; margin-left:10px;" onchange="tempWorkingSub.text=this.value">
                <div class="sub-input-area">
                    <input type="text" id="temp-cmd-input" placeholder="COMMAND NAME..." style="flex:1;" onkeydown="if(event.ctrlKey && event.key==='Enter') addCmdToTemp()">
                    <select id="temp-cmd-type"><option value="blitz">⚡ Blitz</option><option value="steady">📊 Steady</option></select>
                    <button class="btn-utility" onclick="addCmdToTemp()">+</button>
                </div>
                <div class="indent">${tempWorkingSub.commands.map((c, i) => `<div class="task-item"><b>${c.type==='blitz'?'⚡':'📊'} ${c.text}</b></div>`).join('')}</div>
            </div>`;
        const listArea = document.getElementById('template-list-area');
        listArea.innerHTML = templates.map((t, idx) => `<div style="background:rgba(236, 72, 153, 0.2); border:1px solid var(--template-color); padding:4px 8px; border-radius:4px; font-size:0.7rem; display:flex; gap:6px; align-items:center;"><span>${t.name}</span><button onclick="deleteTemplate(${idx})" style="background:none; border:none; color:red; cursor:pointer;">&times;</button></div>`).join('');
    }

    function addCmdToTemp() {
        const txt = document.getElementById('temp-cmd-input').value;
        if(!txt) return;
        tempWorkingSub.commands.push({ text: txt, type: document.getElementById('temp-cmd-type').value, priority: 'normal' });
        document.getElementById('temp-cmd-input').value = ""; 
        renderTemplateEditor(); 
        document.getElementById('temp-cmd-input').focus();
    }

    function saveTemplate() {
        const name = document.getElementById('temp-name-input').value;
        if(!name) return;
        templates.push({ name: name, subQuest: JSON.parse(JSON.stringify(tempWorkingSub)) }); 
        saveAndRender();
    }

    function deleteTemplate(idx) { 
        templates.splice(idx, 1); 
        saveAndRender(); 
    }

    function importTemplate(sectionId, templateIdx) {
        const t = templates[templateIdx];
        const subId = Date.now();
        tasks.push({ id: subId, parentId: sectionId, text: t.subQuest.text, workDone: false, reportDone: false });
        t.subQuest.commands.forEach((c, i) => { 
            tasks.push({ id: subId+1+i, parentId: subId, text: c.text, type: c.type, priority: 'normal', workDone: false, reportDone: false }); 
        });
        saveAndRender();
    }

    // Initialize
    initDepartments();
    checkAndResetWeeklyTransfers();
    saveAndRender();
</script>
