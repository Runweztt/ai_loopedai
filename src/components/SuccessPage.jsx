import React from 'react';

const SuccessPage = ({ userData, onProceed }) => {
  return (
    <div className="glass rounded-3xl p-6 md:p-10 shadow-2xl text-center">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-3xl font-bold mb-4">Welcome aboard!</h2>
      <p className="text-white/60 mb-8">
        Your account for <span className="text-white font-medium">{userData?.full_name}</span> has been created successfully.
      </p>

      <div className="mt-12">
        <button onClick={onProceed} className="text-white/40 hover:text-white transition-all text-sm font-medium">
          Proceed to Dashboard &rarr;
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
