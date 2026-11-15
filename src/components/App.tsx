import { useRef, useState } from 'react';
import { useAnalyzeIoC } from '@/lib/ui/useAnalyzeIoC.ts';
import { useApiKeys } from '@/lib/ui/useApiKeys.ts';
import IoCSearchForm from '@/components/IoCSearchForm.tsx';
import AIResponsePanel from '@/components/AIResponsePanel.tsx';
import ApiKeysModal from '@/components/ApiKeysModal.tsx';

export default function App() {
    const { keys, saveKeys, hasCustomKeys } = useApiKeys();
    const { data, error, loading, status, meta, selectedModel, setSelectedModel, handleSubmit, cancelAnalysis } = useAnalyzeIoC(keys);
    const [modalOpen, setModalOpen] = useState(false);
    const settingsTrigger = useRef<HTMLButtonElement | null>(null);

    return (
        <section className="flex w-full flex-col items-center gap-6 py-6 sm:px-6">
            <IoCSearchForm
                loading={loading}
                onSubmit={handleSubmit}
                onCancel={cancelAnalysis}
                hasCustomKeys={hasCustomKeys}
                onOpenSettings={(trigger) => {
                    settingsTrigger.current = trigger;
                    setModalOpen(true);
                }}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
            />
            <AIResponsePanel data={data} error={error} loading={loading} status={status} meta={meta} />
            {modalOpen && (
                <ApiKeysModal
                    keys={keys}
                    onSave={saveKeys}
                    onClose={() => {
                        setModalOpen(false);
                        settingsTrigger.current?.focus();
                    }}
                />
            )}
        </section>
    );
}
