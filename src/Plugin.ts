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
        name: 'Copy vault path of focused item'
      });
    }

    if (this.settings.copyFullPathContextItem) {
      this.addCommand({
        callback: async () => {
          const targetFile = this.getTargetFileForCommand();
          await copyFullPath(targetFile, this);
        },
        id: 'copy-full-path',
        name: 'Copy full path of focused item'
      });
    }
  }

  private getFileFallback(): TAbstractFile {
    // First try active file
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      return activeFile;
    }

    // Try to get selected file as secondary fallback
    const selectedFile = this.getSelectedFileFromExplorer();
    if (selectedFile) {
      return selectedFile;
    }

    // Final fallback: vault root
    return this.app.vault.getRoot();
  }

  private getSelectedFileFromExplorer(): null | TAbstractFile {
    try {
      const fileExplorerLeaves = this.app.workspace.getLeavesOfType('file-explorer');
      if (fileExplorerLeaves.length > 0 && fileExplorerLeaves[0]) {
        const fileExplorerView = fileExplorerLeaves[0].view as unknown;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        const selectedFile = (fileExplorerView as any)?.tree?.selectedDom?.file;
        if (selectedFile && selectedFile instanceof TAbstractFile) {
          return selectedFile;
        }
      }
    } catch (error) {
      console.warn('Failed to access file explorer selection:', error);
    }
    return null;
  }

  /**
   * Determines the target file for command execution based on focus:
   * 1. If file explorer has focus → use selected file/folder
   * 2. If editor has focus → use active file
   * 3. Fallback to vault root if neither
   */
  private getTargetFileForCommand(): TAbstractFile {
    // Get the currently focused element
    const activeElement = document.activeElement;

    // Check if file explorer has focus
    const hasFileExplorerFocus = activeElement?.closest('.nav-files-container, .workspace-leaf-content[data-type="file-explorer"]');

    if (hasFileExplorerFocus) {
      // File explorer has focus - use selected file/folder
      const selectedFile = this.getSelectedFileFromExplorer();
      if (selectedFile) {
        return selectedFile;
      }
    }

    // Check if editor has focus
    const hasEditorFocus = activeElement?.closest('.markdown-source-view, .markdown-preview-view, .workspace-leaf-content[data-type="markdown"]');

    if (hasEditorFocus) {
      // Editor has focus - use active file
      const activeFile = this.app.workspace.getActiveFile();
      if (activeFile) {
        return activeFile;
      }
    }

    // Neither has clear focus - try intelligent fallback
    return this.getFileFallback();
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
  // eslint-disable-next-line no-magic-numbers
  new Notice(`Copied full path:\n${absolutePath}`, 2000);
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
  // eslint-disable-next-line no-magic-numbers
  new Notice(`Copied vault path:\n${vaultPath}`, 2000);
}
