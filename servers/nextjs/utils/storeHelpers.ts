import { setLLMConfig } from "@/store/slices/userConfig";
import { store } from "@/store/store";

export const handleSaveLLMConfig = async (llmConfig: LLMConfig) => {
  if (!hasValidLLMConfig(llmConfig)) {
    throw new Error('Provided configuration is not valid');
  }

  await fetch('/api/user-config', {
    method: 'POST',
    body: JSON.stringify(llmConfig)
  });

  store.dispatch(setLLMConfig(llmConfig));
}

export const hasValidLLMConfig = (llmConfig: LLMConfig) => {
  if (!llmConfig.LLM) return false;
  const OPENAI_API_KEY = llmConfig.OPENAI_API_KEY;
  const GOOGLE_API_KEY = llmConfig.GOOGLE_API_KEY;
  const AZURE_API_KEY = llmConfig.AZURE_OPENAI_API_KEY;
  const AZURE_ENDPOINT = llmConfig.AZURE_OPENAI_ENDPOINT;
  const AZURE_DEPLOYMENT = llmConfig.AZURE_OPENAI_DEPLOYMENT;

  const isOllamaConfigValid = llmConfig.OLLAMA_MODEL !== '' && llmConfig.OLLAMA_MODEL !== null && llmConfig.OLLAMA_MODEL !== undefined && llmConfig.OLLAMA_URL !== '' && llmConfig.OLLAMA_URL !== null && llmConfig.OLLAMA_URL !== undefined;
  const isCustomConfigValid = llmConfig.CUSTOM_LLM_URL !== '' && llmConfig.CUSTOM_LLM_URL !== null && llmConfig.CUSTOM_LLM_URL !== undefined && llmConfig.CUSTOM_MODEL !== '' && llmConfig.CUSTOM_MODEL !== null && llmConfig.CUSTOM_MODEL !== undefined;

  return llmConfig.LLM === 'openai' ?
    OPENAI_API_KEY !== '' && OPENAI_API_KEY !== null && OPENAI_API_KEY !== undefined :
    llmConfig.LLM === 'azure' ?
      AZURE_API_KEY !== '' && AZURE_ENDPOINT !== '' && AZURE_DEPLOYMENT !== '' &&
      AZURE_API_KEY !== null && AZURE_ENDPOINT !== null && AZURE_DEPLOYMENT !== null :
      llmConfig.LLM === 'google' ?
        GOOGLE_API_KEY !== '' && GOOGLE_API_KEY !== null && GOOGLE_API_KEY !== undefined :
        llmConfig.LLM === 'ollama' ? isOllamaConfigValid :
          llmConfig.LLM === 'custom' ? isCustomConfigValid : false;
}