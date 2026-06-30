import { useState } from 'react';
import { useAnalyzeIoC } from '@/hooks/useAnalyzeIoC.ts';
import { useApiKeys } from '@/hooks/useApiKeys.ts';
import IoCSearchForm from '@/components/IoCSearchForm.tsx';
import AIResponsePanel from '@/components/AIResponsePanel.tsx';
import ApiKeysModal from '@/components/ApiKeysModal.tsx';

export default function App() {
    const { keys, saveKeys, hasCustomKeys } = useApiKeys();
    const { data, loading, status, meta, selectedModel, setSelectedModel, handleSubmit } = useAnalyzeIoC(keys);
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <section className="flex w-full flex-col items-center gap-6 p-6">
            <IoCSearchForm
                loading={loading}
                onSubmit={handleSubmit}
                hasCustomKeys={hasCustomKeys}
                onOpenSettings={() => setModalOpen(true)}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
            />
            <AIResponsePanel data={data} loading={loading} status={status} meta={meta} />
            <ApiKeysModal
                isOpen={modalOpen}
                keys={keys}
                onSave={saveKeys}
                onClose={() => setModalOpen(false)}
            />
        </section>
    );
}
