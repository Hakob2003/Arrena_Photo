"use client";
import React, { useState } from 'react';
import { useAuthStore } from '../../../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useTranslation } from '../../../../lib/i18n';
import { useUIStore } from '../../../../store';

export function PlansTab() {
  const { planId, setPlanId, addCredits, chargeDefaultCard } = useAuthStore();
  const { t } = useTranslation();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);
  const isLuxury = useUIStore(state => state.skin === 'LUXURY');

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'PROMOCODE20') {
      setPromoApplied(true);
      setPromoError(false);
      toast.success(t('billing.plans.promoApplied'));
    } else if (promoCode.trim().toUpperCase() === 'FREE100') {
      addCredits(100);
      setPromoCode('');
      toast.success(t('billing.plans.free100'));
    } else {
      setPromoError(true);
      setPromoApplied(false);
      toast.error(t('billing.plans.promoError'));
    }
  };

  const handleUpgrade = async (planId: string, price: number) => {
    if (price > 0) {
      const res = await chargeDefaultCard(price, `Plan payment ${planId}`);
      if (!res.success) {
        toast.error(res.error || t('billing.plans.paymentError'));
        return;
      }
    }
    setPlanId(planId);
    toast.success(t('billing.plans.upgradeSuccess'));
  };

  const handleBuyCredits = async (amount: number, price: number) => {
    const res = await chargeDefaultCard(price, `Buy ${amount} credits`);
    if (!res.success) {
      toast.error(res.error || t('billing.plans.paymentError'));
      return;
    }
    addCredits(amount);
    toast.success(t('billing.plans.creditsSuccess'));
  };

  const plans = [
    { id: 'free', name: 'Free', price: '$0', priceNum: 0, credits: `100 ${t('billing.plans.perMonth')}`, models: 'Basic', features: ['Up to 1 task', 'Standard speed', 'Watermark'] },
    { id: 'starter', name: 'Starter', price: '$9', priceNum: 9, credits: `1000 ${t('billing.plans.perMonth')}`, models: 'All', features: ['Up to 2 tasks', 'Standard speed', 'No watermark'] },
    { id: 'pro', name: 'Pro Creator', price: '$29', priceNum: 29, credits: `5000 ${t('billing.plans.perMonth')}`, models: 'All + Exclusive', features: ['Up to 5 tasks', 'High speed', 'Commercial license'] },
    { id: 'business', name: 'Business', price: '$99', priceNum: 99, credits: 'Unlimited', models: 'All + Exclusive', features: ['Up to 20 tasks', 'Max speed', 'API access'] },
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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('billing.plans.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map(plan => {
            const isCurrent = plan.id === planId;
            return (
              <div 
                key={plan.id} 
                className={`relative flex flex-col p-6 rounded-2xl border ${isCurrent ? (isLuxury ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-sm' : 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-500/5 shadow-sm') : 'border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]'}`}
              >
                {isCurrent && (
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${isLuxury ? 'bg-[#D4AF37] text-black' : 'bg-indigo-500 text-white'}`}>
                    {t('billing.plans.yourPlan')}
                  </div>
                )}
                
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                  {plan.price !== '$0' && <span className="text-sm text-slate-500"> {t('billing.plans.perMonth')}</span>}
                </div>

                <div className="space-y-3 flex-1">
                  <div className="text-sm text-slate-700 dark:text-gray-300 border-b border-black/5 dark:border-white/5 pb-2">
                    <span className="font-semibold">{plan.credits}</span>
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
                      {t('billing.plans.currentPlan')}
                    </button>
                  ) : (
                    <button onClick={() => handleUpgrade(plan.id, plan.priceNum)} className={`w-full py-2 text-sm font-medium rounded-lg transition-colors ${
                      isLuxury ? 'bg-[#D4AF37] hover:bg-[#C5A028] text-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}>
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('billing.plans.buyCredits')}</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">{t('billing.plans.buyCreditsDesc')}</p>
          
          <div className="grid grid-cols-2 gap-4">
            {creditPackages.map(pkg => (
              <div key={pkg.id} className={`p-4 border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] rounded-xl flex items-center justify-between transition-colors ${isLuxury ? 'hover:border-[#D4AF37]/50' : 'hover:border-indigo-500/50'}`}>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{pkg.credits}</p>
                  <p className="text-xs text-slate-500">{t('billing.plans.credits')}</p>
                </div>
                <button onClick={() => handleBuyCredits(pkg.credits, pkg.priceNum)} className={`px-4 py-2 bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white text-sm font-medium rounded-lg transition-colors ${
                  isLuxury ? 'hover:bg-[#D4AF37] hover:text-black' : 'hover:bg-indigo-500 hover:text-white'
                }`}>
                  {pkg.price}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Block 5: Промокоды */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('billing.plans.promoTitle')}</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">{t('billing.plans.promoDesc')}</p>
          
          <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 p-6 rounded-2xl">
            <div className="flex gap-3">
              <input 
                type="text" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="PROMOCODE20" 
                className={`flex-1 bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2.5 text-slate-900 dark:text-white font-mono uppercase focus:outline-none ${isLuxury ? 'focus:border-[#D4AF37]' : 'focus:border-indigo-500'}`} 
              />
              <button onClick={handleApplyPromo} className={`px-6 text-sm font-medium rounded-lg transition-colors ${isLuxury ? 'bg-[#D4AF37] hover:bg-[#C5A028] text-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                {t('billing.plans.apply')}
              </button>
            </div>
            
            {promoError && <p className="text-sm text-red-500 mt-3">{t('billing.plans.promoError')}</p>}

            <AnimatePresence>
              {promoApplied && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg flex justify-between items-center overflow-hidden">
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-400">{t('billing.plans.promoDiscount')}</p>
                    <p className="text-xs text-green-700 dark:text-green-500 mt-0.5">{t('billing.plans.promoNext')}</p>
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
