import type { MarkdownPostProcessorContext } from 'obsidian';

import { PluginBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginBase';

import type { PluginTypes } from './PluginTypes.ts';

import { PluginSettingsManager } from './PluginSettingsManager.ts';
import { PluginSettingsTab } from './PluginSettingsTab.ts';

export class Plugin extends PluginBase<PluginTypes> {
  protected override createSettingsManager(): PluginSettingsManager {
    return new PluginSettingsManager(this);
  }

  protected override createSettingsTab(): null | PluginSettingsTab {
    return new PluginSettingsTab(this);
  }

  protected override async onLayoutReady(): Promise<void> {
    await super.onLayoutReady();
  }

  protected override async onloadImpl(): Promise<void> {
    await super.onloadImpl();
    this.registerMarkdownCodeBlockProcessor('llm-svg', this.handleSampleCodeBlockProcessor.bind(this));
  }

  private handleSampleCodeBlockProcessor(source: string, el: HTMLElement, _: MarkdownPostProcessorContext): void {
    console.log(source);
    el.setText(source);
  }
}
