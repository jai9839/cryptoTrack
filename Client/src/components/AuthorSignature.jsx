/** Fixed author mark — bottom corner, not selectable */
const AuthorSignature = () => (
	<div
		className="author-signature fixed bottom-3 right-3 z-[100] flex flex-col items-end gap-0.5 pointer-events-none select-none"
		aria-hidden="true"
		title="CryptoTrack by ak"
	>
		<span
			className="font-serif text-2xl sm:text-3xl font-bold italic tracking-tight text-blue-700/40 dark:text-blue-400/35"
			style={{ fontFamily: "'Segoe Script', 'Brush Script MT', cursive" }}
		>
			ak
		</span>
		<span className="text-[9px] uppercase tracking-[0.2em] text-gray-400/70 dark:text-gray-500/60">
			© ak · CryptoTrack
		</span>
	</div>
);

export default AuthorSignature;
