
import React, { useState } from 'react';
import { Delete, RotateCcw, Equal, Calculator as CalcIcon, Divide, X, Minus, Plus, Sparkles } from 'lucide-react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');

  const handleNumber = (num: string) => {
    setDisplay(display === '0' ? num : display + num);
    setExpression(expression + num);
  };

  const handleOperator = (op: string) => {
    setDisplay('0');
    // Ganti operator visual dengan operator JS
    let jsOp = op;
    if (op === '×') jsOp = '*';
    if (op === '÷') jsOp = '/';
    
    setExpression(expression + jsOp);
  };

  const calculate = () => {
    try {
      // Menggunakan Function constructor sebagai alternatif aman dari eval
      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + expression)();
      
      // Format hasil agar tidak terlalu panjang desimalnya
      const formattedResult = String(Math.round(result * 100000000) / 100000000);
      
      setDisplay(formattedResult);
      setExpression(formattedResult);
    } catch (error) {
      setDisplay('Error');
      setExpression('');
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
  };

  const deleteLast = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
      setExpression(expression.slice(0, -1));
    } else {
      setDisplay('0');
      setExpression(expression.slice(0, -1));
    }
  };

  const btnClass = "h-16 w-16 sm:h-20 sm:w-20 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold transition-all duration-300 active:scale-90 shadow-sm";
  const numClass = "bg-white/50 text-slate-800 hover:bg-white hover:shadow-md";
  const opClass = "bg-slate-200 text-slate-900 hover:bg-slate-300";
  const actionClass = "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-300";

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 bg-clean relative overflow-hidden flex items-center justify-center">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto max-w-md relative z-10">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-3 glass px-6 py-2 rounded-full mb-6">
            <CalcIcon size={16} className="text-slate-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Utility Tool</span>
          </div>
          <h2 className="font-artist text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            QUICK <span className="text-slate-400">MATH</span>
          </h2>
        </header>

        <div className="glass rounded-[3rem] p-8 shadow-2xl border-white/60 backdrop-blur-xl">
          {/* Display Area */}
          <div className="mb-8 text-right p-6 bg-slate-50 rounded-[2rem] shadow-inner border border-slate-100">
            <p className="text-xs text-slate-400 font-mono h-6 overflow-hidden">{expression || ' '}</p>
            <h3 className="font-artist text-5xl text-slate-900 font-black truncate tracking-tight">{display}</h3>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            <button onClick={clear} className={`${btnClass} ${opClass} text-red-500`}><RotateCcw size={20} /></button>
            <button onClick={deleteLast} className={`${btnClass} ${opClass}`}><Delete size={20} /></button>
            <button onClick={() => handleOperator('/')} className={`${btnClass} ${opClass}`}><Divide size={20} /></button>
            <button onClick={() => handleOperator('*')} className={`${btnClass} ${opClass}`}><X size={20} /></button>

            <button onClick={() => handleNumber('7')} className={`${btnClass} ${numClass}`}>7</button>
            <button onClick={() => handleNumber('8')} className={`${btnClass} ${numClass}`}>8</button>
            <button onClick={() => handleNumber('9')} className={`${btnClass} ${numClass}`}>9</button>
            <button onClick={() => handleOperator('-')} className={`${btnClass} ${opClass}`}><Minus size={20} /></button>

            <button onClick={() => handleNumber('4')} className={`${btnClass} ${numClass}`}>4</button>
            <button onClick={() => handleNumber('5')} className={`${btnClass} ${numClass}`}>5</button>
            <button onClick={() => handleNumber('6')} className={`${btnClass} ${numClass}`}>6</button>
            <button onClick={() => handleOperator('+')} className={`${btnClass} ${opClass}`}><Plus size={20} /></button>

            <button onClick={() => handleNumber('1')} className={`${btnClass} ${numClass}`}>1</button>
            <button onClick={() => handleNumber('2')} className={`${btnClass} ${numClass}`}>2</button>
            <button onClick={() => handleNumber('3')} className={`${btnClass} ${numClass}`}>3</button>
            
            {/* Equal Button Spans 2 Rows vertically if using grid-row, but simple grid here */}
            <button onClick={calculate} className={`${btnClass} ${actionClass} row-span-2 h-full rounded-[2rem]`}><Equal size={28} /></button>

            <button onClick={() => handleNumber('0')} className={`${btnClass} ${numClass} col-span-2 w-full`}>0</button>
            <button onClick={() => handleNumber('.')} className={`${btnClass} ${numClass}`}>.</button>
          </div>

          <div className="mt-8 text-center">
             <div className="inline-flex items-center gap-2 opacity-30">
                <Sparkles size={12} />
                <span className="text-[8px] font-black uppercase tracking-[0.3em]">Calculated by Hzell</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
    