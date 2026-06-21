"use client";
import React, { useState } from 'react';
import { useAuthStore } from '../../../../store';
import { motion, AnimatePresence } from 'framer-motion';

export function PlansTab() {
  const { planId, setPlanId, addCredits, chargeDefaultCard } = useAuthStore();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'PROMOCODE20') {
      setPromoApplied(true);
      setPromoError(false);
    } else if (promoCode.trim().toUpperCase() === 'FREE100') {
      addCredits(100);
      setPromoCode('');
      alert('Вам начислено 100 кредитов!');
    } else {
      setPromoError(true);
      setPromoApplied(false);
    }
  };

  const handleUpgrade = (planId: string, price: number) => {
    if (price > 0 && !chargeDefaultCard(price)) {
      alert(`Оплата отклонена: Недостаточно лимита на вашей основной карте для списания $${price}. Пожалуйста, увеличьте лимит карты или добавьте новую.`);
      return;
    }
    setPlanId(planId);
    alert('Тариф успешно изменен!');
  };

  const handleBuyCredits = (amount: number, price: number) => {
    if (!chargeDefaultCard(price)) {
      alert(`Оплата отклонена: Недостаточно лимита на вашей основной карте для списания $${price}. Пожалуйста, увеличьте лимит карты или добавьте новую.`);
      return;
    }
    addCredits(amount);
    alert('Кредиты успешно начислены!');
  };

  const plans = [
    { id: 'free', name: 'Free', price: '$0', priceNum: 0, credits: '100 / мес', models: 'Базовые', features: ['До 1 задачи', 'Стандартная скорость', 'Водяной знак'] },
    { id: 'starter', name: 'Starter', price: '$9', priceNum: 9, credits: '1000 / мес', models: 'Все', features: ['До 2 задач', 'Стандартная скорость', 'Без водяного знака'] },
    { id: 'pro', name: 'Pro Creator', price: '$29', priceNum: 29, credits: '5000 / мес', models: 'Все + Эксклюзив', features: ['До 5 задач', 'Высокая скорость', 'Коммерческая лицензия'] },
    { id: 'business', name: 'Business', price: '$99', priceNum: 99, credits: 'Безлимит', models: 'Все + Эксклюзив', features: ['До 20 задач', 'Макс. скорость', 'API доступ'] },
  ];

  const creditPackages = [
    { id: 'c500', credits: 500, price: '$8', priceNum: 8 },
    { id: 'c2000', credits: 2000, price: '$25', priceNum: 25 },
    { id: 'c5000', credits: 5000, price: '$60', priceNum: 60 },
  ];

  return (
    <div className="space-y-12">
      
      {/* Block 2: Доступные тарифы */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Доступные тарифы</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map(plan => {
            const isCurrent = plan.id === planId;
            return (
              <div 
                key={plan.id} 
                className={`relative flex flex-col p-6 rounded-2xl border ${isCurrent ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-500/5 shadow-sm' : 'border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]'}`}
              >
                {isCurrent && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Ваш тариф
                  </div>
                )}
                
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                  {plan.price !== '$0' && <span className="text-sm text-slate-500"> / мес</span>}
                </div>

                <div className="space-y-3 flex-1">
                  <div className="text-sm text-slate-700 dark:text-gray-300 border-b border-black/5 dark:border-white/5 pb-2">
                    <span className="font-semibold">{plan.credits}</span> кредитов
                  </div>
                  <div className="text-sm text-slate-700 dark:text-gray-300 border-b border-black/5 dark:border-white/5 pb-2">
                    <span className="font-semibold">{plan.models}</span>
                  </div>
                  <ul className="text-sm text-slate-600 dark:text-gray-400 space-y-2 mt-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-green-500 text-xs">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  {isCurrent ? (
                    <button className="w-full py-2 bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white text-sm font-medium rounded-lg cursor-default">
                      Текущий план
                    </button>
                  ) : (
                    <button onClick={() => handleUpgrade(plan.id, plan.priceNum)} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                      {plan.price === '$0' ? 'Downgrade' : 'Upgrade'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Block 3: Пополнение кредитов */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Разовое пополнение кредитов</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">Купленные кредиты не сгорают в конце месяца и расходуются в первую очередь.</p>
          
          <div className="grid grid-cols-2 gap-4">
            {creditPackages.map(pkg => (
              <div key={pkg.id} className="p-4 border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] rounded-xl flex items-center justify-between hover:border-indigo-500/50 transition-colors">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{pkg.credits}</p>
                  <p className="text-xs text-slate-500">кредитов</p>
                </div>
                <button onClick={() => handleBuyCredits(pkg.credits, pkg.priceNum)} className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-indigo-500 hover:text-white text-slate-900 dark:text-white text-sm font-medium rounded-lg transition-colors">
                  {pkg.price}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Block 5: Промокоды */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Активация промокода</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">Если у вас есть подарочный код или купон на скидку, введите его здесь.</p>
          
          <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 p-6 rounded-2xl">
            <div className="flex gap-3">
              <input 
                type="text" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="PROMOCODE20 или FREE100" 
                className="flex-1 bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2.5 text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:border-indigo-500" 
              />
              <button onClick={handleApplyPromo} className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                Применить
              </button>
            </div>
            
            {promoError && <p className="text-sm text-red-500 mt-3">Неверный или истекший промокод.</p>}

            <AnimatePresence>
              {promoApplied && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg flex justify-between items-center overflow-hidden">
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-400">Скидка 20% применена!</p>
                    <p className="text-xs text-green-700 dark:text-green-500 mt-0.5">Будет применена к следующему списанию.</p>
                  </div>
                  <span className="text-lg">🎉</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
