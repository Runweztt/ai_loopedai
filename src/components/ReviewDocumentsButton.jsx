import React from 'react';

/**
 * Trigger button for the Visa Document Review feature.
 * Renders as a compact button in the chat toolbar.
 * Only activates the review flow on explicit user click.
 */
const ReviewDocumentsButton = ({ onClick, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title="Review my visa documents"
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-premium-gold/30 text-premium-gold hover:bg-premium-gold/10 transition-all text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Review My Documents
    </button>
  );
};

export default ReviewDocumentsButton;
