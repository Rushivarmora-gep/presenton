'use client';
import React, { useState, useEffect } from "react";
import Header from "../dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import { Settings, Key, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { handleSaveLLMConfig } from "@/utils/storeHelpers";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
    azure_openai: {
        title: "Azure OpenAI Configuration",
        description: "Required for using Azure OpenAI services",
        placeholder: "Enter your Azure OpenAI details",
    },
};

interface ProviderConfig {
    title: string;
    description: string;
    placeholder: string;
}

const SettingsPage = () => {
    const router = useRouter();

    const userConfigState = useSelector((state: RootState) => state.userConfig);
    const [llmConfig, setLlmConfig] = useState(userConfigState.llm_config);
    const canChangeKeys = userConfigState.can_change_keys;
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const input_field_changed = (new_value: string, field: string) => {
        if (field === 'azure_openai_endpoint') {
            setLlmConfig({ ...llmConfig, AZURE_OPENAI_ENDPOINT: new_value });
        } else if (field === 'azure_openai_api_key') {
            setLlmConfig({ ...llmConfig, AZURE_OPENAI_API_KEY: new_value });
        } else if (field === 'azure_openai_deployment') {
            setLlmConfig({ ...llmConfig, AZURE_OPENAI_DEPLOYMENT: new_value });
        } else if (field === 'azure_openai_api_version') {
            setLlmConfig({ ...llmConfig, AZURE_OPENAI_API_VERSION: new_value });
        }
    }

    const handleSaveConfig = async () => {
        try {
            await handleSaveLLMConfig(llmConfig);
            toast({
                title: 'Success',
                description: 'Configuration saved successfully',
            });
            setIsLoading(false);
            router.back();
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to save configuration',
                variant: 'destructive',
            });
            setIsLoading(false);
        }
    };

    const changeProvider = (provider: string) => {
        const newConfig = { ...llmConfig, LLM: provider };
        setLlmConfig(newConfig);
    }

    const resetDownloadingModel = () => {
        setDownloadingModel({
            name: '',
            size: null,
            downloaded: null,
            status: '',
            done: false,
        });
    }

    useEffect(() => {
        if (!canChangeKeys) {
            router.push("/dashboard");
        }
    }, []);

    useEffect(() => {
        setOllamaConfig();
    }, [useCustomOllamaUrl]);


    if (!canChangeKeys) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#E9E8F8] font-instrument_sans">
            <Header />
            <Wrapper className="lg:w-[80%]">
                <div className="py-8 space-y-6">
                    {/* Settings Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <Settings className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                    </div>

                    {/* API Configuration Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Key className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-medium text-gray-900">API Configuration</h2>
                        </div>

                        {/* Provider Selection */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Select AI Provider
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.keys(PROVIDER_CONFIGS).map((provider) => (
                                    <button
                                        key={provider}
                                        onClick={() => changeProvider(provider)}
                                        className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${llmConfig.LLM === provider
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-3">
                                            <span
                                                className={`font-medium text-center ${llmConfig.LLM === provider
                                                    ? "text-blue-700"
                                                    : "text-gray-700"
                                                    }`}
                                            >
                                                {provider === 'openai' ? 'OpenAI' : provider.charAt(0).toUpperCase() + provider.slice(1)}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Azure OpenAI Configuration */}
                        {llmConfig.LLM === 'azure_openai' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint</label>
                                    <input
                                        type="text"
                                        value={llmConfig.AZURE_OPENAI_ENDPOINT || ''}
                                        onChange={(e) => input_field_changed(e.target.value, 'azure_openai_endpoint')}
                                        className="w-full px-4 py-2.5 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        placeholder="https://your-endpoint.openai.azure.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                                    <input
                                        type="text"
                                        value={llmConfig.AZURE_OPENAI_API_KEY || ''}
                                        onChange={(e) => input_field_changed(e.target.value, 'azure_openai_api_key')}
                                        className="w-full px-4 py-2.5 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        placeholder="Enter your API key"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Deployment Name</label>
                                    <input
                                        type="text"
                                        value={llmConfig.AZURE_OPENAI_DEPLOYMENT || ''}
                                        onChange={(e) => input_field_changed(e.target.value, 'azure_openai_deployment')}
                                        className="w-full px-4 py-2.5 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        placeholder="Your deployment"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">API Version</label>
                                    <input
                                        type="text"
                                        value={llmConfig.AZURE_OPENAI_API_VERSION || ''}
                                        onChange={(e) => input_field_changed(e.target.value, 'azure_openai_api_version')}
                                        className="w-full px-4 py-2.5 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        placeholder="2024-02-15-preview"
                                    />
                                </div>
                            </div>
                        )}

                        


                        {/* Save Button */}
                        <button
                            onClick={handleSaveConfig}
                            disabled={isLoading}
                            className={`mt-8 w-full font-semibold py-3 px-4 rounded-lg transition-all duration-500 ${isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200'
                                } text-white`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {'Saving Configuration...'}
                                </div>
                            ) : (
                                'Save Configuration'
                            )}
                        </button>

                    </div>
                </div>
            </Wrapper>
        </div>
    );
};

export default SettingsPage;
