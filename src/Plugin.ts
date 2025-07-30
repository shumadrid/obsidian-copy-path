import {
  FileView,
  Notice,
  TAbstractFile,
  TFile,
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

    this.addCommand({
      checkCallback: (checking: boolean) => {
        const activeFile = this.getActiveFile();

        if (activeFile) {
          if (!checking) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            copyVaultPath(activeFile, this);
          }

          return true;
        }

        return false;
      },
      id: 'copy-vault-path',
      name: 'Copy vault path of focused item'
    });

    this.addCommand({
      checkCallback: (checking: boolean) => {
        const activeFile = this.getActiveFile();

        if (activeFile) {
          if (!checking) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            copyFullPath(activeFile, this);
          }

          return true;
        }

        return false;
      },
      id: 'copy-full-path',
      name: 'Copy full path of focused item'
    });
  }

  private getActiveFile(): null | TFile {
    // First try active file
    const activeFileView = this.app.workspace.getActiveViewOfType(FileView);
    if (activeFileView) {
      return activeFileView.file;
    }
    return null;
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
