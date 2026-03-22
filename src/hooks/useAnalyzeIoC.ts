import { useState } from 'preact/hooks';

export function useAnalyzeIoC() {
    const [data, setData] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const ioc = (formData.get('ioc-input') as string).trim();

        if (!ioc) {
            setData('');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/ctai?ioc=${ioc}`);
            const result = await response.json();
            setData(JSON.stringify(result, null, 2));
        } catch (error: any) {
            setData(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
        e.target.reset();
    };

    return { data, loading, handleSubmit };
}
