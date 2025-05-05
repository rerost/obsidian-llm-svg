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
    this.registerMarkdownCodeBlockProcessor('llm-svg', this.handleSampleCodeBlockProcessor.bind(this));
  }

  private async handleSampleCodeBlockProcessor(source: string, el: HTMLElement, _: MarkdownPostProcessorContext): Promise<void> {
    const sourceHash = hash(source)
    const loadingDiv = document.createElement('div')
    loadingDiv.setAttribute("class", "llm-svg-loading")
    loadingDiv.innerHTML = "SVG Generating..."
    el.appendChild(loadingDiv)

    const generator = new SVGGenerator(this.settings.apiKey)
    const svgCode = await generator.generateSVG(this.settings.model, source)

    const div = document.createElement('div')
    div.setAttribute("class", "llm-svg-" + sourceHash)
    div.innerHTML = svgCode

    el.appendChild(div);
    el.removeChild(loadingDiv)
  }
}

function hash(text: string): string {
  return createHash("sha256").update(text).digest("hex")
}
