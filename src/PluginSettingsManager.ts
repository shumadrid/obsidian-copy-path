import { PluginSettingsManagerBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginSettingsManagerBase';

import type { CopyPathPluginTypes } from './PluginTypes.ts';

import { CopyPathPluginSettings } from './PluginSettings.ts';

export class CopyPathPluginSettingsManager extends PluginSettingsManagerBase<CopyPathPluginTypes> {
  protected override createDefaultSettings(): CopyPathPluginSettings {
    return new CopyPathPluginSettings();
  }
}
