import { saveAs } from 'file-saver';

export interface Version {
  id: string;
  timestamp: number;
  description: string;
  state: Record<string, any>;
}

export class VersionControl {
  private static readonly STORAGE_KEY = 'project_versions';

  static saveVersion(description: string, state: Record<string, any>): Version {
    const versions = this.getVersions();
    const newVersion: Version = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      description,
      state,
    };
    
    versions.push(newVersion);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(versions));
    return newVersion;
  }

  static getVersions(): Version[] {
    const versionsStr = localStorage.getItem(this.STORAGE_KEY);
    return versionsStr ? JSON.parse(versionsStr) : [];
  }

  static getVersion(id: string): Version | null {
    const versions = this.getVersions();
    return versions.find(v => v.id === id) || null;
  }

  static exportVersion(version: Version) {
    const blob = new Blob([JSON.stringify(version, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, `version-${version.id}-${new Date(version.timestamp).toISOString()}.json`);
  }

  static deleteVersion(id: string): boolean {
    const versions = this.getVersions();
    const newVersions = versions.filter(v => v.id !== id);
    if (newVersions.length !== versions.length) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newVersions));
      return true;
    }
    return false;
  }
}