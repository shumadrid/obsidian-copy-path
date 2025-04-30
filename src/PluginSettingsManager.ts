import { PluginSettingsManagerBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginSettingsManagerBase';
import { CopyPathPluginSettings } from './PluginSettings.ts';
import type { CopyPathPluginTypes } from './PluginTypes.ts';

export class CopyPathPluginSettingsManager extends PluginSettingsManagerBase<CopyPathPluginTypes> {
  protected override createDefaultSettings(): CopyPathPluginSettings {
    return new CopyPathPluginSettings();
  }
}
