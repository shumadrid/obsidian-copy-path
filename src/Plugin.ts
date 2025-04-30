import { Notice, type TAbstractFile } from 'obsidian';
import { PluginBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginBase';
import { CopyPathPluginSettingsManager } from './PluginSettingsManager.ts';
import { CopyPathPluginSettingsTab } from './PluginSettingsTab.ts';
import type { CopyPathPluginTypes } from './PluginTypes.ts';

export class CopyPathPlugin extends PluginBase<CopyPathPluginTypes> {
  protected override createSettingsTab(): CopyPathPluginSettingsTab {
    return new CopyPathPluginSettingsTab(this);
  }

  protected override createSettingsManager(): CopyPathPluginSettingsManager {
    return new CopyPathPluginSettingsManager(this);
  }

  protected override async onloadImpl(): Promise<void> {
    await super.onloadImpl();

    registerContextMenuItems(this);
  }
}

function registerContextMenuItems(plugin: CopyPathPlugin): void {
  plugin.registerEvent(
    plugin.app.workspace.on('file-menu', (menu, file) => {
      if (!plugin.settings.copyVaultPathContextItem) {
        return;
      }

      menu.addItem((item) => {
        item
          .setSection('info')
          .setTitle(`Copy vault path`)
          .setIcon('copy')
          .onClick(() => copyVaultPath(file));
      });
    })
  );

  plugin.registerEvent(
    plugin.app.workspace.on('file-menu', (menu, file) => {
      if (!plugin.settings.copyFullPathContextItem) {
        return;
      }

      menu.addItem((item) => {
        item
          .setSection('info')
          .setTitle(`Copy full path`)
          .setIcon('copy')
          .onClick(() => copyFullPath(file, plugin));
      });
    })
  );
}

// Is normalized.
function copyVaultPath(file: TAbstractFile): void {
  const vaultPath = file.path;
  navigator.clipboard.writeText(vaultPath);
  new Notice(`Copied vault path:\n${vaultPath}`, 2000);
}

function copyFullPath(file: TAbstractFile, plugin: CopyPathPlugin): void {
  const absolutePath = plugin.app.vault.adapter.getFullRealPath(file.path);
  navigator.clipboard.writeText(absolutePath);
  new Notice(`Copied full path:\n${absolutePath}`, 2000);
}
