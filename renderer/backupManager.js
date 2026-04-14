class BackupManager {
    constructor() {
        this.storageKey = 'lg_data';
        this.backupKey = 'lg_backup';
        this.autoBackupInterval = null;
        this.gamesSinceBackup = 0;
    }

    exportData() {
        const data = {
            version: '4.0',
            exportDate: new Date().toISOString(),
            highScores: {},
            achievements: [],
            settings: {},
            theme: 'default',
            volume: 0.7,
            totalGamesPlayed: 0,
            totalPlayTime: 0,
            uniqueGamesPlayed: [],
            favorites: [],
            lastGameId: null,
            lastPlayed: {},
            stats: {}
        };

        for (let key in localStorage) {
            if (key.startsWith('lg_')) {
                try {
                    const value = localStorage.getItem(key);
                    const parsed = JSON.parse(value);
                    
                    const shortKey = key.replace('lg_', '');
                    data[shortKey] = parsed;
                } catch (e) {
                    console.warn(`Failed to parse ${key}:`, e);
                }
            }
        }

        return data;
    }

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (!data.version) {
                throw new Error('Invalid backup file format');
            }

            const keys = [
                'highScores', 'achievements', 'settings', 'theme', 'volume',
                'totalGamesPlayed', 'totalPlayTime', 'uniqueGamesPlayed',
                'favorites', 'lastGameId', 'lastPlayed', 'stats'
            ];

            keys.forEach(key => {
                if (data[key] !== undefined) {
                    localStorage.setItem(`lg_${key}`, JSON.stringify(data[key]));
                }
            });

            window.location.reload();
            return { success: true, message: 'Data imported successfully!' };
        } catch (e) {
            return { success: false, message: `Import failed: ${e.message}` };
        }
    }

    downloadBackup() {
        const data = this.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `lightning-games-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return { success: true, message: 'Backup downloaded!' };
    }

    uploadBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const result = this.importData(e.target.result);
                if (result.success) {
                    resolve(result);
                } else {
                    reject(new Error(result.message));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }

    startAutoBackup(gamesThreshold = 10) {
        if (this.autoBackupInterval) {
            clearInterval(this.autoBackupInterval);
        }

        this.autoBackupInterval = setInterval(() => {
            if (this.gamesSinceBackup >= gamesThreshold) {
                this.createAutoBackup();
                this.gamesSinceBackup = 0;
            }
        }, 60000);
    }

    stopAutoBackup() {
        if (this.autoBackupInterval) {
            clearInterval(this.autoBackupInterval);
            this.autoBackupInterval = null;
        }
    }

    createAutoBackup() {
        const data = this.exportData();
        localStorage.setItem(this.backupKey, JSON.stringify(data));
        console.log('Auto-backup created');
    }

    restoreAutoBackup() {
        try {
            const backup = localStorage.getItem(this.backupKey);
            if (backup) {
                const data = JSON.parse(backup);
                this.importData(backup);
                return { success: true, message: 'Auto-backup restored!' };
            }
            return { success: false, message: 'No auto-backup found' };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    incrementGameCount() {
        this.gamesSinceBackup++;
    }

    clearBackup() {
        localStorage.removeItem(this.backupKey);
    }

    getBackupInfo() {
        try {
            const backup = localStorage.getItem(this.backupKey);
            if (backup) {
                const data = JSON.parse(backup);
                return {
                    exists: true,
                    date: data.exportDate,
                    gamesPlayed: data.totalGamesPlayed,
                    achievementsCount: data.achievements?.length || 0
                };
            }
        } catch (e) {}
        return { exists: false };
    }
}

class CloudSyncManager {
    constructor() {
        this.enabled = false;
        this.lastSync = null;
    }

    async syncToCloud(data) {
        console.log('Cloud sync not available - placeholder for future implementation');
        return { success: false, message: 'Cloud sync not configured' };
    }

    async syncFromCloud() {
        console.log('Cloud sync not available - placeholder for future implementation');
        return { success: false, message: 'Cloud sync not configured' };
    }
}

window.backupManager = new BackupManager();
window.cloudSyncManager = new CloudSyncManager();
