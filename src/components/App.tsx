import { useAnalyzeIoC } from '@/hooks/useAnalyzeIoC.ts';
import LoaderSpinner from '@/components/LoaderSpinner.tsx';

export default function App() {
    const { data, loading, handleSubmit } = useAnalyzeIoC();

    return (
        <section className="flex flex-col items-center gap-4 p-6">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    className="border border-primary rounded-xl h-10 w-100 px-4 py-2 focus:outline-none focus:border-blue-500 focus:shadow-lg transition shadow-sm"
                    type="text"
                    placeholder="Ingresa un IoC (IP, dominio o hash)"
                    id="ioc-input"
                    name="ioc-input"
                />
                <button
                    type="submit"
                    className="bg-primary text-white rounded-xl px-6 py-2 hover:bg-secondary transition-colors shadow-sm"
                    disabled={loading}
                >
                    Buscar
                </button>
            </form>
            {loading ? (
                <LoaderSpinner />
            ) : (
                <pre className="bg-primary/30 text-gray-100 p-4 rounded-lg max-w-2xl overflow-auto">
                    <code>{data}</code>
                </pre>
            )}
        </section>
    );
}
