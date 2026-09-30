/** A ruled notebook page: the Fieldbook mark. */
export function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <rect x="1" y="1" width="20" height="20" rx="4" fill="#2b5bd7" />
      <path d="M6 1v20" stroke="#15233b" strokeOpacity=".35" strokeWidth="1.5" />
      <path d="M9 7h8M9 11h8M9 15h5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
