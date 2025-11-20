import React from 'react';

interface OracleInputProps {
  question: string;
  setQuestion: (q: string) => void;
  disabled: boolean;
}

export const OracleInput: React.FC<OracleInputProps> = ({ question, setQuestion, disabled }) => {
  return (
    <div className="w-full max-w-md mx-auto mb-8 px-4">
      <label className="block text-purple-300 text-sm font-bold mb-2 tracking-wide">
        ASK THE ORACLE (OPTIONAL)
      </label>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        disabled={disabled}
        placeholder="Should I order pizza tonight?"
        className="w-full bg-slate-800/50 text-white border border-purple-500/30 rounded-xl py-3 px-4 leading-tight focus:outline-none focus:bg-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all shadow-inner placeholder-slate-500"
      />
    </div>
  );
};