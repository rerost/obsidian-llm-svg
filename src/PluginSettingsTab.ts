import { PluginSettingsTabBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginSettingsTabBase';
import { SettingEx } from 'obsidian-dev-utils/obsidian/SettingEx';

import type { PluginTypes } from './PluginTypes.ts';
import { SVGGenerator } from './llm.ts';

export class PluginSettingsTab extends PluginSettingsTabBase<PluginTypes> {
  private svgGenerator: SVGGenerator | null = null;

  public override display(): void {
    super.display();
    this.containerEl.empty();
    this.svgGenerator = new SVGGenerator(this.plugin.settings.apiKey);

    new SettingEx(this.containerEl)
      .setName('OpenAI API Key')
      .setDesc('Set API Key. sk-...')
      .addText((text) => {
        this.bind(text, 'apiKey');
      });

    new SettingEx(this.containerEl)
      .setName('Model')
      .setDesc('Set Model.')
      .addDropdown((dropdown) => {
        dropdown.setDisabled(false);
        this.svgGenerator?.availableModels().then((models) => {
          models.forEach((model) => {
            dropdown.addOption(model, model);
          });
          if (models.includes('gpt-4o')) {
            dropdown.setValue('gpt-4o');
          }
        });
        this.bind(dropdown, 'model');
      });
  }
}
