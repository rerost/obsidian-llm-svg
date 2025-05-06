import type { MarkdownPostProcessorContext } from 'obsidian';

import { PluginBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginBase';

import type { PluginTypes } from './PluginTypes.ts';

import { PluginSettingsManager } from './PluginSettingsManager.ts';
import { PluginSettingsTab } from './PluginSettingsTab.ts';
import { SVGGenerator } from './llm.ts';
import { createHash } from 'crypto';

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
    this.registerMarkdownCodeBlockProcessor('llm-svg', this.handleCodeBlockProcessor.bind(this));
  }

  private async handleCodeBlockProcessor(source: string, el: HTMLElement, _: MarkdownPostProcessorContext): Promise<void> {
    const sourceHash = hash(source)
    const target = el.createEl('div')
    const loadingDiv = target.createEl('div', { text: "SVG Generating...", cls: "llm-svg-loading" })

    const generator = new SVGGenerator(this.settings.apiKey)
    const svgCode = await generator.generateSVG(this.settings.model, source)

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgCode, "image/svg+xml");
    const svgElement = svgDoc.documentElement;

    const div = target.createEl('div', { cls: "llm-svg-" + sourceHash })
    div.appendChild(svgElement);

    el.appendChild(div);
    el.removeChild(loadingDiv)
  }
}

function hash(text: string): string {
  return createHash("sha256").update(text).digest("hex")
}
