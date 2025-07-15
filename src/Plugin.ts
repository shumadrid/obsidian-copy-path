import {
  Notice,
  TAbstractFile,
  TFolder
} from 'obsidian';
import { PluginBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginBase';

import type { CopyPathPluginTypes } from './PluginTypes.ts';

import { CopyPathPluginSettingsManager } from './PluginSettingsManager.ts';
import { CopyPathPluginSettingsTab } from './PluginSettingsTab.ts';

export class CopyPathPlugin extends PluginBase<CopyPathPluginTypes> {
  protected override createSettingsManager(): CopyPathPluginSettingsManager {
    return new CopyPathPluginSettingsManager(this);
  }

  protected override createSettingsTab(): CopyPathPluginSettingsTab {
    return new CopyPathPluginSettingsTab(this);
  }

  protected override async onloadImpl(): Promise<void> {
    await super.onloadImpl();

    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        if (this.settings.copyVaultPathContextItem) {
          menu.addItem((item) => {
            item
              .setSection('info')
              .setTitle('Copy vault path')
              .setIcon('copy')
              .onClick(async () => {
                await copyVaultPath(file, this);
              });
          });
        }

        if (this.settings.copyFullPathContextItem) {
          menu.addItem((item) => {
            item
              .setSection('info')
              .setTitle('Copy full path')
              .setIcon('copy')
              .onClick(async () => {
                await copyFullPath(file, this);
              });
          });
        }
      })
    );

    // Register commands for hotkey mapping
    if (this.settings.copyVaultPathContextItem) {
      this.addCommand({
        callback: async () => {
          const targetFile = this.getTargetFileForCommand();
          await copyVaultPath(targetFile, this);
        },
        id: 'copy-vault-path',
        name: 'Copy Path: Copy vault path for current file'
      });
    }

    if (this.settings.copyFullPathContextItem) {
      this.addCommand({
        callback: async () => {
          const targetFile = this.getTargetFileForCommand();
          await copyFullPath(targetFile, this);
        },
        id: 'copy-full-path',
        name: 'Copy Path: Copy full path for current file'
      });
    }
  }

  private getTargetFileForCommand(): TAbstractFile {
    // Priority 1: Active file in editor
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      return activeFile;
    }

    // Priority 2: Selected file in file explorer (with defensive checks)
    try {
      const fileExplorerLeaves = this.app.workspace.getLeavesOfType('file-explorer');
      if (fileExplorerLeaves.length > 0 && fileExplorerLeaves[0]) {
        const fileExplorerView = fileExplorerLeaves[0].view as unknown;
        // Access with defensive checks using optional chaining
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        const selectedFile = (fileExplorerView as any)?.tree?.selectedDom?.file;
        if (selectedFile && selectedFile instanceof TAbstractFile) {
          return selectedFile;
        }
      }
    } catch (error) {
      // Log error but continue with fallback
      console.warn('Failed to access file explorer selection:', error);
    }

    // Priority 3: Vault root fallback
    return this.app.vault.getRoot();
  }
}

async function copyFullPath(
  file: TAbstractFile,
  plugin: CopyPathPlugin
): Promise<void> {
  let absolutePath = plugin.app.vault.adapter.getFullRealPath(file.path);

  if (file instanceof TFolder && plugin.settings.addTrailingSlashToFolders) {
    absolutePath += '/';
  }

  await navigator.clipboard.writeText(absolutePath);

  // Enhanced notice with source indication
  const isVaultRoot = file === plugin.app.vault.getRoot();
  const sourceIndicator = isVaultRoot ? ' (vault root)' : '';
  // eslint-disable-next-line no-magic-numbers
  new Notice(`Copied full path${sourceIndicator}:\n${absolutePath}`, 2000);
}

// Is normalized.
async function copyVaultPath(
  file: TAbstractFile,
  plugin: CopyPathPlugin
): Promise<void> {
  let vaultPath = file.path;

  if (file instanceof TFolder && plugin.settings.addTrailingSlashToFolders) {
    vaultPath += '/';
  }

  await navigator.clipboard.writeText(vaultPath);

  // Enhanced notice with source indication
  const isVaultRoot = file === plugin.app.vault.getRoot();
  const sourceIndicator = isVaultRoot ? ' (vault root)' : '';
  // eslint-disable-next-line no-magic-numbers
  new Notice(`Copied vault path${sourceIndicator}:\n${vaultPath}`, 2000);
}
