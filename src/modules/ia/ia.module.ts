import { Global, Module } from '@nestjs/common';
import { IaService } from './ia.service';
import { AnthropicProvider } from './proveedores/anthropic.provider';
import { MockProvider } from './proveedores/mock.provider';
import { OpenAIProvider } from './proveedores/openai.provider';

/** Global: cualquier módulo puede inyectar IaService (bot, recomendador, resúmenes, campañas...). */
@Global()
@Module({
  providers: [MockProvider, OpenAIProvider, AnthropicProvider, IaService],
  exports: [IaService],
})
export class IaModule {}
