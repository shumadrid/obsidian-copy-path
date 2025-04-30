import type { PluginTypesBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginTypesBase';

import type { CopyPathPlugin } from './Plugin.ts';
import type { CopyPathPluginSettings } from './PluginSettings.ts';
import type { CopyPathPluginSettingsManager } from './PluginSettingsManager.ts';
import type { CopyPathPluginSettingsTab } from './PluginSettingsTab.ts';

export interface CopyPathPluginTypes extends PluginTypesBase {
  plugin: CopyPathPlugin;
  pluginSettings: CopyPathPluginSettings;
  pluginSettingsManager: CopyPathPluginSettingsManager;
  pluginSettingsTab: CopyPathPluginSettingsTab;
}
