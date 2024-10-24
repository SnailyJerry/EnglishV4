import React, { useState } from 'react';
import { Save, Download, Trash2, Eye } from 'lucide-react';
import { VersionControl, Version } from '../services/versionControl';

interface VersionManagerProps {
  onSaveVersion: () => void;
  onLoadVersion: (state: Record<string, any>) => void;
}

export default function VersionManager({ onSaveVersion, onLoadVersion }: VersionManagerProps) {
  const [versions, setVersions] = useState<Version[]>(() => VersionControl.getVersions());
  const [description, setDescription] = useState('');
  const [previewVersion, setPreviewVersion] = useState<Version | null>(null);

  const handleSaveVersion = () => {
    if (!description.trim()) return;
    onSaveVersion();
    setDescription('');
    setVersions(VersionControl.getVersions());
  };

  const handleExportVersion = (version: Version) => {
    VersionControl.exportVersion(version);
  };

  const handleDeleteVersion = (id: string) => {
    if (window.confirm('确定要删除这个版本吗？')) {
      VersionControl.deleteVersion(id);
      setVersions(VersionControl.getVersions());
    }
  };

  const handlePreviewVersion = (version: Version) => {
    setPreviewVersion(version);
    onLoadVersion(version.state);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80">
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="输入版本描述"
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSaveVersion}
          disabled={!description.trim()}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
        </button>
      </div>

      <div className="max-h-60 overflow-y-auto">
        {versions.map((version) => (
          <div
            key={version.id}
            className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg ${
              previewVersion?.id === version.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{version.description}</p>
              <p className="text-xs text-gray-500">
                {new Date(version.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePreviewVersion(version)}
                className="text-blue-500 hover:text-blue-600"
                title="预览此版本"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleExportVersion(version)}
                className="text-blue-500 hover:text-blue-600"
                title="导出版本"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteVersion(version.id)}
                className="text-red-500 hover:text-red-600"
                title="删除版本"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}