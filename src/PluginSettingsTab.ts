import { PluginSettingsTabBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginSettingsTabBase';
import { SettingEx } from 'obsidian-dev-utils/obsidian/SettingEx';

import type { CopyPathPluginTypes } from './PluginTypes.ts';

export class CopyPathPluginSettingsTab extends PluginSettingsTabBase<CopyPathPluginTypes> {
  public override display(): void {
    super.display();
    this.containerEl.empty();

    new SettingEx(this.containerEl)
      .setName('"Copy vault path" context menu action')
      .addToggle((toggle) => {
        this.bind(toggle, 'copyVaultPathContextItem');
      });

    new SettingEx(this.containerEl)
      .setName('"Copy full path" context menu action')
      .addToggle((toggle) => {
        this.bind(toggle, 'copyFullPathContextItem');
      });

    new SettingEx(this.containerEl)
      .setName('Add trailing slash to folder paths')
      .setDesc(
        'When copying folder paths, append a trailing slash to distinguish them from files'
      )
      .addToggle((toggle) => {
        this.bind(toggle, 'addTrailingSlashToFolders');
      });
  }
}
