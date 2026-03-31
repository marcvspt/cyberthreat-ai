export default function IoCInputField() {
    return (
        <div className="relative flex-1">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary/80">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                    <path d="M10.5 18a7.5 7.5 0 1 1 5.303-2.197L21 21" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
            <input
                className="h-14 w-full rounded-2xl border border-primary/30 bg-white/8 pl-12 pr-4 text-base text-white shadow-sm outline-none transition placeholder:text-slate-400 focus:border-secondary focus:bg-white/10 focus:shadow-[0_0_0_4px_rgba(196,187,240,0.15)]"
                type="text"
                placeholder="Ejemplo: 8.8.8.8, 2001:4860:4860::8888, example.org o 44d88612fea8a8f36de82e1278abb02f"
                id="ioc-input"
                name="ioc-input"
                autoComplete="off"
            />
        </div>
    );
}
