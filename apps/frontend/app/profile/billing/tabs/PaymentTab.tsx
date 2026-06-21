"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { useAuthStore } from '../../../../store';

export function PaymentTab() {
  const { paymentMethods, setPaymentMethods, setDefaultPaymentMethod } = useAuthStore();

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvv: '', limit: 100, balance: 250 });
  const [editingCard, setEditingCard] = useState<any>(null);

  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear() % 100;

    paymentMethods.forEach(pm => {
      const [mStr, yStr] = pm.expiry.split('/');
      const m = parseInt(mStr, 10);
      const y = parseInt(yStr, 10);
      
      if (y < currentYear || (y === currentYear && m < currentMonth)) {
        toast.error(`Внимание: Срок действия вашей карты ${pm.type} (•••• ${pm.last4}) истек!`, {
          duration: 5000,
          icon: '⚠️',
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCardExpired = (expiry: string) => {
    const [m, y] = expiry.split('/').map(Number);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear() % 100;
    return y < currentYear || (y === currentYear && m < currentMonth);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setNewCard({ ...newCard, number: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length >= 3) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setNewCard({ ...newCard, expiry: val });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 4);
    setNewCard({ ...newCard, cvv: val });
  };

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numClean = newCard.number.replace(/\s/g, '');
    if (numClean.length !== 16) {
      toast.error('Номер карты должен состоять из 16 цифр.');
      return;
    }
    
    if (newCard.cvv.length < 3) {
      toast.error('CVV должен состоять из 3 или 4 цифр.');
      return;
    }
    
    if (newCard.expiry.length !== 5) {
      toast.error('Введите срок действия в формате MM/YY.');
      return;
    }
    
    const [month, year] = newCard.expiry.split('/');
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear() % 100;

    if (monthNum < 1 || monthNum > 12) {
      toast.error('Неверный месяц.');
      return;
    }

    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      toast.error('Эта карта уже просрочена.');
      return;
    }

    const type = numClean.startsWith('4') ? 'Visa' : 'Mastercard';
    const last4 = numClean.slice(-4);
    
    setPaymentMethods([...paymentMethods, {
      id: Date.now().toString(),
      type,
      last4,
      expiry: newCard.expiry,
      isDefault: paymentMethods.length === 0,
      limit: Number(newCard.limit),
      balance: Number(newCard.balance)
    }]);
    setAddModalOpen(false);
    setNewCard({ number: '', expiry: '', cvv: '', limit: 100, balance: 250 });
    toast.success('Карта успешно добавлена!');
  };

  const handleEditLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentMethods(paymentMethods.map(pm => pm.id === editingCard.id ? { ...pm, limit: Number(editingCard.limit) } : pm));
    setEditModalOpen(false);
    setEditingCard(null);
  };

  const handleRemoveCard = (id: string) => {
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
    toast.success('Карта удалена');
  };

  const transactions = [
    { id: '#INV-001', date: '21 Jun 2026', amount: '$29.00', method: 'Visa •••• 4242', status: 'Success', plan: 'Pro Creator' },
    { id: '#INV-002', date: '21 May 2026', amount: '$29.00', method: 'Visa •••• 4242', status: 'Success', plan: 'Pro Creator' },
    { id: '#INV-003', date: '15 May 2026', amount: '$15.00', method: 'Mastercard •••• 5555', status: 'Success', plan: 'Credits (1000)' },
    { id: '#INV-004', date: '21 Apr 2026', amount: '$29.00', method: 'Visa •••• 4242', status: 'Failed', plan: 'Pro Creator' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Block 7: Способы оплаты */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Способы оплаты</h2>
          <button onClick={() => setAddModalOpen(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            + Добавить карту
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {paymentMethods.map(pm => (
            <div key={pm.id} className="p-4 sm:p-5 border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 rounded-2xl flex flex-col justify-between min-h-[140px] relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2 items-center flex-wrap pr-2">
                  <div className="w-10 h-6 bg-slate-200 dark:bg-white/10 rounded-md flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white shrink-0">
                    {pm.type}
                  </div>
                  {pm.isDefault ? (
                    <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 px-2 py-0.5 rounded-full font-medium shrink-0">Основной</span>
                  ) : (
                    <button onClick={() => { setDefaultPaymentMethod(pm.id); toast.success('Основная карта изменена!'); }} className="text-[10px] bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-white px-2 py-0.5 rounded-full font-medium hover:bg-slate-300 dark:hover:bg-white/20 transition-colors shrink-0">Сделать основным</button>
                  )}
                  {isCardExpired(pm.expiry) && (
                    <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 px-2 py-0.5 rounded-full font-medium shrink-0">Просрочена</span>
                  )}
                  <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium shrink-0">Лимит: ${pm.limit}</span>
                  <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 px-2 py-0.5 rounded-full font-medium shrink-0">Баланс: ${pm.balance}</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => { setEditingCard(pm); setEditModalOpen(true); }} className="text-slate-400 hover:text-indigo-500 transition-colors" title="Изменить лимит">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  {!pm.isDefault && (
                    <button onClick={() => handleRemoveCard(pm.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Удалить карту">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-end mt-auto">
                <div>
                  <p className="text-xl font-mono text-slate-900 dark:text-white tracking-widest mt-1">•••• •••• •••• {pm.last4}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-gray-400 mb-0.5">Expires</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{pm.expiry}</p>
                </div>
              </div>
            </div>
          ))}
          
          <div onClick={() => setAddModalOpen(true)} className="p-5 border-2 border-dashed border-black/10 dark:border-white/10 bg-transparent rounded-2xl flex items-center justify-center min-h-[140px] cursor-pointer hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-500 dark:text-gray-400 group-hover:text-indigo-500">+ Добавить новый метод</p>
            </div>
          </div>
        </div>

        {/* Digital Wallets */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-black/10 dark:border-white/10">
          <button onClick={() => toast.success('Открывается Apple Pay...')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-semibold rounded-xl transition-colors">
            <svg viewBox="0 0 384 512" className="w-4 h-4 fill-current"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
            Pay
          </button>
          <button onClick={() => toast.success('Открывается Google Pay...')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-50 text-slate-700 border border-black/20 font-semibold rounded-xl transition-colors shadow-sm">
            <svg viewBox="0 0 488 512" className="w-4 h-4 fill-current text-[#4285F4]"><path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/></svg>
            Google Pay
          </button>
        </div>
      </div>

      {/* Block 4: История платежей */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">История платежей</h2>
        
        <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
          <table className="w-full text-sm text-left text-slate-600 dark:text-gray-300">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-gray-400 border-b border-black/10 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">ID платежа</th>
                <th className="px-6 py-4 font-semibold">Дата</th>
                <th className="px-6 py-4 font-semibold">Тариф / Продукт</th>
                <th className="px-6 py-4 font-semibold">Сумма</th>
                <th className="px-6 py-4 font-semibold">Метод</th>
                <th className="px-6 py-4 font-semibold">Статус</th>
                <th className="px-6 py-4 font-semibold text-right">Чек</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => (
                <tr key={idx} className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{tx.id}</td>
                  <td className="px-6 py-4">{tx.date}</td>
                  <td className="px-6 py-4">{tx.plan}</td>
                  <td className="px-6 py-4 font-medium">{tx.amount}</td>
                  <td className="px-6 py-4">{tx.method}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      tx.status === 'Success' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center justify-end gap-1 ml-auto">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Card Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 w-full max-w-md relative z-10 border border-black/10 dark:border-white/10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Добавить карту</h2>
              <form onSubmit={handleAddCardSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Номер карты</label>
                  <input required type="text" value={newCard.number} onChange={handleNumberChange} placeholder="0000 0000 0000 0000" className="w-full bg-slate-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Срок действия</label>
                    <input required type="text" value={newCard.expiry} onChange={handleExpiryChange} placeholder="MM/YY" className="w-full bg-slate-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">CVV</label>
                    <input required type="text" value={newCard.cvv} onChange={handleCvvChange} placeholder="123" className="w-full bg-slate-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Макс. лимит ($)</label>
                    <input required type="number" min="0" value={newCard.limit} onChange={e => setNewCard({...newCard, limit: Number(e.target.value)})} placeholder="100" className="w-full bg-slate-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Баланс карты ($)</label>
                    <input required type="number" min="0" value={newCard.balance} onChange={e => setNewCard({...newCard, balance: Number(e.target.value)})} placeholder="250" className="w-full bg-slate-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">Система не сможет списать с этой карты больше указанного лимита или при недостатке средств.</p>
                <div className="flex gap-3 mt-4">
                  <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">Сохранить</button>
                  <button type="button" onClick={() => setAddModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white text-sm font-medium rounded-lg transition-colors">Отмена</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Limit Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setEditModalOpen(false); setEditingCard(null); }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 w-full max-w-md relative z-10 border border-black/10 dark:border-white/10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Изменить лимит</h2>
              <p className="text-sm text-slate-600 dark:text-gray-300 mb-4">Карта: {editingCard.type} •••• {editingCard.last4}</p>
              <form onSubmit={handleEditLimitSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Новый лимит ($)</label>
                  <input required type="number" min="0" value={editingCard.limit} onChange={e => setEditingCard({...editingCard, limit: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">Сохранить</button>
                  <button type="button" onClick={() => { setEditModalOpen(false); setEditingCard(null); }} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white text-sm font-medium rounded-lg transition-colors">Отмена</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
