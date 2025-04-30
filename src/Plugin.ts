import type { TAbstractFile } from 'obsidian';

import { Notice } from 'obsidian';
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

    registerContextMenuItems(this);
  }
}

async function copyFullPath(
  file: TAbstractFile,
  plugin: CopyPathPlugin
): Promise<void> {
  const absolutePath = plugin.app.vault.adapter.getFullRealPath(file.path);
  await navigator.clipboard.writeText(absolutePath);
  // eslint-disable-next-line no-magic-numbers
  new Notice(`Copied full path:\n${absolutePath}`, 2000);
}

// Is normalized.
async function copyVaultPath(file: TAbstractFile): Promise<void> {
  const vaultPath = file.path;
  await navigator.clipboard.writeText(vaultPath);
  // eslint-disable-next-line no-magic-numbers
  new Notice(`Copied vault path:\n${vaultPath}`, 2000);
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
          .setTitle('Copy vault path')
          .setIcon('copy')
          .onClick(async () => {
            await copyVaultPath(file);
          });
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
          .setTitle('Copy full path')
          .setIcon('copy')
          .onClick(async () => {
            await copyFullPath(file, plugin);
          });
      });
    })
  );
}
